"use client";

import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { CouponValidation } from "@/types";

export function useValidateCoupon() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      couponCode,
      specialtyId,
    }: {
      couponCode: string;
      specialtyId?: string | null;
    }): Promise<CouponValidation> => {
      const { data, error } = await supabase.rpc("validate_coupon", {
        p_coupon_code: couponCode,
        p_specialty_id: specialtyId || null,
      });

      if (error) throw error;
      if (!data || data.length === 0) {
        return {
          promotion_id: null,
          promotion_type: null,
          title: null,
          discount_value: null,
          is_valid: false,
          error_message: "Error al validar el cupon",
        };
      }

      return data[0] as CouponValidation;
    },
  });
}
