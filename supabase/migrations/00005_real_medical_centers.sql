-- ============================================================
-- Migration: Replace seed medical centers with real Semedic locations
-- ============================================================

-- First deactivate old seed centers (safe approach, doesn't break FK references)
UPDATE public.medical_centers
SET is_active = false
WHERE name IN ('Semedic Central', 'Semedic Plaza Salud', 'Semedic Norte');

-- Insert 4 real Semedic centers in Guayaquil, Ecuador
INSERT INTO public.medical_centers (name, address, lat, lng, phone, hours) VALUES
  ('Semedic Kennedy (Norte)', 'Av. Dr. Jorge Perez Concha 905, Guayaquil', -2.1654424, -79.914185, NULL, 'Lun-Vie 7:00-19:00, Sab 8:00-14:00'),
  ('Semedic Centro Medico (Sur - Bolivia)', 'Bolivia & Calle Hideyo Noguchi, Guayaquil', -2.2120408, -79.8894484, NULL, 'Lun-Vie 7:00-19:00, Sab 8:00-14:00'),
  ('Semedic (Sur - Hideyo Noguchi)', 'Calle Hideyo Noguchi 2323, Guayaquil', -2.2120532, -79.8894735, NULL, 'Lun-Vie 7:00-19:00, Sab 8:00-14:00'),
  ('Centro Medico Kennedy (Semedic)', 'Calle 10 NO, Guayaquil', -2.1729926, -79.8982555, NULL, 'Lun-Vie 7:00-19:00, Sab 8:00-14:00')
ON CONFLICT DO NOTHING;

-- Reassign doctor schedules from old centers to new ones
DO $$
DECLARE
  v_old_center1 UUID;
  v_old_center2 UUID;
  v_old_center3 UUID;
  v_new_center1 UUID;
  v_new_center2 UUID;
  v_new_center3 UUID;
  v_new_center4 UUID;
BEGIN
  SELECT id INTO v_old_center1 FROM public.medical_centers WHERE name = 'Semedic Central';
  SELECT id INTO v_old_center2 FROM public.medical_centers WHERE name = 'Semedic Plaza Salud';
  SELECT id INTO v_old_center3 FROM public.medical_centers WHERE name = 'Semedic Norte';

  SELECT id INTO v_new_center1 FROM public.medical_centers WHERE name = 'Semedic Kennedy (Norte)';
  SELECT id INTO v_new_center2 FROM public.medical_centers WHERE name = 'Semedic Centro Medico (Sur - Bolivia)';
  SELECT id INTO v_new_center3 FROM public.medical_centers WHERE name = 'Semedic (Sur - Hideyo Noguchi)';
  SELECT id INTO v_new_center4 FROM public.medical_centers WHERE name = 'Centro Medico Kennedy (Semedic)';

  -- Reassign schedules: old center 1 -> new center 1 (Kennedy Norte)
  IF v_old_center1 IS NOT NULL AND v_new_center1 IS NOT NULL THEN
    UPDATE public.doctor_schedules SET center_id = v_new_center1 WHERE center_id = v_old_center1;
  END IF;

  -- Reassign schedules: old center 2 -> new center 2 (Sur Bolivia)
  IF v_old_center2 IS NOT NULL AND v_new_center2 IS NOT NULL THEN
    UPDATE public.doctor_schedules SET center_id = v_new_center2 WHERE center_id = v_old_center2;
  END IF;

  -- Reassign schedules: old center 3 -> new center 4 (Centro Medico Kennedy)
  IF v_old_center3 IS NOT NULL AND v_new_center4 IS NOT NULL THEN
    UPDATE public.doctor_schedules SET center_id = v_new_center4 WHERE center_id = v_old_center3;
  END IF;

  -- Update any appointments referencing old centers
  IF v_old_center1 IS NOT NULL AND v_new_center1 IS NOT NULL THEN
    UPDATE public.appointments SET center_id = v_new_center1 WHERE center_id = v_old_center1;
  END IF;
  IF v_old_center2 IS NOT NULL AND v_new_center2 IS NOT NULL THEN
    UPDATE public.appointments SET center_id = v_new_center2 WHERE center_id = v_old_center2;
  END IF;
  IF v_old_center3 IS NOT NULL AND v_new_center4 IS NOT NULL THEN
    UPDATE public.appointments SET center_id = v_new_center4 WHERE center_id = v_old_center3;
  END IF;

  -- Update any exam_orders referencing old centers
  IF v_old_center1 IS NOT NULL AND v_new_center1 IS NOT NULL THEN
    UPDATE public.exam_orders SET center_id = v_new_center1 WHERE center_id = v_old_center1;
  END IF;
  IF v_old_center2 IS NOT NULL AND v_new_center2 IS NOT NULL THEN
    UPDATE public.exam_orders SET center_id = v_new_center2 WHERE center_id = v_old_center2;
  END IF;
  IF v_old_center3 IS NOT NULL AND v_new_center4 IS NOT NULL THEN
    UPDATE public.exam_orders SET center_id = v_new_center4 WHERE center_id = v_old_center3;
  END IF;
END $$;
