"use client";

export const dynamic = "force-dynamic";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useDoctors } from "@/hooks/use-doctors";
import { useBookingStore } from "@/stores/booking-store";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";

function DoctorsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const specialtyId = searchParams.get("specialty_id");
  const { data: doctors, isLoading } = useDoctors(specialtyId);
  const bookingStore = useBookingStore();

  function handleSelectDoctor(doctor: NonNullable<typeof doctors>[0]) {
    bookingStore.setDoctor(
      doctor.id,
      doctor.full_name,
      doctor.consultation_price
    );
    router.push(`${ROUTES.BOOKING.DATE_TIME}?doctor_id=${doctor.id}`);
  }

  if (isLoading) {
    return (
      <div className="px-6 space-y-4 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!doctors?.length) {
    return (
      <div className="px-6 pt-12 text-center">
        <MaterialIcon
          name="person_search"
          className="text-gray-300 text-6xl mb-4"
        />
        <p className="text-gray-500 font-medium">
          No se encontraron doctores para esta especialidad
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 pt-4 pb-8">
      <p className="text-sm text-gray-500 px-1 mb-4">
        {doctors.length} doctores disponibles
      </p>
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
      {doctors.map((doctor) => (
        <button
          key={doctor.id}
          onClick={() => handleSelectDoctor(doctor)}
          className="w-full bg-card rounded-2xl p-4 shadow-soft hover:shadow-lg transition-all text-left flex items-center space-x-4 group"
        >
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-[#2A388F]">
              <AvatarImage src={doctor.avatar_url || undefined} />
              <AvatarFallback className="bg-[#2A388F] text-white font-semibold">
                {doctor.full_name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-card" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">
              {doctor.full_name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {doctor.specialty?.name}
            </p>
            <div className="flex items-center mt-1 space-x-3">
              <div className="flex items-center">
                <MaterialIcon
                  name="star"
                  className="text-yellow-500 text-sm mr-1"
                  filled
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {doctor.rating}
                </span>
                <span className="text-xs text-gray-400 ml-1">
                  ({doctor.total_reviews})
                </span>
              </div>
              <span className="text-[#2A388F] font-bold text-sm">
                ${doctor.consultation_price.toFixed(2)}
              </span>
            </div>
          </div>
          <MaterialIcon
            name="chevron_right"
            className="text-gray-400 group-hover:text-[#2A388F] transition-colors"
          />
        </button>
      ))}
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  const specialtyName = useBookingStore((s) => s.specialtyName);

  return (
    <>
      <PageHeader title={specialtyName || "Doctores"} />
      <Suspense
        fallback={
          <div className="px-6 space-y-4 pt-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        }
      >
        <DoctorsList />
      </Suspense>
    </>
  );
}
