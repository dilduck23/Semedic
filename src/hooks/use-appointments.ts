"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Appointment } from "@/types";

export function useAppointments(filter: "upcoming" | "past" = "upcoming") {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["appointments", filter],
    queryFn: async (): Promise<Appointment[]> => {
      let query = supabase
        .from("appointments")
        .select(
          "*, doctor:doctors(*, specialty:specialties(*)), medical_center:medical_centers(*)"
        );

      if (filter === "upcoming") {
        query = query
          .gte("date", today)
          .in("status", ["pending", "confirmed"])
          .order("date", { ascending: true })
          .order("start_time", { ascending: true });
      } else {
        query = query
          .or(`date.lt.${today},status.in.(completed,cancelled,no_show)`)
          .order("date", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useNextAppointment() {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["next-appointment"],
    queryFn: async (): Promise<Appointment | null> => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          "*, doctor:doctors(*, specialty:specialties(*)), medical_center:medical_centers(*)"
        )
        .gte("date", today)
        .in("status", ["pending", "confirmed"])
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAppointment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: {
      doctor_id: string;
      center_id?: string;
      type: "presencial" | "virtual";
      date: string;
      start_time: string;
      end_time: string;
      price: number;
      notes?: string;
      promotion_id?: string;
      discount_amount?: number;
      final_price?: number;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          ...appointment,
          patient_id: user.id,
          status: "confirmed",
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Este horario acaba de ser reservado por otro paciente");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["next-appointment"] });
      queryClient.invalidateQueries({ queryKey: ["notification-count"] });
    },
  });
}

export function useCancelAppointment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reason,
    }: {
      id: string;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "cancelled",
          cancellation_reason: reason || null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["next-appointment"] });
    },
  });
}
