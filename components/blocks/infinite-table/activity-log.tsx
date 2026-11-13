"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { SearchXIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { setSearchParams, useSearchParams } from "@/hooks/use-url-state"
import {
  InfiniteTable,
  useCursorPages,
  type CursorPage,
} from "./infinite-table"
import { initials } from "@/lib/utils"

export type ActivityEvent = {
  id: string
  at: string
  level: "info" | "warning" | "error"
  event: string
  actor: string
  resource: string
  durationMs: number
}

const LEVEL = {
  info: { label: "Info", tone: "gray" },
  warning: { label: "Warning", tone: "amber" },
  error: { label: "Error", tone: "red" },
} as const
const EVENTS = [
  "invoice.paid",
  "member.invited",
  "project.created",
  "api_key.rotated",
  "deploy.succeeded",
  "webhook.failed",
  "login.succeeded",
  "export.started",
  "deploy.failed",
  "plan.changed",
]
const ACTORS = [
  "Renan Leonel",
  "Ana Souza",
  "João Silva",
  "Pedro Santos",
  "API",
]

// 1,240 deterministic events, newest first (same on server and client).
const ALL_EVENTS: ActivityEvent[] = Array.from({ length: 1240 }, (_, i) => {
  const event = EVENTS[(i * 7) % EVENTS.length]
  return {
    id: `evt_${(100_000 - i).toString(36)}`,
    at: new Date(Date.UTC(2026, 10, 13, 18, 0, 0) - i * 137_000).toISOString(),
    level: event.endsWith("failed")
      ? "error"
      : event === "api_key.rotated" || i % 13 === 0
        ? "warning"
        : "info",
    event,
    actor: ACTORS[(i * 3) % ACTORS.length],
    resource: `${event.split(".")[0]}_${((i * 7919) % 99_999).toString(36)}`,
    durationMs: 20 + ((i * 7907) % 2400),
  }
})

/**
 * Stands in for `GET /events?cursor=&limit=&level=`. The cursor is the last
 * event's id: stable while new events arrive, unlike an offset.
 */
async function listEvents({
  cursor,
  level,
  failOnce,
  delay = 700,
}: {
  cursor: string | null
  level: string | null
  delay?: number
  failOnce?: { current: boolean } | null
}): Promise<CursorPage<ActivityEvent>> {
  await new Promise((r) => setTimeout(r, delay))
  const matches = level
    ? ALL_EVENTS.filter((e) => e.level === level)
    : ALL_EVENTS
  const start = cursor ? matches.findIndex((e) => e.id === cursor) + 1 : 0
  // ?demo=error: the third page fails once, so Retry has something to do.
  if (failOnce && start >= 80) {
    failOnce.current = true
    throw new Error("Network error")
  }
  const items = matches.slice(start, start + 40)
  const end = start + items.length
  return {
    items,
    nextCursor: end < matches.length ? items.at(-1)!.id : null,
    total: matches.length,
  }
}

const columns: ColumnDef<ActivityEvent>[] = [
  {
    accessorKey: "at",
    header: "Time",
    meta: { skeleton: "w-28" },
    cell: ({ getValue }) => (
      <time
        dateTime={getValue<string>()}
        className="text-muted-foreground tabular-nums"
      >
        {format(new Date(getValue<string>()), "MMM d, HH:mm:ss")}
      </time>
    ),
  },
  {
    accessorKey: "level",
    header: "Level",
    meta: { skeleton: "w-14 rounded-full" },
    cell: ({ getValue }) => {
      const level = LEVEL[getValue<ActivityEvent["level"]>()]
      return <Badge tone={level.tone}>{level.label}</Badge>
    },
  },
  {
    accessorKey: "event",
    header: "Event",
    meta: { skeleton: "w-32" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "actor",
    header: "Actor",
    meta: { hideOnMobile: true, skeleton: "w-28" },
    cell: ({ getValue }) => {
      const name = getValue<string>()
      return (
        <span className="flex items-center gap-2">
          <Avatar size="sm" className="size-5">
            <AvatarFallback className="text-[10px]">
              {name === "API" ? "API" : initials(name)}
            </AvatarFallback>
          </Avatar>
          {name}
        </span>
      )
    },
  },
  {
    accessorKey: "resource",
    header: "Resource",
    meta: { hideOnMobile: true, skeleton: "w-24" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "durationMs",
    header: "Duration",
    meta: { align: "end", hideOnMobile: true, skeleton: "w-12" },
    cell: ({ getValue }) => `${getValue<number>().toLocaleString("en-US")} ms`,
  },
]

const LEVELS = [
  { value: "all", label: "All" },
  { value: "warning", label: "Warnings" },
  { value: "error", label: "Errors" },
]

/** Audit log with level filter (`?level=`), loaded 40 events at a time. */
export function ActivityLog({ className }: { className?: string }) {
  const params = useSearchParams()
  const level = params.get("level")
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Tabs
        value={level ?? "all"}
        onValueChange={(v) =>
          setSearchParams({ level: v === "all" ? null : String(v) })
        }
      >
        <TabsList variant="segmented" aria-label="Level">
          {LEVELS.map((l) => (
            <TabsTrigger key={l.value} value={l.value}>
              {l.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {/* A new filter is a new list: the key resets the loaded pages. */}
      <EventsList
        key={`${level}:${params.get("demo")}`}
        level={level}
        demo={params.get("demo")}
        className={className}
      />
    </div>
  )
}

function EventsList({
  level,
  demo,
  className,
}: {
  level: string | null
  demo: string | null
  className?: string
}) {
  // Read when fetching: the URL is only known after hydration.
  const failed = React.useRef(false)
  const fetchPage = React.useCallback(
    (cursor: string | null) =>
      demo === "empty"
        ? Promise.resolve({ items: [], nextCursor: null, total: 0 })
        : listEvents({
            cursor,
            level,
            failOnce: demo === "error" && !failed.current ? failed : null,
            delay: demo === "slow" ? 4000 : 700,
          }),
    [level, demo]
  )
  const query = useCursorPages(fetchPage)
  return (
    <InfiniteTable
      className={className}
      columns={columns}
      rows={query.rows}
      getRowId={(e) => e.id}
      total={query.total}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      isError={query.isError}
      fetchNextPage={query.fetchNextPage}
      noun={{ one: "event", other: "events" }}
      empty={
        <Empty className="rounded-lg py-16 shadow-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>No events match this filter</EmptyTitle>
            <EmptyDescription>
              Events show up here as your team works.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              onClick={() => setSearchParams({ level: null, demo: null })}
            >
              Show all events
            </Button>
          </EmptyContent>
        </Empty>
      }
    />
  )
}
