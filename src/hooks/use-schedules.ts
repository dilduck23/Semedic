"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { TimeSlot } from "@/types";

export function useAvailableSlots(doctorId: string | null, date: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["available-slots", doctorId, date],
    queryFn: async (): Promise<TimeSlot[]> => {
      const { data, error } = await supabase.rpc("get_available_slots", {
        p_doctor_id: doctorId!,
        p_date: date!,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!doctorId && !!date,
  });
}
