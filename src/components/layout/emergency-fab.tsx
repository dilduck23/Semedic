"use client";

import { MaterialIcon } from "@/components/shared/material-icon";

export function EmergencyFAB() {
  return (
    <button
      onClick={() => window.open("tel:911", "_self")}
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 w-14 h-14 bg-[#ED1C24] text-white rounded-full shadow-lg shadow-red-500/40 flex items-center justify-center z-30 hover:scale-105 transition-transform lg:hidden"
      aria-label="Atencion de emergencia"
    >
      <MaterialIcon name="emergency" className="text-2xl" />
    </button>
  );
}
