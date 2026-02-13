"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ExamType, ExamOrder } from "@/types";

export function useExamTypes(category?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["exam-types", category],
    queryFn: async (): Promise<ExamType[]> => {
      let query = supabase
        .from("exam_types")
        .select("*")
        .order("sort_order", { ascending: true });

      if (category && category !== "Todos") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ExamType[];
    },
  });
}

export function useExamOrders(filter: "active" | "completed" = "active") {
  const supabase = createClient();

  return useQuery({
    queryKey: ["exam-orders", filter],
    queryFn: async (): Promise<ExamOrder[]> => {
      let query = supabase
        .from("exam_orders")
        .select("*, exam_type:exam_types(*), medical_center:medical_centers(*)");

      if (filter === "active") {
        query = query
          .in("status", ["pending", "confirmed", "in_progress"])
          .order("scheduled_date", { ascending: true });
      } else {
        query = query
          .in("status", ["completed", "cancelled"])
          .order("scheduled_date", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ExamOrder[];
    },
  });
}

export function useExamOrder(orderId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["exam-order", orderId],
    queryFn: async (): Promise<ExamOrder> => {
      const { data, error } = await supabase
        .from("exam_orders")
        .select("*, exam_type:exam_types(*), medical_center:medical_centers(*)")
        .eq("id", orderId)
        .single();

      if (error) throw error;
      return data as ExamOrder;
    },
    enabled: !!orderId,
  });
}

export function useCreateExamOrder() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: {
      exam_type_id: string;
      center_id: string;
      scheduled_date: string;
      scheduled_time: string;
      price: number;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await supabase
        .from("exam_orders")
        .insert({
          ...order,
          patient_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-orders"] });
    },
  });
}

export function useCancelExamOrder() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("exam_orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-orders"] });
    },
  });
}
