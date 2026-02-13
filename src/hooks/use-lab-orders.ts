"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { LabTestType, LabOrder } from "@/types";

export function useLabTestTypes(category?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["lab-test-types", category],
    queryFn: async (): Promise<LabTestType[]> => {
      let query = supabase
        .from("lab_test_types")
        .select("*")
        .order("sort_order", { ascending: true });

      if (category && category !== "Todos") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LabTestType[];
    },
  });
}

export function useLabOrders(filter: "active" | "completed" = "active") {
  const supabase = createClient();

  return useQuery({
    queryKey: ["lab-orders", filter],
    queryFn: async (): Promise<LabOrder[]> => {
      let query = supabase
        .from("lab_orders")
        .select("*, lab_test_type:lab_test_types(*)");

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
      return data as LabOrder[];
    },
  });
}

export function useLabOrder(orderId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["lab-order", orderId],
    queryFn: async (): Promise<LabOrder> => {
      const { data, error } = await supabase
        .from("lab_orders")
        .select("*, lab_test_type:lab_test_types(*)")
        .eq("id", orderId)
        .single();

      if (error) throw error;
      return data as LabOrder;
    },
    enabled: !!orderId,
  });
}

export function useCreateLabOrder() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: {
      lab_test_type_id: string;
      address: string;
      scheduled_date: string;
      scheduled_time: string;
      price: number;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await supabase
        .from("lab_orders")
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
      queryClient.invalidateQueries({ queryKey: ["lab-orders"] });
    },
  });
}

export function useCancelLabOrder() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("lab_orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-orders"] });
    },
  });
}
