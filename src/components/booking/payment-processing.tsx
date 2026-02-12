"use client";

import { MaterialIcon } from "@/components/shared/material-icon";

export function PaymentProcessing() {
  return (
    <div className="fixed inset-0 z-50 bg-white/95 dark:bg-gray-950/95 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#2A388F] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <MaterialIcon name="credit_card" className="text-2xl text-[#2A388F]" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Procesando tu pago...</h2>
          <p className="text-sm text-gray-500">
            Por favor no cierres esta ventana
          </p>
        </div>
      </div>
    </div>
  );
}
