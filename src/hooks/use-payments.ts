"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Payment, PaymentMethod } from "@/types";

export function useCreatePayment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointment_id,
      amount,
      method,
    }: {
      appointment_id: string;
      amount: number;
      method: PaymentMethod;
    }): Promise<Payment> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // 1. Create payment with pending status
      const { data: payment, error: insertError } = await supabase
        .from("payments")
        .insert({
          appointment_id,
          patient_id: user.id,
          amount,
          method,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 3. Generate transaction ID and mark as completed
      const transactionId = `SIM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

      const { data: completed, error: updateError } = await supabase
        .from("payments")
        .update({
          status: "completed",
          transaction_id: transactionId,
          paid_at: new Date().toISOString(),
        })
        .eq("id", payment.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // 4. Update appointment payment_status
      await supabase
        .from("appointments")
        .update({ payment_status: "completed" })
        .eq("id", appointment_id);

      return completed as Payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["next-appointment"] });
    },
  });
}

export function usePayment(appointmentId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["payment", appointmentId],
    queryFn: async (): Promise<Payment | null> => {
      if (!appointmentId) return null;

      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("appointment_id", appointmentId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data as Payment;
    },
    enabled: !!appointmentId,
  });
}
