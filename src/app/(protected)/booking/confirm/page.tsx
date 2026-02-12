"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useBookingStore } from "@/stores/booking-store";
import { CouponInput } from "@/components/booking/coupon-input";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialIcon } from "@/components/shared/material-icon";
import { ROUTES, MONTH_NAMES_ES } from "@/lib/constants";

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayHour}:${minutes} ${period}`;
}

export default function ConfirmPage() {
  const router = useRouter();
  const bookingStore = useBookingStore();

  const {
    doctorName,
    specialtyName,
    selectedDate,
    selectedTime,
    appointmentType,
    price,
    centerName,
    discountAmount,
    finalPrice,
    couponCode,
    notes,
  } = bookingStore;

  // Parse date for display
  let dateDisplay = "";
  if (selectedDate) {
    const [year, month, day] = selectedDate.split("-");
    dateDisplay = `${parseInt(day)} de ${MONTH_NAMES_ES[parseInt(month) - 1]} ${year}`;
  }

  const timeDisplay = selectedTime ? formatTime(selectedTime) : "";

  const displayTotal = finalPrice != null ? finalPrice : price || 0;
  const hasDiscount = discountAmount > 0;

  function handleContinue() {
    router.push(ROUTES.BOOKING.PAYMENT);
  }

  if (!doctorName || !selectedDate || !selectedTime) {
    router.push(ROUTES.SPECIALTIES);
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Confirmar Cita" />
      <main className="px-6 lg:px-8 flex-1 pb-8 pt-6 lg:max-w-2xl lg:mx-auto">
        {/* Summary card */}
        <div className="bg-card rounded-2xl p-5 shadow-soft space-y-4">
          <h2 className="text-lg font-bold">Resumen de tu Cita</h2>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <MaterialIcon
                name="person"
                className="text-[#2A388F] dark:text-blue-300"
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">Doctor</p>
              <p className="font-semibold">{doctorName}</p>
              {specialtyName && (
                <p className="text-xs text-gray-400">{specialtyName}</p>
              )}
            </div>
          </div>

          <div className="border-t border-border" />

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <MaterialIcon
                name="calendar_today"
                className="text-[#2A388F] dark:text-blue-300"
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha y Hora</p>
              <p className="font-semibold">
                {dateDisplay} - {timeDisplay}
              </p>
            </div>
          </div>

          <div className="border-t border-border" />

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <MaterialIcon
                name={appointmentType === "virtual" ? "videocam" : "location_on"}
                className="text-[#2A388F] dark:text-blue-300"
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tipo de Cita</p>
              <p className="font-semibold capitalize">{appointmentType}</p>
              {centerName && (
                <p className="text-xs text-gray-400">{centerName}</p>
              )}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Price breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className={`text-sm font-medium ${hasDiscount ? "line-through text-gray-400" : ""}`}>
                ${(price || 0).toFixed(2)}
              </span>
            </div>
            {hasDiscount && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <MaterialIcon name="local_offer" className="text-green-600 dark:text-green-400 text-sm" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Descuento ({couponCode})
                  </span>
                </div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  -${discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t border-border pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <MaterialIcon
                      name="payments"
                      className="text-green-600 dark:text-green-300"
                    />
                  </div>
                  <span className="font-semibold">Total a Pagar</span>
                </div>
                <p className="text-xl font-bold text-[#2A388F]">
                  ${displayTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coupon input */}
        <CouponInput />

        {/* Notes */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Notas o motivo de consulta (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => bookingStore.setNotes(e.target.value)}
            placeholder="Describe brevemente el motivo de tu consulta..."
            className="w-full p-3 bg-card border border-border rounded-xl text-sm resize-none h-24 focus:ring-2 focus:ring-[#2A388F] focus:border-transparent transition-all"
          />
        </div>

        {/* Continue to payment */}
        <div className="mt-6">
          <button
            onClick={handleContinue}
            className="w-full bg-[#2A388F] hover:bg-[#1D2770] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#2A388F]/40 transition-all flex items-center justify-center space-x-2"
          >
            <MaterialIcon name="payment" className="text-lg" />
            <span>Continuar al Pago</span>
          </button>
        </div>
      </main>
    </div>
  );
}
