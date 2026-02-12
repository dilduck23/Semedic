"use client";

import { MaterialIcon } from "@/components/shared/material-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Doctor } from "@/types";

export function DoctorProfileCard({ doctor }: { doctor: Doctor }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft flex items-center space-x-4">
      <div className="relative">
        <Avatar className="w-16 h-16 border-2 border-[#2A388F]">
          <AvatarImage src={doctor.avatar_url || undefined} />
          <AvatarFallback className="bg-[#2A388F] text-white font-semibold">
            {doctor.full_name.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-card" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
          {doctor.full_name}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {doctor.specialty?.name}
        </p>
        <div className="flex items-center mt-1">
          <MaterialIcon
            name="star"
            className="text-[#2A388F] text-sm mr-1"
            filled
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {doctor.rating}
          </span>
          <span className="mx-2 text-gray-300">-</span>
          <span className="text-[#2A388F] font-bold text-sm">
            ${doctor.consultation_price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
