"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import type { ChatRoom } from "@/types";

interface ChatRoomCardProps {
  room: ChatRoom;
}

export function ChatRoomCard({ room }: ChatRoomCardProps) {
  const doctor = room.doctor;
  const lastMessage = room.last_message;
  const unreadCount = room.unread_count || 0;

  const initials = doctor?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "DR";

  const lastMessagePreview = lastMessage
    ? lastMessage.type === "file"
      ? "Archivo adjunto"
      : lastMessage.content.length > 50
        ? lastMessage.content.slice(0, 50) + "..."
        : lastMessage.content
    : "Sin mensajes aun";

  const lastMessageTime = lastMessage
    ? new Date(lastMessage.created_at).toLocaleTimeString("es", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <Link
      href={`${ROUTES.CHAT}/${room.id}`}
      className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors rounded-xl"
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={doctor?.avatar_url || ""} alt={doctor?.full_name} />
        <AvatarFallback className="bg-blue-100 text-[#2A388F] font-semibold text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm truncate">
            Dr. {doctor?.full_name}
          </p>
          <span className="text-xs text-muted-foreground shrink-0 ml-2">
            {lastMessageTime}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-muted-foreground truncate">
            {lastMessagePreview}
          </p>
          {unreadCount > 0 && (
            <Badge className="ml-2 h-5 min-w-5 px-1.5 text-[10px] bg-[#2A388F] hover:bg-[#2A388F] shrink-0">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
