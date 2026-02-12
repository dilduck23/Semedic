"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  addMonths,
  subMonths,
} from "date-fns";
import { MaterialIcon } from "@/components/shared/material-icon";
import { DAY_NAMES_ES, MONTH_NAMES_ES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AppointmentCalendarProps {
  currentMonth: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  availableDays?: number[];
}

export function AppointmentCalendar({
  currentMonth,
  selectedDate,
  onDateSelect,
  onMonthChange,
  availableDays = [1, 2, 3, 4, 5],
}: AppointmentCalendarProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const monthName = MONTH_NAMES_ES[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <MaterialIcon name="chevron_left" className="text-gray-500" />
        </button>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {monthName} {year}
        </h2>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <MaterialIcon name="chevron_right" className="text-gray-500" />
        </button>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-soft">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {DAY_NAMES_ES.map((day, i) => (
            <div
              key={i}
              className="text-xs font-medium text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
          {calendarDays.map((day, i) => {
            const inMonth = isSameMonth(day, currentMonth);
            const selected = selectedDate && isSameDay(day, selectedDate);
            const isPast = isBefore(day, today) && !isToday(day);
            const dayOfWeek = day.getDay();
            const isAvailable =
              inMonth && !isPast && availableDays.includes(dayOfWeek);

            return (
              <button
                key={i}
                onClick={() => isAvailable && onDateSelect(day)}
                disabled={!isAvailable}
                className={cn(
                  "relative flex items-center justify-center py-2 text-sm transition-colors",
                  !inMonth && "text-gray-300 dark:text-gray-600",
                  inMonth && isPast && "text-gray-300 dark:text-gray-600",
                  inMonth &&
                    !isPast &&
                    !selected &&
                    isAvailable &&
                    "text-gray-600 dark:text-gray-300 font-medium text-[#2A388F] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full cursor-pointer",
                  inMonth &&
                    !isPast &&
                    !isAvailable &&
                    "text-gray-400 dark:text-gray-500",
                  selected &&
                    "text-white font-bold"
                )}
              >
                {selected ? (
                  <span className="w-8 h-8 flex items-center justify-center bg-[#2A388F] text-white rounded-full shadow-md shadow-[#2A388F]/30">
                    {format(day, "d")}
                  </span>
                ) : isToday(day) && inMonth ? (
                  <span className="w-8 h-8 flex items-center justify-center border-2 border-[#2A388F] rounded-full font-bold text-[#2A388F]">
                    {format(day, "d")}
                  </span>
                ) : (
                  format(day, "d")
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
