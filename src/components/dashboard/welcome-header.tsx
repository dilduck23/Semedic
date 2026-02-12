"use client";

import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/use-profile";
import { useUnreadNotificationCount } from "@/hooks/use-notifications";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";

export function WelcomeHeader() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  if (isLoading) {
    return (
      <header className="pt-12 lg:pt-6 pb-6 px-6 flex justify-between items-center bg-card sticky top-0 z-20 shadow-sm">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </header>
    );
  }

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const firstName = profile?.full_name?.split(" ")[0] || "Usuario";

  return (
    <header className="pt-12 lg:pt-6 pb-6 px-6 flex justify-between items-center bg-card sticky top-0 z-20 shadow-sm transition-colors duration-200">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="w-12 h-12 border-2 border-[#2A388F] shadow-sm">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || ""} />
            <AvatarFallback className="bg-[#2A388F] text-white font-semibold">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Bienvenido de nuevo
          </p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Hola, {firstName}
          </h1>
        </div>
      </div>
      <button
        onClick={() => router.push(ROUTES.NOTIFICATIONS)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <MaterialIcon
          name="notifications"
          className="text-gray-600 dark:text-gray-300 text-2xl"
        />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#ED1C24] text-white text-[10px] font-bold rounded-full ring-2 ring-card">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}
