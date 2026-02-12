"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useAllPromotions } from "@/hooks/use-promotions";
import { PromotionFormDialog } from "@/components/promotions/promotion-form-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Skeleton } from "@/components/ui/skeleton";

function getStatusInfo(promo: { is_active: boolean; valid_to: string; current_uses: number; max_uses: number | null }) {
  const now = new Date();
  const validTo = new Date(promo.valid_to);

  if (!promo.is_active) return { label: "Inactiva", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
  if (validTo < now) return { label: "Expirada", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" };
  if (promo.max_uses && promo.current_uses >= promo.max_uses) return { label: "Agotada", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" };
  return { label: "Activa", color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" };
}

const TYPE_LABELS: Record<string, string> = {
  percentage: "Porcentaje",
  fixed: "Monto fijo",
  bundle: "Paquete",
  first_visit: "Primera visita",
};

export default function PromotionsPage() {
  const { data: promotions, isLoading } = useAllPromotions();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Promociones" />
      <main className="px-6 lg:px-8 flex-1 pb-8 pt-6 lg:max-w-3xl lg:mx-auto">
        {/* Header with add button */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {promotions?.length || 0} promociones
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-1 bg-[#2A388F] hover:bg-[#1D2770] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <MaterialIcon name="add" className="text-lg" />
            <span>Nueva</span>
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Promotions list */}
        {!isLoading && promotions && promotions.length > 0 && (
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {promotions.map((promo) => {
              const status = getStatusInfo(promo);
              return (
                <div
                  key={promo.id}
                  className="bg-card rounded-2xl p-5 shadow-soft border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{
                          background: `linear-gradient(135deg, ${promo.gradient_from}, ${promo.gradient_to})`,
                        }}
                      >
                        <MaterialIcon name={promo.icon_name} className="text-lg" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{promo.title}</h3>
                        <p className="text-xs text-gray-400">{TYPE_LABELS[promo.type] || promo.type}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {promo.description && (
                    <p className="text-sm text-gray-500 mb-3">{promo.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-3">
                      {promo.coupon_code && (
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono font-semibold text-gray-600 dark:text-gray-300">
                          {promo.coupon_code}
                        </span>
                      )}
                      <span>
                        {promo.type === "percentage" ? `${promo.discount_value}%` : `$${promo.discount_value}`}
                      </span>
                    </div>
                    <span>
                      {promo.current_uses}{promo.max_uses ? `/${promo.max_uses}` : ""} usos
                    </span>
                  </div>

                  {(promo.specialty as unknown as { name: string })?.name && (
                    <p className="text-xs text-gray-400 mt-2">
                      Especialidad: {(promo.specialty as unknown as { name: string }).name}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!promotions || promotions.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <MaterialIcon name="local_offer" className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-1">
              Sin promociones
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Crea tu primera promocion para ofrecer descuentos a tus pacientes
            </p>
          </div>
        )}

        <PromotionFormDialog open={showForm} onClose={() => setShowForm(false)} />
      </main>
    </div>
  );
}
