"use client";

import { useParticipantIds, useLocalParticipant } from "@daily-co/daily-react";
import { ParticipantTile } from "./participant-tile";
import { VideoControls } from "./video-controls";

interface VideoRoomProps {
  onLeave: () => void;
}

export function VideoRoom({ onLeave }: VideoRoomProps) {
  const participantIds = useParticipantIds({ filter: "remote" });
  const localParticipant = useLocalParticipant();

  const remoteId = participantIds[0];

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Remote participant (full screen) */}
      {remoteId ? (
        <ParticipantTile sessionId={remoteId} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-white">
          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-4 animate-pulse">
            <span className="text-3xl">DR</span>
          </div>
          <p className="text-sm text-gray-400">
            Esperando al doctor...
          </p>
        </div>
      )}

      {/* Local participant (small overlay) */}
      {localParticipant && (
        <ParticipantTile sessionId={localParticipant.session_id} isLocal />
      )}

      {/* Controls */}
      <VideoControls onLeave={onLeave} />
    </div>
  );
}
