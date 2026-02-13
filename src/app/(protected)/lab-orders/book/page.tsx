"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AddressInput } from "@/components/lab-orders/address-input";
import { useLabOrderStore } from "@/stores/lab-order-store";
import { useCreateLabOrder } from "@/hooks/use-lab-orders";
import { ROUTES, DAY_NAMES_ES, MONTH_NAMES_ES } from "@/lib/constants";
import { toast } from "sonner";

const TIME_SLOTS = [
  "07:00", "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

export default function LabOrderBookPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const store = useLabOrderStore();
  const createOrder = useCreateLabOrder();

  // Redirect if no test selected
  if (!store.testTypeId) {
    router.push(ROUTES.LAB_ORDERS);
    return null;
  }

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const handleConfirm = async () => {
    if (!store.testTypeId || !store.address || !store.scheduledDate || !store.scheduledTime || !store.testTypePrice) {
      toast.error("Completa todos los campos");
      return;
    }

    try {
      await createOrder.mutateAsync({
        lab_test_type_id: store.testTypeId,
        address: store.address,
        scheduled_date: store.scheduledDate,
        scheduled_time: store.scheduledTime,
        price: store.testTypePrice,
        notes: store.notes || undefined,
      });

      store.reset();
      toast.success("Orden de laboratorio creada exitosamente");
      setStep(4); // Success step
    } catch {
      toast.error("Error al crear la orden");
    }
  };

  return (
    <>
      <header className="pt-12 lg:pt-6 pb-4 px-6 bg-card sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (step > 1) setStep(step - 1);
              else router.push(ROUTES.LAB_ORDERS);
            }}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
          <div>
            <h1 className="text-lg font-bold">{store.testTypeName}</h1>
            <p className="text-xs text-muted-foreground">
              Paso {Math.min(step, 3)} de 3
            </p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 max-w-md mx-auto lg:max-w-lg pb-28">
        {/* Step 1: Address */}
        {step === 1 && (
          <div className="space-y-6">
            <AddressInput
              value={store.address}
              onChange={store.setAddress}
            />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Notas adicionales (opcional)</Label>
              <Input
                placeholder="Ej: Piso 3, Apt 301, timbre no funciona"
                value={store.notes}
                onChange={(e) => store.setNotes(e.target.value)}
              />
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={store.address.length < 5}
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

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="font-bold">Resumen de la Orden</h2>
                <Separator />
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Examen</span>
                    <span className="font-medium">{store.testTypeName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Direccion</span>
                    <span className="font-medium text-right max-w-[60%]">
                      {store.address}
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
                  {store.notes && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Notas</span>
                      <span className="font-medium text-right max-w-[60%]">
                        {store.notes}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#2A388F]">
                      ${store.testTypePrice?.toFixed(2)}
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

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center pt-8">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <MaterialIcon
                name="check_circle"
                className="text-4xl text-green-500"
              />
            </div>
            <h2 className="text-xl font-bold mb-2">Orden Creada!</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Tu orden de laboratorio a domicilio ha sido registrada. Recibiras una
              confirmacion pronto.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push(ROUTES.LAB_ORDERS)}
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
