"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants";

interface WaitingRoomProps {
  sessionId: string;
  appointmentDate?: string;
  appointmentTime?: string;
  doctorName?: string;
}

export function WaitingRoom({
  sessionId,
  appointmentDate,
  appointmentTime,
  doctorName,
}: WaitingRoomProps) {
  const router = useRouter();
  const supabase = createClient();

  // Listen for session status changes
  useEffect(() => {
    const channel = supabase
      .channel(`video-wait:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "video_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const newStatus = (payload.new as { status: string }).status;
          if (newStatus === "active") {
            router.push(`${ROUTES.VIDEO}/${sessionId}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, router, supabase]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Animated pulse */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-[#2A388F]/10 animate-ping absolute inset-0" />
        <div className="w-24 h-24 rounded-full bg-[#2A388F]/20 flex items-center justify-center relative">
          <MaterialIcon name="videocam" className="text-4xl text-[#2A388F]" />
        </div>
      </div>

      <h1 className="text-xl font-bold mb-2">Sala de Espera Virtual</h1>
      <p className="text-muted-foreground text-center mb-8">
        Tu doctor se unira pronto. Por favor espera...
      </p>

      {/* Appointment Info */}
      <Card className="w-full max-w-sm mb-8">
        <CardContent className="pt-6 space-y-3">
          {doctorName && (
            <div className="flex items-center gap-3">
              <MaterialIcon name="person" className="text-muted-foreground" />
              <span className="text-sm">Dr. {doctorName}</span>
            </div>
          )}
          {appointmentDate && (
            <div className="flex items-center gap-3">
              <MaterialIcon name="calendar_today" className="text-muted-foreground" />
              <span className="text-sm">{appointmentDate}</span>
            </div>
          )}
          {appointmentTime && (
            <div className="flex items-center gap-3">
              <MaterialIcon name="schedule" className="text-muted-foreground" />
              <span className="text-sm">{appointmentTime}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="space-y-2 text-sm text-muted-foreground max-w-sm">
        <p className="flex items-center gap-2">
          <MaterialIcon name="check_circle" className="text-green-500 text-base" />
          Verifica que tu camara y microfono funcionen
        </p>
        <p className="flex items-center gap-2">
          <MaterialIcon name="check_circle" className="text-green-500 text-base" />
          Busca un lugar tranquilo y bien iluminado
        </p>
        <p className="flex items-center gap-2">
          <MaterialIcon name="check_circle" className="text-green-500 text-base" />
          Ten a mano tus documentos medicos
        </p>
      </div>

      <Button
        variant="outline"
        onClick={() => router.push(ROUTES.APPOINTMENTS)}
        className="mt-8"
      >
        Cancelar y volver
      </Button>
    </div>
  );
}
