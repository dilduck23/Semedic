"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/types";

export function useRealtimeChat(roomId: string, currentUserId: string | null) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // Subscribe to new messages in this room
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;

          // Append to cache
          queryClient.setQueryData<ChatMessage[]>(
            ["chat-messages", roomId],
            (old) => (old ? [...old, newMessage] : [newMessage])
          );

          // Refresh room list for last message preview
          queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
          queryClient.invalidateQueries({ queryKey: ["unread-chat-count"] });
        }
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        const senderId = (payload as { payload?: { user_id?: string } }).payload?.user_id;
        if (senderId && senderId !== currentUserId) {
          setIsOtherUserTyping(true);

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsOtherUserTyping(false);
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [roomId, currentUserId, queryClient, supabase]);

  const sendTypingEvent = useCallback(() => {
    if (!roomId || !currentUserId) return;

    const channel = supabase.channel(`chat:${roomId}`);
    channel.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: currentUserId },
    });
  }, [roomId, currentUserId, supabase]);

  return { isOtherUserTyping, sendTypingEvent };
}
