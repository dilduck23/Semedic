"use client";

import { MaterialIcon } from "@/components/shared/material-icon";
import { cn } from "@/lib/utils";
import { useMedicalCenters } from "@/hooks/use-medical-centers";
import { Skeleton } from "@/components/ui/skeleton";

interface CenterSelectorProps {
  selectedId: string | null;
  onSelect: (id: string, name: string) => void;
}

export function CenterSelector({ selectedId, onSelect }: CenterSelectorProps) {
  const { data: centers, isLoading } = useMedicalCenters();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {centers?.map((center) => {
        const isSelected = selectedId === center.id;

        return (
          <button
            key={center.id}
            onClick={() => onSelect(center.id, center.name)}
            className={cn(
              "w-full p-4 rounded-2xl text-left transition-all border-2",
              isSelected
                ? "border-[#2A388F] bg-blue-50 dark:bg-blue-900/20"
                : "border-transparent bg-card shadow-soft hover:shadow-lg"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  isSelected
                    ? "bg-[#2A388F] text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <MaterialIcon name="local_hospital" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{center.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {center.address}
                </p>
                {center.hours && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <MaterialIcon name="schedule" className="text-xs align-middle mr-0.5" />
                    {center.hours}
                  </p>
                )}
              </div>
              {isSelected && (
                <MaterialIcon name="check_circle" className="text-[#2A388F] text-xl shrink-0" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
