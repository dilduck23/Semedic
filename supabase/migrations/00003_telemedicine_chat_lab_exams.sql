-- ============================================================
-- Semedic - Phase 5: Telemedicine, Chat, Lab & Exam Orders
-- ============================================================

-- New enum types
CREATE TYPE chat_message_type AS ENUM ('text', 'file', 'system');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE video_session_status AS ENUM ('waiting', 'active', 'completed', 'cancelled');

-- Extend notification_type for new events
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'lab_results_ready';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'exam_results_ready';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'video_session_starting';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'chat_message';

-- ============================================================
-- CHAT ROOMS
-- ============================================================
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_rooms_patient ON public.chat_rooms(patient_id);
CREATE INDEX idx_chat_rooms_doctor ON public.chat_rooms(doctor_id);

CREATE TRIGGER chat_rooms_updated_at BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type chat_message_type NOT NULL DEFAULT 'text',
  content TEXT NOT NULL DEFAULT '',
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_room ON public.chat_messages(room_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX idx_messages_unread ON public.chat_messages(room_id, is_read) WHERE is_read = false;

-- ============================================================
-- VIDEO SESSIONS
-- ============================================================
CREATE TABLE public.video_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  room_url TEXT NOT NULL,
  host_token TEXT,
  participant_token TEXT,
  status video_session_status NOT NULL DEFAULT 'waiting',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER video_sessions_updated_at BEFORE UPDATE ON public.video_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- LAB TEST TYPES (Catalog)
-- ============================================================
CREATE TABLE public.lab_test_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  preparation_instructions TEXT,
  results_time_hours INTEGER NOT NULL DEFAULT 24,
  icon_name TEXT NOT NULL DEFAULT 'science',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lab_test_types_category ON public.lab_test_types(category);

-- ============================================================
-- LAB ORDERS
-- ============================================================
CREATE TABLE public.lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_test_type_id UUID NOT NULL REFERENCES public.lab_test_types(id) ON DELETE RESTRICT,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  results_url TEXT,
  results_available_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lab_orders_patient ON public.lab_orders(patient_id);
CREATE INDEX idx_lab_orders_status ON public.lab_orders(status);

CREATE TRIGGER lab_orders_updated_at BEFORE UPDATE ON public.lab_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- EXAM TYPES (Catalog)
-- ============================================================
CREATE TABLE public.exam_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  preparation_instructions TEXT,
  results_time_hours INTEGER NOT NULL DEFAULT 48,
  icon_name TEXT NOT NULL DEFAULT 'biotech',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exam_types_category ON public.exam_types(category);

-- ============================================================
-- EXAM ORDERS
-- ============================================================
CREATE TABLE public.exam_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type_id UUID NOT NULL REFERENCES public.exam_types(id) ON DELETE RESTRICT,
  center_id UUID NOT NULL REFERENCES public.medical_centers(id) ON DELETE RESTRICT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  results_url TEXT,
  results_available_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exam_orders_patient ON public.exam_orders(patient_id);
CREATE INDEX idx_exam_orders_status ON public.exam_orders(status);

CREATE TRIGGER exam_orders_updated_at BEFORE UPDATE ON public.exam_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Chat Rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their chat rooms" ON public.chat_rooms
  FOR SELECT USING (
    auth.uid() = patient_id
    OR auth.uid() IN (SELECT user_id FROM public.doctors WHERE id = doctor_id)
  );

CREATE POLICY "Patients can create chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Chat Messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages" ON public.chat_messages
  FOR SELECT USING (
    room_id IN (
      SELECT id FROM public.chat_rooms
      WHERE patient_id = auth.uid()
      OR doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND room_id IN (
      SELECT id FROM public.chat_rooms
      WHERE patient_id = auth.uid()
      OR doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Participants can mark messages as read" ON public.chat_messages
  FOR UPDATE USING (
    room_id IN (
      SELECT id FROM public.chat_rooms
      WHERE patient_id = auth.uid()
      OR doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
    )
  );

-- Video Sessions
ALTER TABLE public.video_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their video sessions" ON public.video_sessions
  FOR SELECT USING (
    appointment_id IN (
      SELECT id FROM public.appointments WHERE patient_id = auth.uid()
    )
    OR appointment_id IN (
      SELECT a.id FROM public.appointments a
      JOIN public.doctors d ON d.id = a.doctor_id
      WHERE d.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create video sessions" ON public.video_sessions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update video sessions" ON public.video_sessions
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Lab Test Types (public read)
ALTER TABLE public.lab_test_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lab test types are viewable by everyone" ON public.lab_test_types
  FOR SELECT USING (is_active = true);

-- Lab Orders
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can view own lab orders" ON public.lab_orders
  FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients can create lab orders" ON public.lab_orders
  FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can update own lab orders" ON public.lab_orders
  FOR UPDATE USING (auth.uid() = patient_id);

-- Exam Types (public read)
ALTER TABLE public.exam_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exam types are viewable by everyone" ON public.exam_types
  FOR SELECT USING (is_active = true);

-- Exam Orders
ALTER TABLE public.exam_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can view own exam orders" ON public.exam_orders
  FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients can create exam orders" ON public.exam_orders
  FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can update own exam orders" ON public.exam_orders
  FOR UPDATE USING (auth.uid() = patient_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create chat room for virtual appointments
CREATE OR REPLACE FUNCTION public.create_chat_room_for_virtual()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'virtual' AND NEW.status IN ('pending', 'confirmed') THEN
    INSERT INTO public.chat_rooms (appointment_id, patient_id, doctor_id)
    VALUES (NEW.id, NEW.patient_id, NEW.doctor_id)
    ON CONFLICT (appointment_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_virtual_appointment_created
  AFTER INSERT ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.create_chat_room_for_virtual();

-- Notify when lab results are ready
CREATE OR REPLACE FUNCTION public.notify_lab_results()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.results_url IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.patient_id,
      'lab_results_ready',
      'Resultados de Laboratorio Disponibles',
      'Tus resultados de laboratorio ya estan listos para descargar.',
      jsonb_build_object('lab_order_id', NEW.id, 'results_url', NEW.results_url)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_lab_results_ready
  AFTER UPDATE ON public.lab_orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_lab_results();

-- Notify when exam results are ready
CREATE OR REPLACE FUNCTION public.notify_exam_results()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.results_url IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.patient_id,
      'exam_results_ready',
      'Resultados de Examen Disponibles',
      'Tus resultados de examen ya estan listos para descargar.',
      jsonb_build_object('exam_order_id', NEW.id, 'results_url', NEW.results_url)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_exam_results_ready
  AFTER UPDATE ON public.exam_orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_exam_results();

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE video_sessions;

-- ============================================================
-- SEED DATA: Lab Test Types
-- ============================================================
INSERT INTO public.lab_test_types (name, description, category, price, preparation_instructions, results_time_hours, icon_name, sort_order) VALUES
  ('Hemograma Completo', 'Analisis completo de celulas sanguineas: globulos rojos, blancos y plaquetas.', 'Sangre', 25.00, 'Ayuno de 8 horas. No realizar ejercicio intenso 24 horas antes.', 24, 'bloodtype', 1),
  ('Glucosa en Ayunas', 'Medicion de niveles de azucar en sangre.', 'Sangre', 15.00, 'Ayuno de 8-12 horas. Solo agua.', 12, 'glucose', 2),
  ('Perfil Lipidico', 'Colesterol total, HDL, LDL y trigliceridos.', 'Sangre', 35.00, 'Ayuno de 12 horas. Evitar alcohol 48 horas antes.', 24, 'monitoring', 3),
  ('Perfil Tiroideo', 'TSH, T3 y T4 libre.', 'Hormonal', 45.00, 'No requiere ayuno. Informar si toma medicamentos tiroideos.', 48, 'science', 4),
  ('Examen General de Orina', 'Analisis fisico, quimico y microscopico de orina.', 'Orina', 15.00, 'Recoger primera orina de la manana. Higiene genital previa.', 12, 'water_drop', 5),
  ('Urocultivo', 'Cultivo de orina para detectar infecciones.', 'Orina', 30.00, 'Recoger muestra de mitad de chorro. No usar antibioticos 48h antes.', 72, 'biotech', 6),
  ('Perfil Hepatico', 'ALT, AST, bilirrubinas, fosfatasa alcalina, albumina.', 'Sangre', 40.00, 'Ayuno de 8 horas. Evitar alcohol 48 horas antes.', 24, 'science', 7),
  ('Hemoglobina Glicosilada', 'Control de diabetes: promedio de glucosa en 3 meses.', 'Sangre', 25.00, 'No requiere ayuno.', 24, 'glucose', 8),
  ('Vitamina D', 'Medicion de niveles de vitamina D en sangre.', 'Sangre', 35.00, 'No requiere ayuno.', 48, 'wb_sunny', 9),
  ('PSA (Antigeno Prostatico)', 'Marcador para salud prostatica.', 'Sangre', 30.00, 'Ayuno de 4 horas. No relaciones sexuales 48h antes.', 48, 'male', 10),
  ('Testosterona Total', 'Medicion de niveles hormonales.', 'Hormonal', 40.00, 'Muestra en la manana (7-10 AM). Ayuno de 8 horas.', 48, 'science', 11),
  ('Perfil Renal', 'Creatinina, BUN, acido urico, electrolitos.', 'Sangre', 35.00, 'Ayuno de 8 horas.', 24, 'nephrology', 12);

-- ============================================================
-- SEED DATA: Exam Types
-- ============================================================
INSERT INTO public.exam_types (name, description, category, price, preparation_instructions, results_time_hours, icon_name, sort_order) VALUES
  ('Rayos X de Torax', 'Radiografia frontal y lateral del torax.', 'Radiologia', 40.00, 'No requiere preparacion especial. Retirar joyas y objetos metalicos.', 24, 'radiology', 1),
  ('Rayos X de Columna', 'Radiografia de la columna vertebral en la zona indicada.', 'Radiologia', 45.00, 'No requiere preparacion especial.', 24, 'radiology', 2),
  ('Ecografia Abdominal', 'Evaluacion de organos abdominales: higado, rinones, bazo, pancreas.', 'Ecografia', 60.00, 'Ayuno de 6-8 horas. Vejiga llena (tomar 4 vasos de agua 1 hora antes).', 48, 'ecg', 3),
  ('Ecografia Pelvica', 'Evaluacion de organos pelvicos.', 'Ecografia', 55.00, 'Vejiga llena: tomar 4-6 vasos de agua 1 hora antes. No orinar.', 48, 'ecg', 4),
  ('Ecografia Obstetrica', 'Control del embarazo y desarrollo fetal.', 'Ecografia', 65.00, 'No requiere preparacion especial en 2do y 3er trimestre.', 24, 'pregnant_woman', 5),
  ('Resonancia Magnetica Cerebral', 'Estudio detallado del cerebro y estructuras intracraneales.', 'Resonancia', 180.00, 'No portar objetos metalicos. Informar si tiene implantes metalicos o marcapasos. Duracion: 30-45 min.', 72, 'neurology', 6),
  ('Resonancia Magnetica de Rodilla', 'Evaluacion de ligamentos, meniscos y cartilago.', 'Resonancia', 160.00, 'No requiere preparacion especial. Retirar objetos metalicos. Duracion: 30 min.', 72, 'orthopedics', 7),
  ('Tomografia de Torax', 'TAC de torax con o sin contraste.', 'Tomografia', 150.00, 'Ayuno de 4 horas si es con contraste. Informar alergias a medios de contraste.', 48, 'radiology', 8),
  ('Tomografia de Abdomen', 'TAC abdominal con o sin contraste.', 'Tomografia', 160.00, 'Ayuno de 6 horas si es con contraste. Traer examenes previos.', 48, 'radiology', 9),
  ('Electrocardiograma', 'Registro de la actividad electrica del corazon.', 'Otro', 30.00, 'No requiere preparacion especial. Evitar cafeina 2 horas antes.', 24, 'cardiology', 10),
  ('Densitometria Osea', 'Medicion de la densidad mineral del hueso.', 'Otro', 70.00, 'No tomar suplementos de calcio 24 horas antes.', 48, 'orthopedics', 11),
  ('Mamografia', 'Estudio radiologico de las mamas.', 'Radiologia', 50.00, 'No usar desodorante, talco o cremas en axilas y mamas. Mejor realizarla 7-10 dias despues del periodo.', 48, 'female', 12);
