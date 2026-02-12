"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Specialty } from "@/types";

export function useSpecialties() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["specialties"],
    queryFn: async (): Promise<Specialty[]> => {
      const { data: specialties, error } = await supabase
        .from("specialties")
        .select("*")
        .order("sort_order");

      if (error) throw error;

      // Get doctor counts
      const { data: doctors } = await supabase
        .from("doctors")
        .select("specialty_id")
        .eq("is_active", true);

      const countMap: Record<string, number> = {};
      doctors?.forEach((d) => {
        countMap[d.specialty_id] = (countMap[d.specialty_id] || 0) + 1;
      });

      return specialties.map((s) => ({
        ...s,
        doctor_count: countMap[s.id] || 0,
      }));
    },
  });
}
