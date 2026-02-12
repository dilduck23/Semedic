"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Promotion } from "@/types";

export function usePromotions() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["promotions"],
    queryFn: async (): Promise<Promotion[]> => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useAllPromotions() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["promotions", "all"],
    queryFn: async (): Promise<Promotion[]> => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*, specialty:specialties(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePromotion() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotion: {
      title: string;
      description?: string;
      type: string;
      discount_value: number;
      coupon_code: string;
      specialty_id?: string;
      valid_from: string;
      valid_to: string;
      max_uses?: number;
      gradient_from?: string;
      gradient_to?: string;
      icon_name?: string;
    }) => {
      const { data, error } = await supabase
        .from("promotions")
        .insert({
          ...promotion,
          coupon_code: promotion.coupon_code.toUpperCase(),
          specialty_id: promotion.specialty_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

export function useIncrementCouponUsage() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotionId: string) => {
      const { error } = await supabase.rpc("increment_coupon_usage" as never, {
        p_promotion_id: promotionId,
      });

      // Fallback: manual increment if RPC doesn't exist
      if (error) {
        const { data: promo } = await supabase
          .from("promotions")
          .select("current_uses")
          .eq("id", promotionId)
          .single();

        if (promo) {
          await supabase
            .from("promotions")
            .update({ current_uses: promo.current_uses + 1 })
            .eq("id", promotionId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}
