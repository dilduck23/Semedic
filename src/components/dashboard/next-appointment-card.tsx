"use client";

import { useRouter } from "next/navigation";
import { useNextAppointment } from "@/hooks/use-appointments";
import { useCountdown } from "@/hooks/use-countdown";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function AppointmentContent({
  appointment,
}: {
  appointment: NonNullable<ReturnType<typeof useNextAppointment>["data"]>;
}) {
  const router = useRouter();
  const countdown = useCountdown(appointment.date, appointment.start_time);
  const doctor = appointment.doctor;
  const specialty = doctor?.specialty;

  const formattedDate = format(new Date(appointment.date), "d MMM", {
    locale: es,
  });
  const formattedTime = appointment.start_time.substring(0, 5);

  return (
    <div className="bg-[#2A388F] rounded-2xl p-5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-8 -mb-8 pointer-events-none" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">
            Siguiente Cita
          </h3>
          <p className="text-white text-lg font-bold">{countdown}</p>
        </div>
        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
          Confirmada
        </span>
      </div>

      <div className="flex items-center space-x-4 mb-5 relative z-10">
        <Avatar className="w-14 h-14 border-2 border-white/30">
          <AvatarImage src={doctor?.avatar_url || undefined} />
          <AvatarFallback className="bg-white/20 text-white">
            {doctor?.full_name?.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="text-white font-bold">{doctor?.full_name}</h4>
          <p className="text-blue-100 text-sm">{specialty?.name}</p>
          <div className="flex items-center text-blue-200 text-xs mt-1">
            <MaterialIcon name="schedule" className="text-sm mr-1" />
            {formattedDate}, {formattedTime}
          </div>
        </div>
      </div>

      <div className="flex space-x-3 relative z-10">
        <button
          onClick={() => router.push(ROUTES.APPOINTMENTS)}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-sm font-medium transition-colors border border-white/20"
        >
          Ver detalles
        </button>
        {appointment.type === "virtual" && (
          <button className="flex-1 bg-white text-[#2A388F] hover:bg-gray-50 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm flex justify-center items-center space-x-1">
            <MaterialIcon name="videocam" className="text-base" />
            <span>Iniciar</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function NextAppointmentCard() {
  const { data: appointment, isLoading } = useNextAppointment();
  const router = useRouter();

  if (isLoading) {
    return <Skeleton className="h-48 rounded-2xl" />;
  }

  if (!appointment) {
    return (
      <div className="bg-[#2A388F] rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 pointer-events-none" />
        <div className="text-center py-4 relative z-10">
          <MaterialIcon
            name="calendar_today"
            className="text-white/60 text-4xl mb-2"
          />
          <p className="text-white font-semibold mb-1">
            No tienes citas programadas
          </p>
          <p className="text-blue-200 text-sm mb-4">
            Agenda tu primera cita hoy
          </p>
          <button
            onClick={() => router.push(ROUTES.SPECIALTIES)}
            className="bg-white text-[#2A388F] px-6 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Agendar Cita
          </button>
        </div>
      </div>
    );
  }

  return <AppointmentContent appointment={appointment} />;
}
