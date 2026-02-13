-- ============================================================
-- Semedic - Seed Data
-- ============================================================

-- SPECIALTIES (matching mockup Screen 2)
INSERT INTO public.specialties (name, icon_name, is_popular, sort_order) VALUES
  ('Alergologia', 'coronavirus', false, 1),
  ('Cardiologia', 'cardiology', true, 2),
  ('Cardiologia Pediatrica', 'monitor_heart', false, 3),
  ('Cirugia General', 'medical_services', false, 4),
  ('Dermatologia', 'dermatology', true, 5),
  ('Endocrinologia', 'glucose', false, 6),
  ('Gastroenterologia', 'gastroenterology', false, 7),
  ('Ginecologia', 'female', false, 8),
  ('Medicina General', 'stethoscope', false, 9),
  ('Neurologia', 'neurology', false, 10),
  ('Nutricion', 'nutrition', false, 11),
  ('Oftalmologia', 'visibility', false, 12),
  ('Ortopedia', 'orthopedics', false, 13),
  ('Otorrinolaringologia', 'hearing', false, 14),
  ('Pediatria', 'child_care', true, 15),
  ('Psiquiatria', 'psychology', false, 16),
  ('Urologia', 'urology', false, 17);

-- MEDICAL CENTERS (Guayaquil, Ecuador)
INSERT INTO public.medical_centers (name, address, lat, lng, phone, hours) VALUES
  ('Semedic Kennedy (Norte)', 'Av. Dr. Jorge Perez Concha 905, Guayaquil', -2.1654424, -79.914185, NULL, 'Lun-Vie 7:00-19:00, Sab 8:00-14:00'),
  ('Semedic Centro Medico (Sur - Bolivia)', 'Bolivia & Calle Hideyo Noguchi, Guayaquil', -2.2120408, -79.8894484, NULL, 'Lun-Vie 7:00-19:00, Sab 8:00-14:00'),
  ('Semedic (Sur - Hideyo Noguchi)', 'Calle Hideyo Noguchi 2323, Guayaquil', -2.2120532, -79.8894735, NULL, 'Lun-Vie 7:00-19:00, Sab 8:00-14:00'),
  ('Centro Medico Kennedy (Semedic)', 'Calle 10 NO, Guayaquil', -2.1729926, -79.8982555, NULL, 'Lun-Vie 7:00-19:00, Sab 8:00-14:00');

-- DOCTORS
-- Get specialty IDs
DO $$
DECLARE
  v_cardio_id UUID;
  v_dermato_id UUID;
  v_pediatria_id UUID;
  v_medicina_id UUID;
  v_gineco_id UUID;
  v_neuro_id UUID;
  v_gastro_id UUID;
  v_orto_id UUID;
  v_oftalmo_id UUID;
  v_nutri_id UUID;
  v_endocrino_id UUID;
  v_cirugia_id UUID;
  v_psiquiatria_id UUID;
  v_urologia_id UUID;
  v_alergo_id UUID;
  v_otorrino_id UUID;
  v_cardio_ped_id UUID;
  v_center1_id UUID;
  v_center2_id UUID;
  v_center3_id UUID;
  v_center4_id UUID;
