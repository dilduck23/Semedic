"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { MedicalCenter } from "@/types";

export function useMedicalCenters() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["medical-centers"],
    queryFn: async (): Promise<MedicalCenter[]> => {
      const { data, error } = await supabase
        .from("medical_centers")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}
