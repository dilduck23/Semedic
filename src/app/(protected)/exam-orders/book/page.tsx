"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CenterSelector } from "@/components/exam-orders/center-selector";
import { PrepInstructions } from "@/components/exam-orders/prep-instructions";
import { useExamOrderStore } from "@/stores/exam-order-store";
import { useCreateExamOrder } from "@/hooks/use-exam-orders";
import { ROUTES, DAY_NAMES_ES, MONTH_NAMES_ES } from "@/lib/constants";
import { toast } from "sonner";

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00",
];

export default function ExamOrderBookPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const store = useExamOrderStore();
  const createOrder = useCreateExamOrder();

  if (!store.examTypeId) {
    router.push(ROUTES.EXAM_ORDERS);
    return null;
  }

  const hasPrepInstructions = !!store.prepInstructions;
  const totalSteps = hasPrepInstructions ? 4 : 3;

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const handleConfirm = async () => {
    if (!store.examTypeId || !store.centerId || !store.scheduledDate || !store.scheduledTime || !store.examTypePrice) {
      toast.error("Completa todos los campos");
      return;
    }

    try {
      await createOrder.mutateAsync({
        exam_type_id: store.examTypeId,
        center_id: store.centerId,
        scheduled_date: store.scheduledDate,
        scheduled_time: store.scheduledTime,
        price: store.examTypePrice,
        notes: store.notes || undefined,
      });

      store.reset();
      toast.success("Orden de examen creada exitosamente");
      setStep(totalSteps + 1); // Success step
    } catch {
      toast.error("Error al crear la orden");
    }
  };

  const currentDisplayStep = Math.min(step, totalSteps);

  return (
    <>
      <header className="pt-12 lg:pt-6 pb-4 px-6 bg-card sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (step > 1) setStep(step - 1);
              else router.push(ROUTES.EXAM_ORDERS);
            }}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
          <div>
            <h1 className="text-lg font-bold">{store.examTypeName}</h1>
            <p className="text-xs text-muted-foreground">
              Paso {currentDisplayStep} de {totalSteps}
            </p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 max-w-md mx-auto lg:max-w-lg pb-28">
        {/* Step 1: Select Center */}
        {step === 1 && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Selecciona una Central Medica
            </Label>
            <CenterSelector
              selectedId={store.centerId}
              onSelect={store.setCenter}
            />
            <Button
              onClick={() => setStep(2)}
              disabled={!store.centerId}
              className="w-full bg-[#2A388F] hover:bg-[#1e2a6e]"
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Selecciona una fecha
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {dates.map((date) => {
                  const dateStr = date.toISOString().split("T")[0];
                  const isSelected = store.scheduledDate === dateStr;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => store.setDate(dateStr)}
                      className={`p-3 rounded-xl text-center transition-colors ${
                        isSelected
                          ? "bg-[#2A388F] text-white"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <p className="text-[10px] font-medium uppercase">
                        {DAY_NAMES_ES[date.getDay()]}
                      </p>
                      <p className="text-lg font-bold">{date.getDate()}</p>
                      <p className="text-[10px]">
                        {MONTH_NAMES_ES[date.getMonth()].slice(0, 3)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {store.scheduledDate && (
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Selecciona una hora
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((time) => {
                    const isSelected = store.scheduledTime === time;

                    return (
                      <button
                        key={time}
                        onClick={() => store.setTime(time)}
                        className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-[#2A388F] text-white"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              onClick={() => setStep(3)}
              disabled={!store.scheduledDate || !store.scheduledTime}
              className="w-full bg-[#2A388F] hover:bg-[#1e2a6e]"
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Step 3: Prep Instructions (if any) OR Confirm */}
        {step === 3 && hasPrepInstructions && (
          <div className="space-y-6">
            <PrepInstructions
              instructions={store.prepInstructions!}
              examName={store.examTypeName || ""}
              confirmed={store.prepConfirmed}
              onConfirmChange={store.setPrepConfirmed}
            />

            <Button
              onClick={() => setStep(4)}
              disabled={!store.prepConfirmed}
              className="w-full bg-[#2A388F] hover:bg-[#1e2a6e]"
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Confirm step */}
        {((step === 3 && !hasPrepInstructions) || (step === 4 && hasPrepInstructions)) && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="font-bold">Resumen de la Orden</h2>
                <Separator />
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Examen</span>
                    <span className="font-medium">{store.examTypeName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Central Medica</span>
                    <span className="font-medium text-right max-w-[60%]">
                      {store.centerName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fecha</span>
                    <span className="font-medium">
                      {store.scheduledDate &&
                        new Date(store.scheduledDate + "T12:00:00").toLocaleDateString("es", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hora</span>
                    <span className="font-medium">{store.scheduledTime}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#2A388F]">
                      ${store.examTypePrice?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleConfirm}
              disabled={createOrder.isPending}
              className="w-full bg-[#2A388F] hover:bg-[#1e2a6e]"
            >
              {createOrder.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                "Confirmar Orden"
              )}
            </Button>
          </div>
        )}

        {/* Success step */}
        {step > totalSteps && (
          <div className="text-center pt-8">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <MaterialIcon
                name="check_circle"
                className="text-4xl text-green-500"
              />
            </div>
            <h2 className="text-xl font-bold mb-2">Orden Creada!</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Tu orden de examen ha sido registrada. Recibiras una confirmacion pronto.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push(ROUTES.EXAM_ORDERS)}
                className="w-full bg-[#2A388F] hover:bg-[#1e2a6e]"
              >
                Ver Mis Ordenes
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(ROUTES.DASHBOARD)}
                className="w-full"
              >
                Ir al Inicio
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
