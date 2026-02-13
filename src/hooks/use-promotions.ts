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
