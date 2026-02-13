"use client";

export const dynamic = "force-dynamic";

import { ChatRoomList } from "@/components/chat/chat-room-list";

export default function ChatPage() {
  return (
    <>
      <header className="pt-12 lg:pt-6 pb-4 px-6 bg-card sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl font-bold text-center">Chat</h1>
      </header>
      <main className="max-w-md mx-auto lg:max-w-2xl">
        <ChatRoomList />
      </main>
    </>
  );
}
