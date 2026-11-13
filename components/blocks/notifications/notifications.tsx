"use client"

import * as React from "react"
import { cn } from "cn"
import {
  ArchiveIcon,
  AtSignIcon,
  BellIcon,
  CheckCheckIcon,
  CheckIcon,
  GitPullRequestIcon,
  RocketIcon,
  UserPlusIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { IconTile } from "@/components/ui/icon-tile"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toastUndo } from "@/components/ui/sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type NotificationKind = "mention" | "review" | "deploy" | "invite"

export type Notification = {
  id: string
  kind: NotificationKind
  title: string
  body?: string
  /** Already formatted: "4 min ago". */
  time: string
  read: boolean
  href?: string
}

const KIND: Record<
  NotificationKind,
  { icon: React.ReactNode; tone: "blue" | "purple" | "green" | "amber" }
> = {
  mention: { icon: <AtSignIcon />, tone: "blue" },
  review: { icon: <GitPullRequestIcon />, tone: "purple" },
  deploy: { icon: <RocketIcon />, tone: "green" },
  invite: { icon: <UserPlusIcon />, tone: "amber" },
}

export const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: "n1", kind: "mention", title: "Ana mentioned you in Q3 roadmap", body: "“@renan can you check the billing numbers before Friday?”", time: "4 min ago", read: false },
  { id: "n2", kind: "review", title: "Marco requested your review on #412", body: "Add usage meters to the billing page", time: "32 min ago", read: false },
  { id: "n3", kind: "deploy", title: "acme-web deployed to production", body: "Build 1f3a9c2 finished in 48s", time: "1 h ago", read: false },
  { id: "n4", kind: "invite", title: "Jade joined the Growth team", time: "3 h ago", read: true },
  { id: "n5", kind: "review", title: "Rui approved #407", body: "Sortable conditions in the rule dialog", time: "Yesterday", read: true },
  { id: "n6", kind: "deploy", title: "billing-api deployed to staging", time: "Yesterday", read: true },
]

/**
 * Notification state with the actions the menu and the feed need. Archiving
 * runs right away and offers undo (no confirm dialog).
 */
export function useNotifications(initial: Notification[]) {
  const [items, setItems] = React.useState(initial)
  const [archived, setArchived] = React.useState<Notification[]>([])
  const markRead = (id: string, read = true) =>
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read } : n)))
  const markAllRead = () =>
    setItems((list) => list.map((n) => ({ ...n, read: true })))
  const archive = (id: string) => {
    const index = items.findIndex((n) => n.id === id)
    const item = items[index]
    if (!item) return
    setItems((list) => list.filter((n) => n.id !== id))
    setArchived((list) => [{ ...item, read: true }, ...list])
    toastUndo("Notification archived", {
      onUndo: () => {
        setArchived((list) => list.filter((n) => n.id !== id))
        setItems((list) => {
          const next = [...list]
          next.splice(index, 0, item)
          return next
        })
      },
    })
  }
  return {
    items,
    archived,
    unread: items.filter((n) => !n.read).length,
    markRead,
    markAllRead,
    archive,
  }
}

type Actions = {
  onMarkRead: (id: string, read?: boolean) => void
  onArchive?: (id: string) => void
}

function NotificationRow({
  item,
  onMarkRead,
  onArchive,
  compact,
}: Actions & { item: Notification; compact?: boolean }) {
  const kind = KIND[item.kind]
  return (
    <li
      data-unread={!item.read || undefined}
      className="group/row relative flex gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60"
    >
      <IconTile tone={kind.tone} size="sm" className="mt-0.5">
        {kind.icon}
      </IconTile>
      <div className="min-w-0 flex-1">
        <a
          href={item.href ?? "#"}
          onClick={() => onMarkRead(item.id)}
          className="rounded-sm text-sm font-medium focus-ring after:absolute after:inset-0 group-not-data-unread/row:font-normal group-not-data-unread/row:text-muted-foreground"
        >
          {item.title}
        </a>
        {item.body && !compact && (
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
            {item.body}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground tabular-nums">
          {item.time}
        </p>
      </div>
      {/* Actions sit above the row link; visible on hover/focus, always on touch. */}
      <div className="relative z-10 flex shrink-0 items-start gap-0.5 opacity-0 transition-opacity group-focus-within/row:opacity-100 group-hover/row:opacity-100 pointer-coarse:opacity-100">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={item.read ? "Mark as unread" : "Mark as read"}
                onClick={() => onMarkRead(item.id, !item.read)}
              />
            }
          >
            <CheckIcon />
          </TooltipTrigger>
          <TooltipContent>
            {item.read ? "Mark as unread" : "Mark as read"}
          </TooltipContent>
        </Tooltip>
        {onArchive && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Archive"
                  onClick={() => onArchive(item.id)}
                />
              }
            >
              <ArchiveIcon />
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
        )}
      </div>
      <span
        aria-hidden
        className="absolute top-4 right-2 size-2 rounded-full bg-primary transition-opacity group-not-data-unread/row:opacity-0 group-focus-within/row:opacity-0 group-hover/row:opacity-0 pointer-coarse:hidden"
      />
      {!item.read && <span className="sr-only">Unread</span>}
    </li>
  )
}

