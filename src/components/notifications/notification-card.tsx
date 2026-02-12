"use client";

import { MaterialIcon } from "@/components/shared/material-icon";
import { NOTIFICATION_TYPE_ICONS } from "@/lib/constants";
import type { Notification } from "@/types";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Hace un momento";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days}d`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

const TYPE_COLORS: Record<string, string> = {
  appointment_confirmed: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  appointment_cancelled: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  appointment_reminder: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
  promotion: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
};

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export function NotificationCard({ notification, onMarkRead }: NotificationCardProps) {
  const iconName = NOTIFICATION_TYPE_ICONS[notification.type] || "notifications";
  const colorClass = TYPE_COLORS[notification.type] || "bg-gray-100 dark:bg-gray-800 text-gray-600";

  return (
    <button
      onClick={() => {
        if (!notification.is_read) onMarkRead(notification.id);
      }}
      className={`w-full text-left p-4 rounded-xl transition-colors ${
        notification.is_read
          ? "bg-card"
          : "bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          <MaterialIcon name={iconName} className="text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold ${!notification.is_read ? "text-foreground" : "text-gray-600 dark:text-gray-400"}`}>
              {notification.title}
            </p>
            {!notification.is_read && (
              <div className="w-2 h-2 rounded-full bg-[#2A388F] flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {timeAgo(notification.created_at)}
          </p>
        </div>
      </div>
    </button>
  );
}
