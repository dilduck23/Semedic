"use client";

export const dynamic = "force-dynamic";

import { usePromotions } from "@/hooks/use-promotions";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_LABELS: Record<string, string> = {
  percentage: "Porcentaje",
  fixed: "Monto fijo",
  bundle: "Paquete",
  first_visit: "Primera visita",
};

export default function PromotionsPage() {
  const { data: promotions, isLoading } = usePromotions();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Promociones" />
      <main className="px-6 lg:px-8 flex-1 pb-8 pt-6 lg:max-w-3xl lg:mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {promotions?.length || 0} promociones disponibles
          </p>
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
            {promotions.map((promo) => (
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
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    Activa
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
                </div>

                {(promo.specialty as unknown as { name: string })?.name && (
                  <p className="text-xs text-gray-400 mt-2">
                    Especialidad: {(promo.specialty as unknown as { name: string }).name}
                  </p>
                )}
              </div>
            ))}
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
              No hay promociones disponibles en este momento
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
