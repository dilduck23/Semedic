-- ============================================================
-- Semedic - Phase 4: Payments, Promotions & Notifications
-- ============================================================

-- New enum types
CREATE TYPE payment_method AS ENUM ('credit_card', 'cash', 'insurance');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE notification_type AS ENUM ('appointment_confirmed', 'appointment_cancelled', 'appointment_reminder', 'promotion');

-- ============================================================
-- ALTER PROMOTIONS - add coupon code
-- ============================================================
ALTER TABLE public.promotions
  ADD COLUMN coupon_code TEXT UNIQUE;

-- ============================================================
-- ALTER APPOINTMENTS - add payment/discount tracking
-- ============================================================
ALTER TABLE public.appointments
  ADD COLUMN promotion_id UUID REFERENCES public.promotions(id) ON DELETE SET NULL,
  ADD COLUMN discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN final_price DECIMAL(10,2),
  ADD COLUMN payment_status payment_status NOT NULL DEFAULT 'pending';

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_appointment ON public.payments(appointment_id);
CREATE INDEX idx_payments_patient ON public.payments(patient_id);

CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients can create own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can update own payments" ON public.payments
  FOR UPDATE USING (auth.uid() = patient_id);

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Promotions: allow full read for management + insert/update for authenticated users
CREATE POLICY "All promotions viewable for management" ON public.promotions
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update promotions" ON public.promotions
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert promotions" ON public.promotions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- VALIDATE COUPON FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_coupon_code TEXT,
  p_specialty_id UUID DEFAULT NULL
)
RETURNS TABLE (
  promotion_id UUID,
  promotion_type promotion_type,
  title TEXT,
  discount_value DECIMAL,
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_promo RECORD;
BEGIN
  SELECT * INTO v_promo
  FROM public.promotions p
  WHERE p.coupon_code = UPPER(TRIM(p_coupon_code));

  IF NOT FOUND THEN
    RETURN QUERY SELECT
      NULL::UUID, NULL::promotion_type, NULL::TEXT, NULL::DECIMAL,
      false, 'Codigo de cupon no encontrado'::TEXT;
    RETURN;
  END IF;

  IF NOT v_promo.is_active THEN
    RETURN QUERY SELECT
      v_promo.id, v_promo.type, v_promo.title, v_promo.discount_value,
      false, 'Este cupon ya no esta activo'::TEXT;
    RETURN;
  END IF;

  IF now() NOT BETWEEN v_promo.valid_from AND v_promo.valid_to THEN
    RETURN QUERY SELECT
      v_promo.id, v_promo.type, v_promo.title, v_promo.discount_value,
      false, 'Este cupon ha expirado'::TEXT;
    RETURN;
  END IF;

  IF v_promo.max_uses IS NOT NULL AND v_promo.current_uses >= v_promo.max_uses THEN
    RETURN QUERY SELECT
      v_promo.id, v_promo.type, v_promo.title, v_promo.discount_value,
      false, 'Este cupon ha alcanzado el limite de usos'::TEXT;
    RETURN;
  END IF;

  IF v_promo.specialty_id IS NOT NULL AND p_specialty_id IS NOT NULL
     AND v_promo.specialty_id != p_specialty_id THEN
    RETURN QUERY SELECT
      v_promo.id, v_promo.type, v_promo.title, v_promo.discount_value,
      false, 'Este cupon no aplica para esta especialidad'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT
    v_promo.id, v_promo.type, v_promo.title, v_promo.discount_value,
    true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- NOTIFICATION TRIGGER ON APPOINTMENT CHANGES
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_appointment_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.patient_id,
      'appointment_confirmed',
      'Cita Confirmada',
      'Tu cita ha sido agendada exitosamente para el ' || to_char(NEW.date, 'DD/MM/YYYY') || ' a las ' || to_char(NEW.start_time, 'HH12:MI AM'),
      jsonb_build_object('appointment_id', NEW.id, 'date', NEW.date, 'start_time', NEW.start_time)
    );
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.patient_id,
      'appointment_cancelled',
      'Cita Cancelada',
      'Tu cita del ' || to_char(NEW.date, 'DD/MM/YYYY') || ' ha sido cancelada.',
      jsonb_build_object('appointment_id', NEW.id, 'date', NEW.date, 'reason', COALESCE(NEW.cancellation_reason, ''))
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_appointment_change
  AFTER INSERT OR UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.notify_appointment_change();

-- ============================================================
-- SEED: Add coupon codes to existing promotions
-- ============================================================
UPDATE public.promotions SET coupon_code = 'SANGRE20' WHERE title = '20% Descuento';
UPDATE public.promotions SET coupon_code = 'SENIOR60' WHERE title = 'Consulta Gratis';
UPDATE public.promotions SET coupon_code = 'CHEQUEO' WHERE title = 'Chequeo Ejecutivo';
UPDATE public.promotions SET coupon_code = 'DERMA15' WHERE title = '15% en Dermatologia';
UPDATE public.promotions SET coupon_code = 'GENERAL10' WHERE title = '$10 de Descuento';

-- Set specialty_id on specialty-specific promotions
UPDATE public.promotions SET specialty_id = (SELECT id FROM specialties WHERE name = 'Dermatologia')
WHERE title = '15% en Dermatologia';
UPDATE public.promotions SET specialty_id = (SELECT id FROM specialties WHERE name = 'Medicina General')
WHERE title = '$10 de Descuento';

-- Set max_uses
UPDATE public.promotions SET max_uses = 100 WHERE coupon_code IS NOT NULL AND max_uses IS NULL;
