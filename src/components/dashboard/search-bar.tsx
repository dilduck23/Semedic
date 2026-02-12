"use client";

import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/shared/material-icon";
import { ROUTES } from "@/lib/constants";

export function SearchBar() {
  const router = useRouter();

  return (
    <div
      className="relative group cursor-pointer"
      onClick={() => router.push(ROUTES.SPECIALTIES)}
    >
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MaterialIcon
          name="search"
          className="text-gray-400 group-focus-within:text-[#2A388F] transition-colors"
        />
      </div>
      <input
        className="block w-full pl-10 pr-3 py-3.5 border-none rounded-xl bg-card text-foreground placeholder-gray-400 shadow-soft focus:ring-2 focus:ring-[#2A388F] transition-all cursor-pointer"
        placeholder="Buscar especialidad, doctor o centro..."
        type="text"
        readOnly
        onClick={() => router.push(ROUTES.SPECIALTIES)}
      />
    </div>
  );
}
