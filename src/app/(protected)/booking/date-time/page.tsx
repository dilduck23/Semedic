"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/page-header";
import { DoctorProfileCard } from "@/components/booking/doctor-profile-card";
import { AppointmentCalendar } from "@/components/booking/appointment-calendar";
import { TimeSlotGrid } from "@/components/booking/time-slot-grid";
import { useDoctors } from "@/hooks/use-doctors";
import { useAvailableSlots } from "@/hooks/use-schedules";
import { useBookingStore } from "@/stores/booking-store";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";

function DateTimeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const doctorId = searchParams.get("doctor_id");
  const bookingStore = useBookingStore();

  const { data: doctors, isLoading: loadingDoctor } = useDoctors();
  const doctor = doctors?.find((d) => d.id === doctorId);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const dateString = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : null;

  const { data: slots, isLoading: loadingSlots } = useAvailableSlots(
    doctorId,
    dateString
  );

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    bookingStore.setDate(format(date, "yyyy-MM-dd"));
    bookingStore.setTime("");
  }

  function handleTimeSelect(time: string) {
    bookingStore.setTime(time);
  }

  function handleContinue() {
    router.push(ROUTES.BOOKING.CONFIRM);
  }

  if (loadingDoctor) {
    return (
      <div className="px-6 pt-6 space-y-6">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="px-6 pt-12 text-center">
        <p className="text-gray-500">Doctor no encontrado</p>
      </div>
    );
  }

  const canContinue =
    bookingStore.selectedDate && bookingStore.selectedTime;

  return (
    <>
      <main className="px-6 lg:px-8 flex-1 pb-8 lg:max-w-4xl">
        <div className="mt-6 lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="space-y-6">
            <DoctorProfileCard doctor={doctor} />
            <AppointmentCalendar
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onMonthChange={setCurrentMonth}
            />
          </div>

          <div>
            {selectedDate && (
              <TimeSlotGrid
                slots={slots || []}
                isLoading={loadingSlots}
                selectedTime={bookingStore.selectedTime}
                onSelectTime={handleTimeSelect}
              />
            )}

            <div className="mt-6">
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className="w-full bg-[#2A388F] hover:bg-[#1D2770] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-[#2A388F]/40 disabled:shadow-none transition-all flex items-center justify-center space-x-2"
              >
                <span>Continuar</span>
                <MaterialIcon name="arrow_forward" className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function DateTimePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Fecha y Hora" />
      <Suspense
        fallback={
          <div className="px-6 pt-6 space-y-6">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        }
      >
        <DateTimeContent />
      </Suspense>
    </div>
  );
}
