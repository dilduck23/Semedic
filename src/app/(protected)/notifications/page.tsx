"use client";

export const dynamic = "force-dynamic";

import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useUnreadNotificationCount,
} from "@/hooks/use-notifications";
import { NotificationCard } from "@/components/notifications/notification-card";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Notificaciones" />
      <main className="px-6 lg:px-8 flex-1 pb-8 pt-6 lg:max-w-2xl lg:mx-auto">
        {/* Mark all read button */}
        {unreadCount > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="text-sm text-[#2A388F] dark:text-blue-300 font-medium hover:underline disabled:opacity-50"
            >
              Marcar todas como leidas
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notifications list */}
        {!isLoading && notifications && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => markRead.mutate(id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!notifications || notifications.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <MaterialIcon
                name="notifications_none"
                className="text-4xl text-gray-400"
              />
            </div>
            <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-1">
              Sin notificaciones
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Cuando tengas citas o promociones nuevas, te notificaremos aqui
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
