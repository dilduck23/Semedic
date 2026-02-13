"use client";

import { useEffect, useRef } from "react";
import { useChatMessages, useMarkMessagesRead } from "@/hooks/use-chat";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageListProps {
  roomId: string;
  currentUserId: string;
  isOtherUserTyping: boolean;
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoy";
  if (date.toDateString() === yesterday.toDateString()) return "Ayer";

  return date.toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export function MessageList({
  roomId,
  currentUserId,
  isOtherUserTyping,
}: MessageListProps) {
  const { data: messages, isLoading } = useChatMessages(roomId);
  const markRead = useMarkMessagesRead();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherUserTyping]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages && messages.some((m) => !m.is_read && m.sender_id !== currentUserId)) {
      markRead.mutate(roomId);
    }
  }, [messages, roomId, currentUserId, markRead]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
          >
            <Skeleton className="h-10 w-48 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground text-center">
          No hay mensajes aun. Inicia la conversacion!
        </p>
      </div>
    );
  }

  // Group messages by date
  let lastDate = "";

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4">
      {messages.map((message) => {
        const messageDate = new Date(message.created_at).toDateString();
        const showDateHeader = messageDate !== lastDate;
        lastDate = messageDate;

        return (
          <div key={message.id}>
            {showDateHeader && (
              <div className="flex justify-center my-4">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {formatDateHeader(message.created_at)}
                </span>
              </div>
            )}
            <MessageBubble
              message={message}
              isOwn={message.sender_id === currentUserId}
            />
          </div>
        );
      })}
      {isOtherUserTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
