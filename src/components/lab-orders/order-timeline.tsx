"use client";

import { MaterialIcon } from "@/components/shared/material-icon";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

interface TimelineStep {
  status: OrderStatus;
  label: string;
  icon: string;
  date?: string;
}

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  type: "lab" | "exam";
  createdAt?: string;
  updatedAt?: string;
}

const LAB_STEPS: TimelineStep[] = [
  { status: "pending", label: "Solicitud Recibida", icon: "receipt_long" },
  { status: "confirmed", label: "Confirmado", icon: "check_circle" },
  { status: "in_progress", label: "Recoleccion de Muestra", icon: "science" },
  { status: "completed", label: "Resultados Listos", icon: "task_alt" },
];

const EXAM_STEPS: TimelineStep[] = [
  { status: "pending", label: "Solicitud Recibida", icon: "receipt_long" },
  { status: "confirmed", label: "Confirmado", icon: "check_circle" },
  { status: "in_progress", label: "Examen en Proceso", icon: "biotech" },
  { status: "completed", label: "Resultados Listos", icon: "task_alt" },
];

const STATUS_ORDER: OrderStatus[] = ["pending", "confirmed", "in_progress", "completed"];

export function OrderTimeline({ currentStatus, type }: OrderTimelineProps) {
  const steps = type === "lab" ? LAB_STEPS : EXAM_STEPS;
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isCancelled = currentStatus === "cancelled";

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const isCompleted = !isCancelled && index <= currentIndex;
        const isCurrent = !isCancelled && index === currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.status} className="flex gap-3">
            {/* Line and dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCancelled
                      ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                      : "bg-muted text-muted-foreground"
                )}
              >
                <MaterialIcon
                  name={isCompleted ? "check" : step.icon}
                  className="text-base"
                />
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 h-8",
                    isCompleted && index < currentIndex
                      ? "bg-green-500"
                      : "bg-muted"
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-6">
              <p
                className={cn(
                  "font-medium text-sm",
                  isCurrent && "text-green-600 dark:text-green-400",
                  !isCompleted && !isCurrent && "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Estado actual
                </p>
              )}
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center">
              <MaterialIcon name="cancel" className="text-base" />
            </div>
          </div>
          <div>
            <p className="font-medium text-sm text-red-500">Cancelado</p>
          </div>
        </div>
      )}
    </div>
  );
}