BEGIN
  SELECT id INTO v_cardio_id FROM public.specialties WHERE name = 'Cardiologia';
  SELECT id INTO v_dermato_id FROM public.specialties WHERE name = 'Dermatologia';
  SELECT id INTO v_pediatria_id FROM public.specialties WHERE name = 'Pediatria';
  SELECT id INTO v_medicina_id FROM public.specialties WHERE name = 'Medicina General';
  SELECT id INTO v_gineco_id FROM public.specialties WHERE name = 'Ginecologia';
  SELECT id INTO v_neuro_id FROM public.specialties WHERE name = 'Neurologia';
  SELECT id INTO v_gastro_id FROM public.specialties WHERE name = 'Gastroenterologia';
  SELECT id INTO v_orto_id FROM public.specialties WHERE name = 'Ortopedia';
  SELECT id INTO v_oftalmo_id FROM public.specialties WHERE name = 'Oftalmologia';
  SELECT id INTO v_nutri_id FROM public.specialties WHERE name = 'Nutricion';
  SELECT id INTO v_endocrino_id FROM public.specialties WHERE name = 'Endocrinologia';
  SELECT id INTO v_cirugia_id FROM public.specialties WHERE name = 'Cirugia General';
  SELECT id INTO v_psiquiatria_id FROM public.specialties WHERE name = 'Psiquiatria';
  SELECT id INTO v_urologia_id FROM public.specialties WHERE name = 'Urologia';
  SELECT id INTO v_alergo_id FROM public.specialties WHERE name = 'Alergologia';
  SELECT id INTO v_otorrino_id FROM public.specialties WHERE name = 'Otorrinolaringologia';
  SELECT id INTO v_cardio_ped_id FROM public.specialties WHERE name = 'Cardiologia Pediatrica';

  SELECT id INTO v_center1_id FROM public.medical_centers WHERE name = 'Semedic Kennedy (Norte)';
  SELECT id INTO v_center2_id FROM public.medical_centers WHERE name = 'Semedic Centro Medico (Sur - Bolivia)';
  SELECT id INTO v_center3_id FROM public.medical_centers WHERE name = 'Semedic (Sur - Hideyo Noguchi)';
  SELECT id INTO v_center4_id FROM public.medical_centers WHERE name = 'Centro Medico Kennedy (Semedic)';

  -- Cardiologia (12 doctors as shown in mockup)
  INSERT INTO public.doctors (specialty_id, full_name, license_number, bio, consultation_price, rating, total_reviews, avatar_url) VALUES
    (v_cardio_id, 'Dr. Roberto Martinez', 'MED-001', 'Cardiologo con 15 anos de experiencia en diagnostico cardiovascular.', 85.00, 4.8, 124, 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'),
    (v_cardio_id, 'Dra. Maria Gonzalez', 'MED-002', 'Especialista en cardiologia intervencionista y rehabilitacion cardiaca.', 75.00, 4.9, 98, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'),
    (v_cardio_id, 'Dr. Carlos Ramirez', 'MED-003', 'Cardiologo clinico con subespecialidad en arritmias.', 90.00, 4.7, 87, 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face'),
    (v_cardio_id, 'Dra. Ana Lopez', 'MED-004', 'Especialista en ecocardiografia y cardiopatias congenitas.', 80.00, 4.6, 65, 'https://images.unsplash.com/photo-1594824476967-48c8b964e05e?w=150&h=150&fit=crop&crop=face'),
    (v_cardio_id, 'Dr. Fernando Torres', 'MED-005', 'Cardiologo con enfoque en prevencion cardiovascular.', 70.00, 4.5, 54, 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face'),
    (v_cardio_id, 'Dra. Patricia Herrera', 'MED-006', 'Especialista en insuficiencia cardiaca y trasplante.', 95.00, 4.9, 142, NULL),
    (v_cardio_id, 'Dr. Miguel Santos', 'MED-007', 'Cardiologo deportivo y medicina del ejercicio.', 75.00, 4.4, 43, NULL),
    (v_cardio_id, 'Dra. Laura Mendez', 'MED-008', 'Cardiologia no invasiva y diagnostico por imagenes.', 80.00, 4.7, 76, NULL),
    (v_cardio_id, 'Dr. Andres Castillo', 'MED-009', 'Hemodinamica y cateterismo cardiaco.', 100.00, 4.8, 98, NULL),
    (v_cardio_id, 'Dra. Sofia Vargas', 'MED-010', 'Cardiologia pediatrica y adultos congenitos.', 85.00, 4.6, 67, NULL),
    (v_cardio_id, 'Dr. Ricardo Perez', 'MED-011', 'Electrofisiologia y dispositivos cardiacos.', 90.00, 4.5, 58, NULL),
    (v_cardio_id, 'Dra. Carmen Diaz', 'MED-012', 'Cardiologia clinica general.', 65.00, 4.3, 39, NULL);

  -- Dermatologia (9 doctors)
  INSERT INTO public.doctors (specialty_id, full_name, license_number, bio, consultation_price, rating, total_reviews, avatar_url) VALUES
    (v_dermato_id, 'Dra. Isabella Rodriguez', 'MED-013', 'Dermatologa estetica y clinica.', 80.00, 4.8, 112, 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=150&h=150&fit=crop&crop=face'),
    (v_dermato_id, 'Dr. Gabriel Morales', 'MED-014', 'Especialista en dermatologia oncologica.', 85.00, 4.7, 89, NULL),
    (v_dermato_id, 'Dra. Valentina Cruz', 'MED-015', 'Tratamientos laser y rejuvenecimiento.', 90.00, 4.9, 134, NULL),
    (v_dermato_id, 'Dr. Diego Fernandez', 'MED-016', 'Dermatologia pediatrica.', 70.00, 4.5, 56, NULL),
    (v_dermato_id, 'Dra. Camila Ortiz', 'MED-017', 'Acne, rosacea y enfermedades inflamatorias.', 75.00, 4.6, 72, NULL),
    (v_dermato_id, 'Dr. Alejandro Ruiz', 'MED-018', 'Cirugia dermatologica y Mohs.', 95.00, 4.8, 101, NULL),
    (v_dermato_id, 'Dra. Natalia Gomez', 'MED-019', 'Dermatoscopia y deteccion temprana.', 80.00, 4.4, 48, NULL),
    (v_dermato_id, 'Dr. Sebastian Silva', 'MED-020', 'Dermatologia general y alergias cutaneas.', 65.00, 4.3, 35, NULL),
    (v_dermato_id, 'Dra. Andrea Paredes', 'MED-021', 'Tricologia y enfermedades del cabello.', 85.00, 4.7, 82, NULL);

  -- Pediatria (18 doctors)
  INSERT INTO public.doctors (specialty_id, full_name, license_number, bio, consultation_price, rating, total_reviews, avatar_url) VALUES
    (v_pediatria_id, 'Dra. Monica Gutierrez', 'MED-022', 'Pediatra general con enfoque en desarrollo infantil.', 60.00, 4.9, 156, 'https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=150&h=150&fit=crop&crop=face'),
    (v_pediatria_id, 'Dr. Hector Navarro', 'MED-023', 'Neonatologia y cuidados intensivos pediatricos.', 75.00, 4.8, 134, NULL),
    (v_pediatria_id, 'Dra. Rosa Delgado', 'MED-024', 'Infectologia pediatrica.', 70.00, 4.7, 98, NULL),
    (v_pediatria_id, 'Dr. Luis Aguilar', 'MED-025', 'Neumologia pediatrica.', 80.00, 4.6, 76, NULL),
    (v_pediatria_id, 'Dra. Elena Ramos', 'MED-026', 'Gastroenterologia pediatrica.', 75.00, 4.5, 65, NULL),
    (v_pediatria_id, 'Dr. Jorge Medina', 'MED-027', 'Endocrinologia pediatrica.', 85.00, 4.8, 112, NULL),
    (v_pediatria_id, 'Dra. Lucia Flores', 'MED-028', 'Neurologia pediatrica.', 90.00, 4.7, 87, NULL),
    (v_pediatria_id, 'Dr. Pablo Acosta', 'MED-029', 'Dermatologia pediatrica.', 65.00, 4.4, 54, NULL),
    (v_pediatria_id, 'Dra. Claudia Vega', 'MED-030', 'Alergologia e inmunologia pediatrica.', 70.00, 4.6, 78, NULL),
    (v_pediatria_id, 'Dr. Martin Reyes', 'MED-031', 'Cardiologia pediatrica.', 85.00, 4.9, 143, NULL),
    (v_pediatria_id, 'Dra. Teresa Jimenez', 'MED-032', 'Pediatria del adolescente.', 60.00, 4.3, 42, NULL),
    (v_pediatria_id, 'Dr. Ivan Soto', 'MED-033', 'Nefrologia pediatrica.', 80.00, 4.5, 58, NULL),
    (v_pediatria_id, 'Dra. Diana Rojas', 'MED-034', 'Hematologia pediatrica.', 85.00, 4.7, 92, NULL),
    (v_pediatria_id, 'Dr. Oscar Guerrero', 'MED-035', 'Cirugia pediatrica.', 95.00, 4.8, 105, NULL),
    (v_pediatria_id, 'Dra. Paula Castro', 'MED-036', 'Medicina preventiva pediatrica.', 55.00, 4.4, 47, NULL),
    (v_pediatria_id, 'Dr. Sergio Romero', 'MED-037', 'Urgencias pediatricas.', 65.00, 4.5, 68, NULL),
    (v_pediatria_id, 'Dra. Gabriela Pineda', 'MED-038', 'Reumatologia pediatrica.', 80.00, 4.6, 73, NULL),
    (v_pediatria_id, 'Dr. Raul Espinoza', 'MED-039', 'Pediatria general y vacunacion.', 50.00, 4.3, 38, NULL);

  -- Medicina General (24 doctors - only listing 5 for brevity, rest follow same pattern)
  INSERT INTO public.doctors (specialty_id, full_name, license_number, bio, consultation_price, rating, total_reviews, avatar_url) VALUES
    (v_medicina_id, 'Dr. Manuel Herrera', 'MED-040', 'Medico general con 20 anos de experiencia.', 40.00, 4.7, 234, 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face'),
    (v_medicina_id, 'Dra. Adriana Molina', 'MED-041', 'Medicina familiar y preventiva.', 45.00, 4.8, 198, NULL),
    (v_medicina_id, 'Dr. Felipe Castro', 'MED-042', 'Atencion primaria y medicina interna.', 40.00, 4.5, 156, NULL),
    (v_medicina_id, 'Dra. Mariana Suarez', 'MED-043', 'Medicina general y gestion de enfermedades cronicas.', 45.00, 4.6, 167, NULL),
    (v_medicina_id, 'Dr. Eduardo Rios', 'MED-044', 'Chequeos generales y medicina preventiva.', 35.00, 4.4, 123, NULL);

  -- Cirugia General (15 doctors - listing 5)
  INSERT INTO public.doctors (specialty_id, full_name, license_number, bio, consultation_price, rating, total_reviews, avatar_url) VALUES
    (v_cirugia_id, 'Dr. Victor Salazar', 'MED-045', 'Cirujano general con especialidad en laparoscopia.', 120.00, 4.9, 187, NULL),
    (v_cirugia_id, 'Dra. Carolina Mendoza', 'MED-046', 'Cirugia bariatrica y metabolica.', 130.00, 4.8, 145, NULL),
    (v_cirugia_id, 'Dr. Roberto Pena', 'MED-047', 'Cirugia de hernias y pared abdominal.', 110.00, 4.7, 112, NULL),
    (v_cirugia_id, 'Dra. Beatriz Luna', 'MED-048', 'Cirugia de tiroides y mama.', 125.00, 4.6, 89, NULL),
    (v_cirugia_id, 'Dr. Gonzalo Rivera', 'MED-049', 'Cirugia general y de emergencia.', 100.00, 4.5, 98, NULL);

  -- Ginecologia (14 doctors - listing 4)
  INSERT INTO public.doctors (specialty_id, full_name, license_number, bio, consultation_price, rating, total_reviews, avatar_url) VALUES
    (v_gineco_id, 'Dra. Victoria Nunez', 'MED-050', 'Ginecologia y obstetricia de alto riesgo.', 80.00, 4.9, 198, 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=150&h=150&fit=crop&crop=face'),
    (v_gineco_id, 'Dr. Ernesto Campos', 'MED-051', 'Ginecologia oncologica.', 90.00, 4.7, 134, NULL),
    (v_gineco_id, 'Dra. Silvia Espinosa', 'MED-052', 'Medicina reproductiva y fertilidad.', 100.00, 4.8, 156, NULL),
    (v_gineco_id, 'Dra. Lorena Valdez', 'MED-053', 'Ginecologia general y salud femenina.', 70.00, 4.6, 87, NULL);

  -- Other specialties (smaller counts matching mockup)
  INSERT INTO public.doctors (specialty_id, full_name, license_number, bio, consultation_price, rating, total_reviews, avatar_url) VALUES
    -- Alergologia (8)
    (v_alergo_id, 'Dr. Julio Contreras', 'MED-054', 'Alergologo e inmunologo clinico.', 75.00, 4.7, 89, NULL),
    (v_alergo_id, 'Dra. Marta Sandoval', 'MED-055', 'Alergias respiratorias y cutaneas.', 70.00, 4.5, 67, NULL),
    -- Endocrinologia (5)
    (v_endocrino_id, 'Dr. Rafael Pacheco', 'MED-056', 'Diabetes y enfermedades tiroideas.', 85.00, 4.8, 112, NULL),
    (v_endocrino_id, 'Dra. Sandra Villanueva', 'MED-057', 'Endocrinologia metabolica.', 80.00, 4.6, 78, NULL),
    -- Gastroenterologia (7)
    (v_gastro_id, 'Dr. Enrique Maldonado', 'MED-058', 'Endoscopia y hepatologia.', 90.00, 4.8, 123, NULL),
    (v_gastro_id, 'Dra. Alicia Moreno', 'MED-059', 'Enfermedad inflamatoria intestinal.', 85.00, 4.7, 98, NULL),
    -- Neurologia (6)
    (v_neuro_id, 'Dr. Francisco Salinas', 'MED-060', 'Neurologia clinica y epilepsia.', 95.00, 4.9, 145, NULL),
    (v_neuro_id, 'Dra. Catalina Bravo', 'MED-061', 'Enfermedades neuromusculares.', 90.00, 4.7, 112, NULL),
    -- Nutricion (11)
    (v_nutri_id, 'Dra. Daniela Fuentes', 'MED-062', 'Nutricion clinica y deportiva.', 55.00, 4.8, 167, NULL),
    (v_nutri_id, 'Dr. Nicolas Varela', 'MED-063', 'Nutricion y trastornos alimentarios.', 60.00, 4.6, 89, NULL),
    -- Oftalmologia (10)
    (v_oftalmo_id, 'Dr. Armando Lara', 'MED-064', 'Cirugia de catarata y retina.', 100.00, 4.9, 178, NULL),
    (v_oftalmo_id, 'Dra. Veronica Duran', 'MED-065', 'Oftalmologia general y glaucoma.', 85.00, 4.7, 134, NULL),
    -- Ortopedia (8)
    (v_orto_id, 'Dr. Mauricio Ibarra', 'MED-066', 'Traumatologia y cirugia de rodilla.', 95.00, 4.8, 145, NULL),
    (v_orto_id, 'Dra. Irene Guzman', 'MED-067', 'Ortopedia pediatrica.', 90.00, 4.6, 98, NULL),
    -- Otorrinolaringologia (5)
    (v_otorrino_id, 'Dr. Alfredo Montoya', 'MED-068', 'ORL y cirugia de nariz y senos paranasales.', 80.00, 4.7, 112, NULL),
    (v_otorrino_id, 'Dra. Gloria Ponce', 'MED-069', 'Audiologia y trastornos del equilibrio.', 75.00, 4.5, 67, NULL),
    -- Psiquiatria (7)
    (v_psiquiatria_id, 'Dr. Tomas Carrillo', 'MED-070', 'Psiquiatria de adultos y trastornos de ansiedad.', 80.00, 4.8, 134, NULL),
    (v_psiquiatria_id, 'Dra. Renata Blanco', 'MED-071', 'Psiquiatria infantil y adolescente.', 85.00, 4.7, 98, NULL),
    -- Urologia (6)
    (v_urologia_id, 'Dr. Ignacio Coronado', 'MED-072', 'Urologia oncologica y cirugia robotica.', 100.00, 4.9, 156, NULL),
    (v_urologia_id, 'Dr. Rodrigo Meza', 'MED-073', 'Urologia general y litiasis.', 85.00, 4.6, 89, NULL),
    -- Cardiologia Pediatrica (4)
    (v_cardio_ped_id, 'Dra. Pilar Ochoa', 'MED-074', 'Cardiopatias congenitas en ninos.', 90.00, 4.8, 112, NULL),
    (v_cardio_ped_id, 'Dr. Alberto Fuentes', 'MED-075', 'Ecocardiografia pediatrica.', 85.00, 4.7, 87, NULL);

  -- DOCTOR SCHEDULES distributed across 4 centers
  -- Center 1 (Kennedy Norte): Morning Mon-Fri
  INSERT INTO public.doctor_schedules (doctor_id, center_id, day_of_week, start_time, end_time, slot_duration)
  SELECT d.id, v_center1_id, dow.day, '08:00'::TIME, '12:00'::TIME, 30
  FROM public.doctors d
  CROSS JOIN (VALUES (1),(2),(3),(4),(5)) AS dow(day)
  WHERE d.license_number IN ('MED-001','MED-002','MED-003','MED-004','MED-005','MED-013','MED-022','MED-040','MED-045','MED-050');

  -- Center 1 (Kennedy Norte): Afternoon Mon-Fri
  INSERT INTO public.doctor_schedules (doctor_id, center_id, day_of_week, start_time, end_time, slot_duration)
  SELECT d.id, v_center1_id, dow.day, '14:00'::TIME, '17:00'::TIME, 30
  FROM public.doctors d
  CROSS JOIN (VALUES (1),(2),(3),(4),(5)) AS dow(day)
  WHERE d.license_number IN ('MED-001','MED-002','MED-003','MED-004','MED-005','MED-013','MED-022','MED-040','MED-045','MED-050');

  -- Center 2 (Sur - Bolivia): Mon/Wed/Fri
  INSERT INTO public.doctor_schedules (doctor_id, center_id, day_of_week, start_time, end_time, slot_duration)
  SELECT d.id, v_center2_id, dow.day, '09:00'::TIME, '13:00'::TIME, 30
  FROM public.doctors d
  CROSS JOIN (VALUES (1),(3),(5)) AS dow(day)
  WHERE d.license_number IN ('MED-006','MED-007','MED-008','MED-014','MED-015','MED-023','MED-041','MED-046','MED-051','MED-056');

  -- Center 3 (Sur - Hideyo Noguchi): Tue/Thu
  INSERT INTO public.doctor_schedules (doctor_id, center_id, day_of_week, start_time, end_time, slot_duration)
  SELECT d.id, v_center3_id, dow.day, '08:00'::TIME, '12:00'::TIME, 30
  FROM public.doctors d
  CROSS JOIN (VALUES (2),(4)) AS dow(day)
  WHERE d.license_number IN ('MED-006','MED-007','MED-008','MED-014','MED-015','MED-023','MED-041','MED-046','MED-051','MED-056');

  -- Center 4 (Centro Medico Kennedy): Mon-Sat
  INSERT INTO public.doctor_schedules (doctor_id, center_id, day_of_week, start_time, end_time, slot_duration)
  SELECT d.id, v_center4_id, dow.day, '08:00'::TIME, '13:00'::TIME, 30
  FROM public.doctors d
  CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6)) AS dow(day)
  WHERE d.license_number IN ('MED-009','MED-010','MED-011','MED-012','MED-016','MED-024','MED-042','MED-047','MED-052','MED-058');

END $$;

-- PROMOTIONS
INSERT INTO public.promotions (type, title, description, discount_value, gradient_from, gradient_to, icon_name, valid_from, valid_to) VALUES
  ('percentage', '20% Descuento', 'En analisis de sangre completos.', 20, '#3B82F6', '#4F46E5', 'medical_services', now(), now() + INTERVAL '90 days'),
  ('first_visit', 'Consulta Gratis', 'Para mayores de 60 anos.', 100, '#FB7185', '#EF4444', 'favorite', now(), now() + INTERVAL '60 days'),
  ('bundle', 'Chequeo Ejecutivo', 'Consulta + 3 examenes por $199.', 30, '#10B981', '#059669', 'health_and_safety', now(), now() + INTERVAL '45 days'),
  ('percentage', '15% en Dermatologia', 'Primera consulta dermatologica con descuento.', 15, '#8B5CF6', '#7C3AED', 'dermatology', now(), now() + INTERVAL '30 days'),
  ('fixed', '$10 de Descuento', 'En tu proxima cita de Medicina General.', 10, '#F59E0B', '#D97706', 'stethoscope', now(), now() + INTERVAL '30 days');
