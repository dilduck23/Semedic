"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useAppointments, useCancelAppointment } from "@/hooks/use-appointments";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Appointment } from "@/types";

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayHour}:${minutes} ${period}`;
}

function AppointmentCard({
  appointment,
  onCancel,
}: {
  appointment: Appointment;
  onCancel: (id: string) => void;
}) {
  const doctor = appointment.doctor;
  const specialty = doctor?.specialty;
  const formattedDate = format(new Date(appointment.date), "d 'de' MMMM, yyyy", {
    locale: es,
  });
  const canCancel = ["pending", "confirmed"].includes(appointment.status);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12 border-2 border-[#2A388F]">
            <AvatarImage src={doctor?.avatar_url || undefined} />
            <AvatarFallback className="bg-[#2A388F] text-white text-xs font-semibold">
              {doctor?.full_name?.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              {doctor?.full_name}
            </h3>
            <p className="text-xs text-gray-500">{specialty?.name}</p>
          </div>
        </div>
        <span
          className={cn(
            "text-xs font-semibold px-2 py-1 rounded-lg",
            APPOINTMENT_STATUS_COLORS[appointment.status]
          )}
        >
          {APPOINTMENT_STATUS_LABELS[appointment.status]}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <MaterialIcon name="calendar_today" className="text-sm mr-2" />
          {formattedDate}
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <MaterialIcon name="schedule" className="text-sm mr-2" />
          {formatTime(appointment.start_time)} -{" "}
          {formatTime(appointment.end_time)}
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <MaterialIcon
            name={appointment.type === "virtual" ? "videocam" : "location_on"}
            className="text-sm mr-2"
          />
          {appointment.type === "virtual"
            ? "Cita Virtual"
            : appointment.medical_center?.name || "Presencial"}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-[#2A388F] font-bold">
          ${appointment.price.toFixed(2)}
        </span>
        {canCancel && (
          <button
            onClick={() => onCancel(appointment.id)}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: appointments, isLoading } = useAppointments(tab);
  const cancelMutation = useCancelAppointment();

  async function handleConfirmCancel() {
    if (!cancelId) return;
    try {
      await cancelMutation.mutateAsync({
        id: cancelId,
        reason: cancelReason,
      });
      toast.success("Cita cancelada exitosamente");
      setCancelId(null);
      setCancelReason("");
    } catch {
      toast.error("Error al cancelar la cita");
    }
  }

  return (
    <>
      {/* Header */}
      <header className="pt-12 lg:pt-6 pb-4 px-6 bg-card sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl font-bold text-center mb-4">Mis Citas</h1>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => setTab("upcoming")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === "upcoming"
                ? "bg-card text-[#2A388F] shadow-sm"
                : "text-gray-500"
            )}
          >
            Proximas
          </button>
          <button
            onClick={() => setTab("past")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === "past"
                ? "bg-card text-[#2A388F] shadow-sm"
                : "text-gray-500"
            )}
          >
            Pasadas
          </button>
        </div>
      </header>

      <main className="px-6 lg:px-8 pt-4 pb-8">
        {isLoading ? (
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : appointments?.length ? (
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {appointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              onCancel={(id) => setCancelId(id)}
            />
          ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MaterialIcon
              name="event_busy"
              className="text-gray-300 text-6xl mb-4"
            />
            <p className="text-gray-500 font-medium">
              {tab === "upcoming"
                ? "No tienes citas programadas"
                : "No tienes citas pasadas"}
            </p>
          </div>
        )}
      </main>

      {/* Cancel dialog */}
      <Dialog
        open={!!cancelId}
        onOpenChange={(open) => !open && setCancelId(null)}
      >
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Cancelar Cita</DialogTitle>
            <DialogDescription>
              Estas seguro de que deseas cancelar esta cita? Esta accion no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Motivo de cancelacion (opcional)"
            className="w-full p-3 bg-background border border-border rounded-xl text-sm resize-none h-20"
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelId(null)}>
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
