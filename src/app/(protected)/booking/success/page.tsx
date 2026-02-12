"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/stores/booking-store";
import { usePayment } from "@/hooks/use-payments";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialIcon } from "@/components/shared/material-icon";
import {
  ROUTES,
  MONTH_NAMES_ES,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants";

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayHour}:${minutes} ${period}`;
}

export default function SuccessPage() {
  const router = useRouter();
  const bookingStore = useBookingStore();
  const [showCheck, setShowCheck] = useState(false);

  const {
    doctorName,
    specialtyName,
    selectedDate,
    selectedTime,
    appointmentType,
    centerName,
    price,
    discountAmount,
    finalPrice,
    couponCode,
    paymentMethod,
    appointmentId,
  } = bookingStore;

  const { data: payment } = usePayment(appointmentId);

  const totalAmount = finalPrice != null ? finalPrice : price || 0;
  const hasDiscount = discountAmount > 0;

  // Animate checkmark in
  useEffect(() => {
    const timer = setTimeout(() => setShowCheck(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Date display
  let dateDisplay = "";
  if (selectedDate) {
    const [year, month, day] = selectedDate.split("-");
    dateDisplay = `${parseInt(day)} de ${MONTH_NAMES_ES[parseInt(month) - 1]} ${year}`;
  }

  function handleViewAppointments() {
    bookingStore.reset();
    router.push(ROUTES.APPOINTMENTS);
  }

  function handleGoHome() {
    bookingStore.reset();
    router.push(ROUTES.DASHBOARD);
  }

  if (!doctorName || !selectedDate || !selectedTime) {
    router.push(ROUTES.DASHBOARD);
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Confirmacion" showBack={false} />
      <main className="px-6 lg:px-8 flex-1 pb-8 pt-6 lg:max-w-2xl lg:mx-auto flex flex-col items-center">
        {/* Checkmark animation */}
        <div
          className={`w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 transition-all duration-500 ${
            showCheck ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <MaterialIcon
            name="check_circle"
            className="text-5xl text-green-500"
          />
        </div>

        <h2 className="text-xl font-bold mb-1">Cita Agendada</h2>
        <p className="text-sm text-gray-500 mb-6">
          Tu pago ha sido procesado exitosamente
        </p>

        {/* Receipt card */}
        <div className="w-full bg-card rounded-2xl p-5 shadow-soft space-y-4">
          <h3 className="font-bold text-center text-gray-500 text-xs uppercase tracking-wider">
            Comprobante de Pago
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Doctor</span>
              <span className="text-sm font-medium text-right">
                {doctorName}
                {specialtyName && (
                  <span className="block text-xs text-gray-400">{specialtyName}</span>
                )}
              </span>
            </div>

            <div className="border-t border-dashed border-border" />

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Fecha</span>
              <span className="text-sm font-medium">{dateDisplay}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Hora</span>
              <span className="text-sm font-medium">{selectedTime ? formatTime(selectedTime) : ""}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Tipo</span>
              <span className="text-sm font-medium capitalize">{appointmentType}</span>
            </div>

            {centerName && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Centro</span>
                <span className="text-sm font-medium">{centerName}</span>
              </div>
            )}

            <div className="border-t border-dashed border-border" />

            {hasDiscount && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm line-through text-gray-400">${(price || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Descuento ({couponCode})
                  </span>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between">
              <span className="font-semibold">Total Pagado</span>
              <span className="text-lg font-bold text-[#2A388F]">${totalAmount.toFixed(2)}</span>
            </div>

            <div className="border-t border-dashed border-border" />

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Metodo</span>
              <span className="text-sm font-medium">
                {paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod] : "—"}
              </span>
            </div>

            {payment?.transaction_id && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Referencia</span>
                <span className="text-sm font-mono font-medium text-gray-600 dark:text-gray-400">
                  {payment.transaction_id}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="w-full mt-6 space-y-3">
          <button
            onClick={handleViewAppointments}
            className="w-full bg-[#2A388F] hover:bg-[#1D2770] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#2A388F]/40 transition-all flex items-center justify-center space-x-2"
          >
            <MaterialIcon name="event" className="text-lg" />
            <span>Ver Mis Citas</span>
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-card hover:bg-gray-50 dark:hover:bg-gray-800 text-foreground font-semibold py-4 rounded-xl border border-border transition-all flex items-center justify-center space-x-2"
          >
            <MaterialIcon name="home" className="text-lg" />
            <span>Volver al Inicio</span>
          </button>
        </div>
      </main>
    </div>
  );
}
