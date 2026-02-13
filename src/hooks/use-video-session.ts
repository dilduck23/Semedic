"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { VideoSession } from "@/types";

export function useVideoSession(appointmentId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["video-session", appointmentId],
    queryFn: async (): Promise<VideoSession | null> => {
      const { data, error } = await supabase
        .from("video_sessions")
        .select("*")
        .eq("appointment_id", appointmentId)
        .maybeSingle();

      if (error) throw error;
      return data as VideoSession | null;
    },
    enabled: !!appointmentId,
  });
}

export function useCreateVideoSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string): Promise<VideoSession> => {
      const res = await fetch("/api/video/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: appointmentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear sala de video");
      }

      const { session } = await res.json();
      return session;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({
        queryKey: ["video-session", session.appointment_id],
      });
    },
  });
}

export function useEndVideoSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string): Promise<VideoSession> => {
      const res = await fetch("/api/video/end-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al finalizar sesion");
      }

      const { session } = await res.json();
      return session;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({
        queryKey: ["video-session", session.appointment_id],
      });
    },
  });
}
