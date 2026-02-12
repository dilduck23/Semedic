"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Doctor } from "@/types";

export function useDoctors(specialtyId?: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["doctors", specialtyId],
    queryFn: async (): Promise<Doctor[]> => {
      let query = supabase
        .from("doctors")
        .select("*, specialty:specialties(*)")
        .eq("is_active", true)
        .order("rating", { ascending: false });

      if (specialtyId) {
        query = query.eq("specialty_id", specialtyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!specialtyId || specialtyId === undefined,
  });
}
