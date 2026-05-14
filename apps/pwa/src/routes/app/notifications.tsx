import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { createNotificationApi } from "@rs/sdk";

import { AppHeader } from "../../components/app-header";
import { getToken } from "../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const token = getToken();
  const notifApi = createNotificationApi(apiUrl);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notifApi.list(token),
    refetchInterval: 10000,
  });

  return (
    <div className="bg-surface min-h-screen">
      <AppHeader title="Notifications" />

      <div className="space-y-3 px-6 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="bg-surface-container-low mt-8 rounded-xl p-10 text-center">
            <div className="bg-surface-container mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <span className="text-2xl">🔔</span>
            </div>
            <p className="text-on-surface text-sm font-semibold">
              No notifications yet
            </p>
            <p className="text-on-surface-variant mt-1 text-xs">
              You're all caught up!
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-xl p-5 transition ${
                notif.isRead
                  ? "bg-surface-container-lowest shadow-sm"
                  : "bg-secondary-container"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {!notif.isRead && (
                    <span className="bg-secondary mb-1.5 inline-block h-2 w-2 rounded-full" />
                  )}
                  <p
                    className={`text-sm font-semibold ${notif.isRead ? "text-on-surface" : "text-on-secondary-container"}`}
                  >
                    {notif.title}
                  </p>
                  <p
                    className={`mt-1 text-sm leading-relaxed ${notif.isRead ? "text-on-surface-variant" : "text-on-secondary-container"}`}
                  >
                    {notif.message}
                  </p>
                </div>
                <span className="text-on-surface-variant shrink-0 text-xs whitespace-nowrap">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
