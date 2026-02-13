"use client";

export const dynamic = "force-dynamic";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DailyProvider } from "@daily-co/daily-react";
import DailyIframe from "@daily-co/daily-js";
import { VideoRoom } from "@/components/video/video-room";
import { useEndVideoSession } from "@/hooks/use-video-session";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants";
import type { VideoSession } from "@/types";

export default function VideoCallPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const endSession = useEndVideoSession();
  const [session, setSession] = useState<VideoSession | null>(null);
  const [callObject, setCallObject] = useState<ReturnType<typeof DailyIframe.createCallObject> | null>(null);

  useEffect(() => {
    const fetchAndJoin = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from("video_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (!data) {
        router.push(ROUTES.APPOINTMENTS);
        return;
      }

      setSession(data as VideoSession);

      // Create Daily call object and join
      const daily = DailyIframe.createCallObject();
      setCallObject(daily);

      try {
        await daily.join({
          url: data.room_url,
          token: data.participant_token || undefined,
        });

        // Update session status to active
        await supabase
          .from("video_sessions")
          .update({ status: "active", started_at: new Date().toISOString() })
          .eq("id", sessionId);
      } catch (error) {
        console.error("Error joining call:", error);
      }
    };

    fetchAndJoin();

    return () => {
      callObject?.leave();
      callObject?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleLeave = useCallback(async () => {
    callObject?.leave();
    callObject?.destroy();

    try {
      await endSession.mutateAsync(sessionId);
    } catch {
      // Session may already be ended
    }

    router.push(ROUTES.APPOINTMENTS);
  }, [callObject, endSession, sessionId, router]);

  if (!callObject || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mb-4" />
        <p className="text-sm text-gray-400">Conectando a la videollamada...</p>
      </div>
    );
  }

  return (
    <DailyProvider callObject={callObject}>
      <div className="h-screen w-screen bg-gray-900">
        <VideoRoom onLeave={handleLeave} />
      </div>
    </DailyProvider>
  );
}
