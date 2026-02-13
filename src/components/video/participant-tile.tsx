"use client";

import { useParticipant, useVideoTrack, useAudioTrack } from "@daily-co/daily-react";
import { useEffect, useRef } from "react";
import { MaterialIcon } from "@/components/shared/material-icon";
import { cn } from "@/lib/utils";

interface ParticipantTileProps {
  sessionId: string;
  isLocal?: boolean;
}

export function ParticipantTile({ sessionId, isLocal }: ParticipantTileProps) {
  const participant = useParticipant(sessionId);
  const videoTrack = useVideoTrack(sessionId);
  const audioTrack = useAudioTrack(sessionId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (videoTrack?.persistentTrack && videoRef.current) {
      videoRef.current.srcObject = new MediaStream([videoTrack.persistentTrack]);
    }
  }, [videoTrack?.persistentTrack]);

  useEffect(() => {
    if (audioTrack?.persistentTrack && audioRef.current && !isLocal) {
      audioRef.current.srcObject = new MediaStream([audioTrack.persistentTrack]);
    }
  }, [audioTrack?.persistentTrack, isLocal]);

  const isCameraOff = videoTrack?.state !== "playable";
  const isMicOff = audioTrack?.state !== "playable";

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden bg-gray-900",
        isLocal ? "w-32 h-44 absolute bottom-4 right-4 z-10 shadow-lg" : "w-full h-full"
      )}
    >
      {isCameraOff ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
            <MaterialIcon name="person" className="text-3xl text-gray-400" />
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn("w-full h-full object-cover", isLocal && "mirror")}
        />
      )}

      {!isLocal && <audio ref={audioRef} autoPlay playsInline />}

      {/* Name label */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
        {isMicOff && (
          <MaterialIcon name="mic_off" className="text-red-400 text-xs" />
        )}
        <span className="text-white text-xs font-medium">
          {isLocal ? "Tu" : participant?.user_name || "Doctor"}
        </span>
      </div>
    </div>
  );
}
