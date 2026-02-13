"use client";

import { MaterialIcon } from "@/components/shared/material-icon";
import { Card, CardContent } from "@/components/ui/card";

interface PrepInstructionsProps {
  instructions: string;
  examName: string;
  confirmed: boolean;
  onConfirmChange: (confirmed: boolean) => void;
}

export function PrepInstructions({
  instructions,
  examName,
  confirmed,
  onConfirmChange,
}: PrepInstructionsProps) {
  return (
    <div className="space-y-4">
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
              <MaterialIcon name="warning" className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-amber-800 dark:text-amber-200">
                Preparacion Previa Requerida
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Para: {examName}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4">
            <p className="text-sm leading-relaxed">{instructions}</p>
          </div>
        </CardContent>
      </Card>

      <label className="flex items-start gap-3 cursor-pointer p-4 bg-card rounded-2xl shadow-soft">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onConfirmChange(e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded border-gray-300 text-[#2A388F] focus:ring-[#2A388F]"
        />
        <span className="text-sm">
          He leido y entiendo las instrucciones de preparacion para este examen.
          Me comprometo a seguirlas antes de mi cita.
        </span>
      </label>
    </div>
  );
}
