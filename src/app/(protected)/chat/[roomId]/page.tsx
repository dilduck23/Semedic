"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MaterialIcon } from "@/components/shared/material-icon";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { useRealtimeChat } from "@/hooks/use-realtime-chat";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants";
import type { ChatRoom } from "@/types";

export default function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);

  const { isOtherUserTyping, sendTypingEvent } = useRealtimeChat(
    roomId,
    currentUserId
  );

  useEffect(() => {
    const fetchRoom = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data } = await supabase
        .from("chat_rooms")
        .select(`
          *,
          doctor:doctors(*, specialty:specialties(*)),
          appointment:appointments(date, start_time, type, status)
        `)
        .eq("id", roomId)
        .single();

      setRoom(data as ChatRoom | null);
      setLoading(false);
    };

    fetchRoom();
  }, [roomId]);

  const doctor = room?.doctor;
  const initials = doctor?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "DR";

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] lg:h-screen">
        <div className="h-16 bg-card border-b border-border animate-pulse" />
        <div className="flex-1" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] lg:h-screen">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border sticky top-0 z-20">
        <button
          onClick={() => router.push(ROUTES.CHAT)}
          className="p-1 hover:bg-muted rounded-full transition-colors lg:hidden"
        >
          <MaterialIcon name="arrow_back" className="text-xl" />
        </button>
        <button
          onClick={() => router.push(ROUTES.CHAT)}
          className="p-1 hover:bg-muted rounded-full transition-colors hidden lg:block"
        >
          <MaterialIcon name="arrow_back" className="text-xl" />
        </button>

        <Avatar className="h-10 w-10">
          <AvatarImage src={doctor?.avatar_url || ""} alt={doctor?.full_name} />
          <AvatarFallback className="bg-blue-100 text-[#2A388F] font-semibold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            Dr. {doctor?.full_name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {doctor?.specialty?.name}
          </p>
        </div>
      </header>

      {/* Messages */}
      {currentUserId && (
        <MessageList
          roomId={roomId}
          currentUserId={currentUserId}
          isOtherUserTyping={isOtherUserTyping}
        />
      )}

      {/* Input */}
      <ChatInput
        roomId={roomId}
        disabled={!room?.is_active}
        onTyping={sendTypingEvent}
      />
    </div>
  );
}
