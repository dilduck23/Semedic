"use client";

import { MaterialIcon } from "@/components/shared/material-icon";
import { Badge } from "@/components/ui/badge";
import type { LabTestType } from "@/types";

interface LabTestCardProps {
  test: LabTestType;
  onSelect: (test: LabTestType) => void;
}

export function LabTestCard({ test, onSelect }: LabTestCardProps) {
  return (
    <button
      onClick={() => onSelect(test)}
      className="w-full p-4 bg-card rounded-2xl shadow-soft hover:shadow-lg transition-all text-left group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
          <MaterialIcon
            name={test.icon_name}
            className="text-purple-600 dark:text-purple-400 group-hover:text-white"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm">{test.name}</h3>
            <span className="text-sm font-bold text-[#2A388F] shrink-0">
              ${test.price.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {test.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-[10px] px-2 py-0">
              {test.category}
            </Badge>
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <MaterialIcon name="schedule" className="text-xs" />
              Resultados en {test.results_time_hours}h
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
