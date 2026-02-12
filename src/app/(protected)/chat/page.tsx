"use client";

import { MaterialIcon } from "@/components/shared/material-icon";

export default function ChatPage() {
  return (
    <>
      <header className="pt-12 lg:pt-6 pb-4 px-6 bg-card sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl font-bold text-center">Chat</h1>
      </header>
      <main className="px-6 pt-12 text-center">
        <MaterialIcon
          name="chat_bubble"
          className="text-gray-300 text-6xl mb-4"
        />
        <h2 className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-2">
          Proximamente
        </h2>
        <p className="text-gray-400 text-sm">
          El chat con tus doctores estara disponible pronto.
        </p>
      </main>
    </>
  );
}
