"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ChatRoom, ChatMessage } from "@/types";

export function useChatRooms() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["chat-rooms"],
    queryFn: async (): Promise<ChatRoom[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data: rooms, error } = await supabase
        .from("chat_rooms")
        .select(`
          *,
          doctor:doctors(*, specialty:specialties(*)),
          appointment:appointments(date, start_time, type, status)
        `)
        .eq("patient_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Fetch last message and unread count for each room
      const roomsWithMeta = await Promise.all(
        (rooms || []).map(async (room) => {
          const { data: lastMsg } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("room_id", room.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count } = await supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .eq("room_id", room.id)
            .eq("is_read", false)
            .neq("sender_id", user.id);

          return {
            ...room,
            last_message: lastMsg || undefined,
            unread_count: count || 0,
          } as ChatRoom;
        })
      );

      return roomsWithMeta;
    },
  });
}

export function useChatMessages(roomId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["chat-messages", roomId],
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!roomId,
  });
}

export function useSendMessage() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: {
      room_id: string;
      content: string;
      type?: "text" | "file" | "system";
      file_url?: string;
      file_name?: string;
      file_size?: number;
      file_type?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          ...message,
          sender_id: user.id,
          type: message.type || "text",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", variables.room_id] });
      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
    },
  });
}

export function useMarkMessagesRead() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { error } = await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("room_id", roomId)
        .eq("is_read", false)
        .neq("sender_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["unread-chat-count"] });
    },
  });
}

export function useUnreadChatCount() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["unread-chat-count"],
    queryFn: async (): Promise<number> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      // Get rooms where user is participant
      const { data: rooms } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("patient_id", user.id);

      if (!rooms || rooms.length === 0) return 0;

      const roomIds = rooms.map((r) => r.id);

      const { count, error } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .in("room_id", roomIds)
        .eq("is_read", false)
        .neq("sender_id", user.id);

      if (error) throw error;
      return count || 0;
    },
  });
}
