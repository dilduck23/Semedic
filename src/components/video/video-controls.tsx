"use client";

import { useDaily, useLocalParticipant } from "@daily-co/daily-react";
import { MaterialIcon } from "@/components/shared/material-icon";
import { cn } from "@/lib/utils";

interface VideoControlsProps {
  onLeave: () => void;
}

export function VideoControls({ onLeave }: VideoControlsProps) {
  const daily = useDaily();
  const localParticipant = useLocalParticipant();

  const isCameraOn = localParticipant?.video;
  const isMicOn = localParticipant?.audio;

  const toggleCamera = () => {
    daily?.setLocalVideo(!isCameraOn);
  };

  const toggleMic = () => {
    daily?.setLocalAudio(!isMicOn);
  };

  const toggleScreenShare = async () => {
    if (localParticipant?.screen) {
      daily?.stopScreenShare();
    } else {
      daily?.startScreenShare();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 pb-6 flex justify-center z-20">
      <div className="flex items-center gap-3 bg-black/70 backdrop-blur-sm rounded-full px-6 py-3">
        {/* Mic */}
        <button
          onClick={toggleMic}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            isMicOn
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          )}
        >
          <MaterialIcon name={isMicOn ? "mic" : "mic_off"} className="text-xl" />
        </button>

        {/* Camera */}
        <button
          onClick={toggleCamera}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            isCameraOn
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          )}
        >
          <MaterialIcon
            name={isCameraOn ? "videocam" : "videocam_off"}
            className="text-xl"
          />
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            localParticipant?.screen
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          )}
        >
          <MaterialIcon name="screen_share" className="text-xl" />
        </button>

        {/* Leave */}
        <button
          onClick={onLeave}
          className="w-14 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
        >
          <MaterialIcon name="call_end" className="text-xl" />
        </button>
      </div>
    </div>
  );
}
