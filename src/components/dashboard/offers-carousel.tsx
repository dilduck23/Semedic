"use client";

import { useState } from "react";
import { usePromotions } from "@/hooks/use-promotions";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function OffersCarousel() {
  const { data: promotions, isLoading } = usePromotions();
  const [claimedId, setClaimedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="pb-6">
        <h2 className="text-lg font-bold mb-4 px-1">Ofertas Especiales</h2>
        <div className="flex space-x-4">
          <Skeleton className="flex-shrink-0 w-64 h-36 rounded-2xl" />
          <Skeleton className="flex-shrink-0 w-64 h-36 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!promotions?.length) return null;

  function handleClaim(promoId: string, couponCode: string | null) {
    if (couponCode) {
      setClaimedId(promoId);
      navigator.clipboard?.writeText(couponCode).then(() => {
        toast.success(`Codigo "${couponCode}" copiado al portapapeles`);
      }).catch(() => {
        // Clipboard not available, still show the code
      });
    }
  }

  return (
    <div className="pb-6">
      <h2 className="text-lg font-bold mb-4 px-1">Ofertas Especiales</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4 no-scrollbar lg:grid lg:grid-cols-3 lg:gap-4 lg:space-x-0 lg:overflow-visible lg:pb-0">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="flex-shrink-0 w-64 lg:w-auto lg:flex-shrink rounded-2xl p-4 text-white shadow-lg relative overflow-hidden"
            style={{
              background: `linear-gradient(to right, ${promo.gradient_from}, ${promo.gradient_to})`,
            }}
          >
            <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4">
              <MaterialIcon name={promo.icon_name} className="text-[80px]" />
            </div>
            <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">
              {promo.type === "percentage"
                ? "Descuento"
                : promo.type === "bundle"
                  ? "Paquete"
                  : promo.type === "first_visit"
                    ? "Primera Visita"
                    : "Oferta"}
            </span>
            <h3 className="font-bold text-lg mb-1">{promo.title}</h3>
            <p className="text-sm text-white/80 mb-3">{promo.description}</p>

            {claimedId === promo.id && promo.coupon_code ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-white/30 text-white px-3 py-1.5 rounded-lg font-mono font-bold">
                  {promo.coupon_code}
                </span>
                <MaterialIcon name="check" className="text-sm" />
              </div>
            ) : (
              <button
                onClick={() => handleClaim(promo.id, promo.coupon_code)}
                className="text-xs bg-white text-gray-800 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Reclamar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
