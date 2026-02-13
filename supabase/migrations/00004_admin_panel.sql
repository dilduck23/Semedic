-- ============================================================
-- Semedic - Phase 7: Admin Panel + Role Enforcement
-- ============================================================

-- ============================================================
-- HELPER: is_admin() function
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- AUDIT LOG TABLE
-- ============================================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_admin ON public.audit_log(admin_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_table ON public.audit_log(table_name);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert audit log" ON public.audit_log
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================================
-- ADMIN RLS POLICIES: profiles
-- ============================================================
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- ADMIN RLS POLICIES: doctors
-- ============================================================
CREATE POLICY "Admins can view all doctors" ON public.doctors
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert doctors" ON public.doctors
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update doctors" ON public.doctors
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete doctors" ON public.doctors
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- ADMIN RLS POLICIES: specialties
-- ============================================================
CREATE POLICY "Admins can insert specialties" ON public.specialties
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update specialties" ON public.specialties
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete specialties" ON public.specialties
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- ADMIN RLS POLICIES: medical_centers
-- ============================================================
CREATE POLICY "Admins can view all centers" ON public.medical_centers
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert centers" ON public.medical_centers
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update centers" ON public.medical_centers
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete centers" ON public.medical_centers
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- ADMIN RLS POLICIES: doctor_schedules
-- ============================================================
CREATE POLICY "Admins can view all schedules" ON public.doctor_schedules
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert schedules" ON public.doctor_schedules
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update schedules" ON public.doctor_schedules
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete schedules" ON public.doctor_schedules
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- ADMIN RLS POLICIES: appointments
-- ============================================================
CREATE POLICY "Admins can view all appointments" ON public.appointments
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all appointments" ON public.appointments
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- ADMIN RLS POLICIES: payments
-- ============================================================
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all payments" ON public.payments
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- TIGHTEN PROMOTIONS POLICIES
-- Drop overly permissive policies from migration 00002
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can update promotions" ON public.promotions;
DROP POLICY IF EXISTS "Authenticated users can insert promotions" ON public.promotions;

CREATE POLICY "Admins can insert promotions" ON public.promotions
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update promotions" ON public.promotions
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete promotions" ON public.promotions
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- ADMIN RLS POLICIES: notifications
-- ============================================================
CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================================
-- ADMIN RLS POLICIES: lab_orders
-- ============================================================
CREATE POLICY "Admins can view all lab orders" ON public.lab_orders
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all lab orders" ON public.lab_orders
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- ADMIN RLS POLICIES: exam_orders
-- ============================================================
CREATE POLICY "Admins can view all exam orders" ON public.exam_orders
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all exam orders" ON public.exam_orders
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- ADMIN RLS POLICIES: chat (read-only for support)
-- ============================================================
CREATE POLICY "Admins can view all chat rooms" ON public.chat_rooms
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can view all chat messages" ON public.chat_messages
  FOR SELECT USING (public.is_admin());

-- ============================================================
-- ADMIN STATS FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_doctors', (SELECT COUNT(*) FROM public.doctors WHERE is_active = true),
    'total_specialties', (SELECT COUNT(*) FROM public.specialties),
    'total_centers', (SELECT COUNT(*) FROM public.medical_centers WHERE is_active = true),
    'appointments_today', (SELECT COUNT(*) FROM public.appointments WHERE date = CURRENT_DATE),
    'appointments_pending', (SELECT COUNT(*) FROM public.appointments WHERE status = 'pending'),
    'appointments_confirmed', (SELECT COUNT(*) FROM public.appointments WHERE status = 'confirmed'),
    'appointments_completed', (SELECT COUNT(*) FROM public.appointments WHERE status = 'completed'),
    'appointments_cancelled', (SELECT COUNT(*) FROM public.appointments WHERE status = 'cancelled'),
    'revenue_this_month', COALESCE((
      SELECT SUM(amount) FROM public.payments
      WHERE status = 'completed'
        AND paid_at >= date_trunc('month', CURRENT_DATE)
    ), 0),
    'revenue_last_month', COALESCE((
      SELECT SUM(amount) FROM public.payments
      WHERE status = 'completed'
        AND paid_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
        AND paid_at < date_trunc('month', CURRENT_DATE)
    ), 0),
    'lab_orders_total', (SELECT COUNT(*) FROM public.lab_orders),
    'lab_orders_pending', (SELECT COUNT(*) FROM public.lab_orders WHERE status = 'pending'),
    'exam_orders_total', (SELECT COUNT(*) FROM public.exam_orders),
    'exam_orders_pending', (SELECT COUNT(*) FROM public.exam_orders WHERE status = 'pending'),
    'active_promotions', (SELECT COUNT(*) FROM public.promotions WHERE is_active = true AND now() BETWEEN valid_from AND valid_to)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ADMIN CHART DATA: appointments per day (last 30 days)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_appointments_chart(p_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(t))
    FROM (
      SELECT
        d::date AS date,
        COALESCE(COUNT(a.id), 0) AS count
      FROM generate_series(
        CURRENT_DATE - (p_days || ' days')::INTERVAL,
        CURRENT_DATE,
        '1 day'
      ) d
      LEFT JOIN public.appointments a ON a.date = d::date
      GROUP BY d::date
      ORDER BY d::date
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ADMIN CHART DATA: revenue per month (last 12 months)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_revenue_chart(p_months INTEGER DEFAULT 12)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(t))
    FROM (
      SELECT
        to_char(d, 'YYYY-MM') AS month,
        to_char(d, 'Mon') AS label,
        COALESCE(SUM(p.amount), 0) AS revenue
      FROM generate_series(
        date_trunc('month', CURRENT_DATE - (p_months || ' months')::INTERVAL),
        date_trunc('month', CURRENT_DATE),
        '1 month'
      ) d
      LEFT JOIN public.payments p
        ON date_trunc('month', p.paid_at) = d
        AND p.status = 'completed'
      GROUP BY d
      ORDER BY d
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
