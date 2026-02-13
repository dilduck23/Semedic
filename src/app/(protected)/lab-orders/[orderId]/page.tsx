"use client";

export const dynamic = "force-dynamic";

import { use } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderTimeline } from "@/components/lab-orders/order-timeline";
import { ResultsCard } from "@/components/lab-orders/results-card";
import { useLabOrder, useCancelLabOrder } from "@/hooks/use-lab-orders";
import { ROUTES, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { toast } from "sonner";

export default function LabOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();
  const { data: order, isLoading } = useLabOrder(orderId);
  const cancelOrder = useCancelLabOrder();

  const handleCancel = async () => {
    if (!confirm("Estas seguro de cancelar esta orden?")) return;

    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success("Orden cancelada");
    } catch {
      toast.error("Error al cancelar la orden");
    }
  };

  if (isLoading) {
    return (
      <>
        <header className="pt-12 lg:pt-6 pb-4 px-6 bg-card sticky top-0 z-20 shadow-sm">
          <Skeleton className="h-7 w-48" />
        </header>
        <main className="px-6 py-6 max-w-md mx-auto space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-60 w-full rounded-2xl" />
        </main>
      </>
    );
  }

  if (!order) {
    return (
      <div className="text-center pt-20">
        <p className="text-muted-foreground">Orden no encontrada</p>
      </div>
    );
  }

  const canCancel = order.status === "pending";

  return (
    <>
      <header className="pt-12 lg:pt-6 pb-4 px-6 bg-card sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(ROUTES.LAB_ORDERS)}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Detalle de Orden</h1>
          </div>
          <Badge className={ORDER_STATUS_COLORS[order.status]}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>
      </header>

      <main className="px-6 py-6 max-w-md mx-auto lg:max-w-lg pb-28 space-y-6">
        {/* Order Info */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <MaterialIcon
                  name={order.lab_test_type?.icon_name || "science"}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <div>
                <h2 className="font-bold">{order.lab_test_type?.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {order.lab_test_type?.category}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MaterialIcon name="location_on" className="text-muted-foreground text-base" />
                <span>{order.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <MaterialIcon name="calendar_today" className="text-muted-foreground text-base" />
                <span>
                  {new Date(order.scheduled_date).toLocaleDateString("es", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MaterialIcon name="schedule" className="text-muted-foreground text-base" />
                <span>{order.scheduled_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MaterialIcon name="payments" className="text-muted-foreground text-base" />
                <span className="font-bold text-[#2A388F]">
                  ${order.price.toFixed(2)}
                </span>
              </div>
            </div>

            {order.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notas:</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Preparation Instructions */}
        {order.lab_test_type?.preparation_instructions && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <MaterialIcon
                  name="info"
                  className="text-amber-600 dark:text-amber-400 text-lg shrink-0 mt-0.5"
                />
                <div>
                  <h3 className="font-semibold text-sm text-amber-800 dark:text-amber-200 mb-1">
                    Preparacion Previa
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {order.lab_test_type.preparation_instructions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {order.results_url && (
          <ResultsCard
            resultsUrl={order.results_url}
            availableAt={order.results_available_at}
          />
        )}

        {/* Timeline */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold text-sm mb-4">Estado de la Orden</h3>
            <OrderTimeline currentStatus={order.status} type="lab" />
          </CardContent>
        </Card>

        {/* Cancel button */}
        {canCancel && (
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={cancelOrder.isPending}
            className="w-full text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            {cancelOrder.isPending ? "Cancelando..." : "Cancelar Orden"}
          </Button>
        )}
      </main>
    </>
  );
}
