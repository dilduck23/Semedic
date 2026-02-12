-- ============================================================
-- Semedic - Sistema de Agendamiento de Citas Medicas
-- Initial Database Schema
-- ============================================================

-- Custom types
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE appointment_type AS ENUM ('presencial', 'virtual');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE promotion_type AS ENUM ('percentage', 'fixed', 'bundle', 'first_visit');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'patient',
  avatar_url TEXT,
  date_of_birth DATE,
  blood_type TEXT CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SPECIALTIES
-- ============================================================
CREATE TABLE public.specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT NOT NULL DEFAULT 'stethoscope',
  is_popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_specialties_name ON public.specialties(name);

-- ============================================================
-- MEDICAL CENTERS
-- ============================================================
CREATE TABLE public.medical_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone TEXT,
  hours TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- DOCTORS
-- ============================================================
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  specialty_id UUID NOT NULL REFERENCES public.specialties(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  license_number TEXT UNIQUE,
  bio TEXT,
  consultation_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_doctors_specialty ON public.doctors(specialty_id);
CREATE INDEX idx_doctors_rating ON public.doctors(rating DESC);

-- ============================================================
-- DOCTOR SCHEDULES
-- ============================================================
CREATE TABLE public.doctor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES public.medical_centers(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  CONSTRAINT unique_schedule UNIQUE (doctor_id, center_id, day_of_week, start_time)
);

CREATE INDEX idx_schedules_doctor ON public.doctor_schedules(doctor_id);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  center_id UUID REFERENCES public.medical_centers(id) ON DELETE SET NULL,
  type appointment_type NOT NULL DEFAULT 'presencial',
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_date ON public.appointments(doctor_id, date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Prevent double-booking the same slot
CREATE UNIQUE INDEX idx_unique_appointment_slot
  ON public.appointments(doctor_id, date, start_time)
  WHERE status IN ('pending', 'confirmed');

-- ============================================================
-- PROMOTIONS
-- ============================================================
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type promotion_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_value DECIMAL(10,2) NOT NULL,
  specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  gradient_from TEXT DEFAULT '#3B82F6',
  gradient_to TEXT DEFAULT '#4F46E5',
  icon_name TEXT DEFAULT 'medical_services',
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_to TIMESTAMPTZ NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER medical_centers_updated_at BEFORE UPDATE ON public.medical_centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER doctors_updated_at BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'patient'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

-- Get available time slots for a doctor on a given date
CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_doctor_id UUID,
  p_date DATE
)
RETURNS TABLE (
  slot_time TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  v_day_of_week SMALLINT;
  v_schedule RECORD;
  v_current_slot TIME;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date)::SMALLINT;

  FOR v_schedule IN
    SELECT ds.start_time, ds.end_time, ds.slot_duration
    FROM public.doctor_schedules ds
    WHERE ds.doctor_id = p_doctor_id
      AND ds.day_of_week = v_day_of_week
      AND ds.is_active = true
  LOOP
    v_current_slot := v_schedule.start_time;
    WHILE v_current_slot < v_schedule.end_time LOOP
      slot_time := v_current_slot;
      is_available := NOT EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.doctor_id = p_doctor_id
          AND a.date = p_date
          AND a.start_time = v_current_slot
          AND a.status IN ('pending', 'confirmed')
      );
      RETURN NEXT;
      v_current_slot := v_current_slot + (v_schedule.slot_duration || ' minutes')::INTERVAL;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Specialties (public read)
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Specialties are viewable by everyone" ON public.specialties
  FOR SELECT USING (true);

-- Medical Centers (public read)
ALTER TABLE public.medical_centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Medical centers are viewable by everyone" ON public.medical_centers
  FOR SELECT USING (is_active = true);

-- Doctors (public read for active)
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active doctors are viewable by everyone" ON public.doctors
  FOR SELECT USING (is_active = true);

-- Doctor Schedules (public read for active)
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active schedules are viewable by everyone" ON public.doctor_schedules
  FOR SELECT USING (is_active = true);

-- Appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can update own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = patient_id);

-- Promotions (public read for active)
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active promotions are viewable by everyone" ON public.promotions
  FOR SELECT USING (is_active = true AND now() BETWEEN valid_from AND valid_to);
