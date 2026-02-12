"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { TimeSlot } from "@/types";

interface TimeSlotGridProps {
  slots: TimeSlot[];
  isLoading: boolean;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayHour}:${minutes} ${period}`;
}

export function TimeSlotGrid({
  slots,
  isLoading,
  selectedTime,
  onSelectTime,
}: TimeSlotGridProps) {
  const { morning, afternoon } = useMemo(() => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];

    slots.forEach((slot) => {
      const hour = parseInt(slot.slot_time.split(":")[0]);
      if (hour < 12) {
        morning.push(slot);
      } else {
        afternoon.push(slot);
      }
    });

    return { morning, afternoon };
  }, [slots]);

  if (isLoading) {
    return (
      <div className="mt-8">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!slots.length) {
    return (
      <div className="mt-8 text-center py-8">
        <p className="text-gray-500">
          No hay horarios disponibles para esta fecha
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Horarios disponibles
      </h2>

      {morning.length > 0 && (
        <>
          <div className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Manana
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {morning.map((slot) => {
              const isSelected = selectedTime === slot.slot_time;
              return (
                <button
                  key={slot.slot_time}
                  onClick={() =>
                    slot.is_available && onSelectTime(slot.slot_time)
                  }
                  disabled={!slot.is_available}
                  className={cn(
                    "py-2 px-3 rounded-xl text-sm transition-colors",
                    !slot.is_available &&
                      "border border-gray-200 dark:border-gray-700 text-gray-400 bg-gray-50 dark:bg-gray-800 cursor-not-allowed",
                    slot.is_available &&
                      !isSelected &&
                      "border border-[#2A388F] text-[#2A388F] bg-card font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer",
                    isSelected &&
                      "bg-[#2A388F] text-white font-bold shadow-md shadow-[#2A388F]/30"
                  )}
                >
                  {formatTime(slot.slot_time)}
                </button>
              );
            })}
          </div>
        </>
      )}

      {afternoon.length > 0 && (
        <>
          <div className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Tarde
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
            {afternoon.map((slot) => {
              const isSelected = selectedTime === slot.slot_time;
              return (
                <button
                  key={slot.slot_time}
                  onClick={() =>
                    slot.is_available && onSelectTime(slot.slot_time)
                  }
                  disabled={!slot.is_available}
                  className={cn(
                    "py-2 px-3 rounded-xl text-sm transition-colors",
                    !slot.is_available &&
                      "border border-gray-200 dark:border-gray-700 text-gray-400 bg-gray-50 dark:bg-gray-800 cursor-not-allowed",
                    slot.is_available &&
                      !isSelected &&
                      "border border-[#2A388F] text-[#2A388F] bg-card font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer",
                    isSelected &&
                      "bg-[#2A388F] text-white font-bold shadow-md shadow-[#2A388F]/30"
                  )}
                >
                  {formatTime(slot.slot_time)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
