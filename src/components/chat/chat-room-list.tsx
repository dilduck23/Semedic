"use client";

import { useChatRooms } from "@/hooks/use-chat";
import { ChatRoomCard } from "./chat-room-card";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatRoomList() {
  const { data: rooms, isLoading } = useChatRooms();

  if (isLoading) {
    return (
      <div className="space-y-2 px-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center pt-12 px-6">
        <MaterialIcon
          name="chat_bubble"
          className="text-gray-300 dark:text-gray-600 text-6xl mb-4"
        />
        <h2 className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-2">
          Sin conversaciones
        </h2>
        <p className="text-gray-400 text-sm">
          Las conversaciones se crean automaticamente al agendar una cita virtual.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {rooms.map((room) => (
        <ChatRoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}
