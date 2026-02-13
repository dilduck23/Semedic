"use client";

import { MaterialIcon } from "@/components/shared/material-icon";
import { Badge } from "@/components/ui/badge";
import type { ExamType } from "@/types";

interface ExamTypeCardProps {
  exam: ExamType;
  onSelect: (exam: ExamType) => void;
}

export function ExamTypeCard({ exam, onSelect }: ExamTypeCardProps) {
  return (
    <button
      onClick={() => onSelect(exam)}
      className="w-full p-4 bg-card rounded-2xl shadow-soft hover:shadow-lg transition-all text-left group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
          <MaterialIcon
            name={exam.icon_name}
            className="text-orange-600 dark:text-orange-400 group-hover:text-white"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm">{exam.name}</h3>
            <span className="text-sm font-bold text-[#2A388F] shrink-0">
              ${exam.price.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {exam.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-[10px] px-2 py-0">
              {exam.category}
            </Badge>
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <MaterialIcon name="schedule" className="text-xs" />
              Resultados en {exam.results_time_hours}h
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