function CaughtUp({ archived }: { archived?: boolean }) {
  return (
    <Empty className="py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {archived ? <ArchiveIcon /> : <CheckCheckIcon />}
        </EmptyMedia>
        <EmptyTitle>{archived ? "Nothing archived" : "You're all caught up"}</EmptyTitle>
        <EmptyDescription>
          {archived
            ? "Archived notifications show up here."
            : "Mentions, reviews and deploys show up here."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

/**
 * The bell in the header: an unread count, a popover with All / Unread, and
 * Shift+N to open it from anywhere.
 */
export function NotificationsMenu({
  items,
  unread,
  onMarkRead,
  onMarkAllRead,
  viewAllHref,
}: Actions & {
  items: Notification[]
  unread: number
  onMarkAllRead: () => void
  viewAllHref?: string
}) {
  const [filter, setFilter] = React.useState("all")
  const shown = filter === "unread" ? items.filter((n) => !n.read) : items
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            hotkey="Shift+N"
            aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
            className="relative"
          />
        }
      >
        <BellIcon />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold text-primary-foreground tabular-nums ring-2 ring-background"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 max-w-[calc(100vw-1rem)] gap-0 p-0">
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
          <Tabs value={filter} onValueChange={(v) => setFilter(String(v))}>
            <TabsList variant="line" aria-label="Filter notifications">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unread > 0 && (
                  <span className="text-muted-foreground tabular-nums">{unread}</span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="ghost"
            size="sm"
            disabled={!unread}
            onClick={onMarkAllRead}
          >
            Mark all as read
          </Button>
        </div>
        {shown.length ? (
          <ul className="flex max-h-96 flex-col overflow-y-auto overscroll-contain p-1">
            {shown.map((item) => (
              <NotificationRow key={item.id} item={item} onMarkRead={onMarkRead} compact />
            ))}
          </ul>
        ) : (
          <CaughtUp />
        )}
        {viewAllHref && (
          <div className="border-t p-1">
            <Button
              variant="ghost"
              className="w-full"
              render={<a href={viewAllHref} />}
              nativeButton={false}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

/** The full feed (an Inbox page): All / Unread / Archived, archive with undo. */
export function NotificationsFeed({
  items,
  archived,
  unread,
  onMarkRead,
  onMarkAllRead,
  onArchive,
  className,
}: Required<Actions> & {
  items: Notification[]
  archived: Notification[]
  unread: number
  onMarkAllRead: () => void
  className?: string
}) {
  const [filter, setFilter] = React.useState("all")
  const shown =
    filter === "archived"
      ? archived
      : filter === "unread"
        ? items.filter((n) => !n.read)
        : items
  return (
    <div className={cn("flex w-full max-w-3xl flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(String(v))}>
          <TabsList variant="segmented" aria-label="Filter notifications">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread {unread > 0 && unread}</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" disabled={!unread} onClick={onMarkAllRead}>
          <CheckCheckIcon data-icon="inline-start" />
          Mark all as read
        </Button>
      </div>
      {shown.length ? (
        <ul className="flex flex-col gap-0.5">
          {shown.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onMarkRead={onMarkRead}
              onArchive={filter === "archived" ? undefined : onArchive}
            />
          ))}
        </ul>
      ) : (
        <CaughtUp archived={filter === "archived"} />
      )}
    </div>
  )
}
