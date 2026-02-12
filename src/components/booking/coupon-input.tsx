"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/shared/material-icon";
import { useValidateCoupon } from "@/hooks/use-coupon";
import { useBookingStore } from "@/stores/booking-store";

export function CouponInput() {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const validateCoupon = useValidateCoupon();
  const bookingStore = useBookingStore();
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const hasCoupon = !!bookingStore.couponCode;

  async function handleApply() {
    if (!code.trim()) return;

    const result = await validateCoupon.mutateAsync({
      couponCode: code.trim(),
      specialtyId: bookingStore.specialtyId,
    });

    if (result.is_valid && result.promotion_id && result.discount_value != null) {
      const price = bookingStore.price || 0;
      let discount = 0;

      if (result.promotion_type === "percentage") {
        discount = (price * result.discount_value) / 100;
      } else if (result.promotion_type === "fixed") {
        discount = Math.min(result.discount_value, price);
      } else if (result.promotion_type === "first_visit") {
        discount = price;
      } else if (result.promotion_type === "bundle") {
        discount = (price * result.discount_value) / 100;
      }

      discount = Math.round(discount * 100) / 100;
      const finalPrice = Math.max(0, Math.round((price - discount) * 100) / 100);

      bookingStore.setCoupon(result.promotion_id, code.trim().toUpperCase(), discount, finalPrice);
      setValidationResult({
        valid: true,
        message: `Cupon "${code.trim().toUpperCase()}" aplicado: ${result.title}`,
      });
    } else {
      setValidationResult({
        valid: false,
        message: result.error_message || "Cupon invalido",
      });
    }
  }

  function handleRemove() {
    bookingStore.clearCoupon();
    setCode("");
    setValidationResult(null);
  }

  if (hasCoupon) {
    return (
      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MaterialIcon name="check_circle" className="text-green-600 dark:text-green-400 text-sm" />
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">
              Cupon &quot;{bookingStore.couponCode}&quot; aplicado
            </span>
          </div>
          <button
            onClick={handleRemove}
            className="text-xs text-red-500 hover:text-red-600 font-medium"
          >
            Quitar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm text-[#2A388F] dark:text-blue-300 font-medium hover:underline"
      >
        <MaterialIcon name="local_offer" className="text-sm" />
        <span>Tienes un codigo de cupon?</span>
        <MaterialIcon
          name={isOpen ? "expand_less" : "expand_more"}
          className="text-sm"
        />
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          <div className="flex space-x-2">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setValidationResult(null);
              }}
              placeholder="CODIGO..."
              className="flex-1 px-3 py-2.5 bg-card border border-border rounded-xl text-sm uppercase focus:ring-2 focus:ring-[#2A388F] focus:border-transparent transition-all"
              maxLength={20}
            />
            <button
              onClick={handleApply}
              disabled={!code.trim() || validateCoupon.isPending}
              className="px-4 py-2.5 bg-[#2A388F] hover:bg-[#1D2770] disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {validateCoupon.isPending ? "..." : "Aplicar"}
            </button>
          </div>

          {validationResult && (
            <div
              className={`flex items-center space-x-2 text-sm ${
                validationResult.valid
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-500 dark:text-red-400"
              }`}
            >
              <MaterialIcon
                name={validationResult.valid ? "check_circle" : "error"}
                className="text-sm"
              />
              <span>{validationResult.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
