"use client";

export const dynamic = "force-dynamic";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { WaitingRoom } from "@/components/video/waiting-room";
import type { VideoSession } from "@/types";

export default function WaitingRoomPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const [session, setSession] = useState<VideoSession | null>(null);
  const [appointmentInfo, setAppointmentInfo] = useState<{
    date: string;
    time: string;
    doctorName: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: sessionData } = await supabase
        .from("video_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionData) {
        setSession(sessionData as VideoSession);

        const { data: appt } = await supabase
          .from("appointments")
          .select("date, start_time, doctor:doctors(full_name)")
          .eq("id", sessionData.appointment_id)
          .single();

        if (appt) {
          const doctor = appt.doctor as unknown as { full_name: string } | null;
          setAppointmentInfo({
            date: new Date(appt.date).toLocaleDateString("es", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }),
            time: appt.start_time,
            doctorName: doctor?.full_name || "",
          });
        }
      }
    };

    fetchData();
  }, [sessionId]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2A388F] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <WaitingRoom
      sessionId={sessionId}
      appointmentDate={appointmentInfo?.date}
      appointmentTime={appointmentInfo?.time}
      doctorName={appointmentInfo?.doctorName}
    />
  );
}
