"use client"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import {
  NotificationsFeed,
  NotificationsMenu,
  SAMPLE_NOTIFICATIONS,
  useNotifications,
} from "@/components/blocks/notifications/notifications"

export default function Page() {
  const n = useNotifications(SAMPLE_NOTIFICATIONS)
  return (
    <>
      <AppShellHeader
        title="Inbox"
        description="Mentions, reviews and deploys"
        actions={
          <NotificationsMenu
            items={n.items}
            unread={n.unread}
            onMarkRead={n.markRead}
            onMarkAllRead={n.markAllRead}
          />
        }
      />
      <AppShellContent>
        <NotificationsFeed
          items={n.items}
          archived={n.archived}
          unread={n.unread}
          onMarkRead={n.markRead}
          onMarkAllRead={n.markAllRead}
          onArchive={n.archive}
        />
      </AppShellContent>
    </>
  )
}
