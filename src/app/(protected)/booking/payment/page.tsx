"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/stores/booking-store";
import { useCreateAppointment } from "@/hooks/use-appointments";
import { useCreatePayment } from "@/hooks/use-payments";
import { useIncrementCouponUsage } from "@/hooks/use-promotions";
import { PaymentProcessing } from "@/components/booking/payment-processing";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialIcon } from "@/components/shared/material-icon";
import {
  ROUTES,
  MONTH_NAMES_ES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS,
} from "@/lib/constants";
import { toast } from "sonner";
import type { PaymentMethod } from "@/types";

const PAYMENT_METHODS: PaymentMethod[] = ["credit_card", "cash", "insurance"];

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayHour}:${minutes} ${period}`;
}

function getEndTime(startTime: string): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + 30;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}:00`;
}

export default function PaymentPage() {
  const router = useRouter();
  const bookingStore = useBookingStore();
  const createAppointment = useCreateAppointment();
  const createPayment = useCreatePayment();
  const incrementUsage = useIncrementCouponUsage();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    doctorName,
    specialtyName,
    selectedDate,
    selectedTime,
    appointmentType,
    price,
    discountAmount,
    finalPrice,
    couponCode,
    promotionId,
    notes,
  } = bookingStore;

  const totalAmount = finalPrice != null ? finalPrice : price || 0;
  const hasDiscount = discountAmount > 0;

  // Date display
  let dateDisplay = "";
  if (selectedDate) {
    const [year, month, day] = selectedDate.split("-");
    dateDisplay = `${parseInt(day)} de ${MONTH_NAMES_ES[parseInt(month) - 1]} ${year}`;
  }

  async function handlePay() {
    if (!selectedMethod || !selectedDate || !selectedTime || !bookingStore.doctorId) return;

    setIsProcessing(true);
    bookingStore.setPaymentMethod(selectedMethod);

    try {
      // 1. Create the appointment
      const appointment = await createAppointment.mutateAsync({
        doctor_id: bookingStore.doctorId,
        center_id: bookingStore.centerId || undefined,
        type: appointmentType,
        date: selectedDate,
        start_time: selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime,
        end_time: getEndTime(selectedTime),
        price: price || 0,
        notes: notes || undefined,
        promotion_id: promotionId || undefined,
        discount_amount: hasDiscount ? discountAmount : undefined,
        final_price: finalPrice != null ? finalPrice : undefined,
      });

      bookingStore.setAppointmentId(appointment.id);

      // 2. Increment coupon usage if applied
      if (promotionId) {
        incrementUsage.mutate(promotionId);
      }

      // 3. Process payment
      await createPayment.mutateAsync({
        appointment_id: appointment.id,
        amount: totalAmount,
        method: selectedMethod,
      });

      // 4. Navigate to success
      router.push(ROUTES.BOOKING.SUCCESS);
    } catch (error) {
      setIsProcessing(false);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al procesar el pago. Intenta de nuevo."
      );
    }
  }

  if (!doctorName || !selectedDate || !selectedTime) {
    router.push(ROUTES.SPECIALTIES);
    return null;
  }

  if (isProcessing) {
    return <PaymentProcessing />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Pago" />
      <main className="px-6 lg:px-8 flex-1 pb-8 pt-6 lg:max-w-2xl lg:mx-auto">
        {/* Compact summary */}
        <div className="bg-card rounded-2xl p-4 shadow-soft">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <MaterialIcon name="person" className="text-[#2A388F] dark:text-blue-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{doctorName}</p>
              <p className="text-xs text-gray-500">
                {specialtyName} &middot; {dateDisplay} &middot; {selectedTime ? formatTime(selectedTime) : ""}
              </p>
            </div>
          </div>

          {/* Price summary */}
          <div className="mt-3 pt-3 border-t border-border space-y-1">
            {hasDiscount && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="line-through text-gray-400">${(price || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400">Descuento ({couponCode})</span>
                  <span className="text-green-600 dark:text-green-400">-${discountAmount.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-[#2A388F]">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mt-6">
          <h3 className="text-base font-bold mb-3">Metodo de Pago</h3>
          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedMethod === method;
              return (
                <button
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-[#2A388F] bg-blue-50/50 dark:bg-blue-900/10"
                      : "border-border bg-card hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected
                        ? "bg-[#2A388F] text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                    }`}
                  >
                    <MaterialIcon name={PAYMENT_METHOD_ICONS[method]} />
                  </div>
                  <span className={`font-medium ${isSelected ? "text-[#2A388F] dark:text-blue-300" : ""}`}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </span>
                  <div className="flex-1" />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-[#2A388F]" : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2A388F]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pay button */}
        <div className="mt-6">
          <button
            onClick={handlePay}
            disabled={!selectedMethod}
            className="w-full bg-[#2A388F] hover:bg-[#1D2770] disabled:opacity-50 disabled:hover:bg-[#2A388F] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#2A388F]/40 transition-all flex items-center justify-center space-x-2"
          >
            <MaterialIcon name="lock" className="text-lg" />
            <span>Pagar ${totalAmount.toFixed(2)}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
