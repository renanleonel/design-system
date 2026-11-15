"use client"

import * as React from "react"
import { cn } from "cn"
import {
  ArrowRightIcon,
  AtSignIcon,
  FileIcon,
  HistoryIcon,
  ListFilterIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  RepeatIcon,
  UserPlusIcon,
} from "lucide-react"

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
import { IconTile } from "@/components/ui/icon-tile"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Timeline,
  TimelineDescription,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIntersection } from "@/hooks/use-intersection"
import { setSearchParams, useSearchParams } from "@/hooks/use-url-state"
import { initials } from "@/lib/utils"

export type ActivityType =
  | "comment"
  | "status"
  | "assignment"
  | "upload"
  | "mention"

export type ActivityEvent = {
  id: string
  type: ActivityType
  actor: { name: string }
  at: string
  target: string
  href?: string
  body?: string
  from?: string
  to?: string
  assignee?: string
  file?: { name: string; size: string }
}

const TYPES: Record<
  ActivityType,
  {
    icon: React.ReactNode
    tone: "blue" | "purple" | "amber" | "green" | "orange"
    label: string
    noun: string
  }
> = {
  comment: {
    icon: <MessageSquareIcon />,
    tone: "blue",
    label: "Comments",
    noun: "comments",
  },
  status: {
    icon: <RepeatIcon />,
    tone: "purple",
    label: "Status",
    noun: "status changes",
  },
  assignment: {
    icon: <UserPlusIcon />,
    tone: "amber",
    label: "Assignments",
    noun: "assignments",
  },
  upload: {
    icon: <FileIcon />,
    tone: "green",
    label: "Files",
    noun: "uploads",
  },
  mention: {
    icon: <AtSignIcon />,
    tone: "orange",
    label: "Mentions",
    noun: "mentions",
  },
}
const TYPE_IDS = Object.keys(TYPES) as ActivityType[]

/** A run of this many same-type, same-actor events collapses behind its first. */
const MIN_RUN = 4

const clock = new Intl.DateTimeFormat("en", {
  hour: "numeric",
  minute: "2-digit",
})
const full = new Intl.DateTimeFormat("en", {
  dateStyle: "full",
  timeStyle: "medium",
})
const dayLong = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "short",
  day: "numeric",
})
const dayYear = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

function dayLabel(d: Date, now: Date) {
  const days = Math.round(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
      86_400_000
  )
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  return (d.getFullYear() === now.getFullYear() ? dayLong : dayYear).format(d)
}

function relative(d: Date, now: Date) {
  const s = Math.max(0, (now.getTime() - d.getTime()) / 1000)
  if (s < 60) return "Just now"
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86_400 && dayKey(d) === dayKey(now))
    return `${Math.floor(s / 3600)} h ago`
  return clock.format(d)
}

/** `ActivityFeed` only needs `events`, `hasMore`, `loading` and `error`: swap this for your own fetching. */
export function useActivityPages(
  all: ActivityEvent[],
  {
    pageSize = 20,
    delay = 600,
    failOnce,
  }: { pageSize?: number; delay?: number; failOnce?: number } = {}
) {
  const [count, setCount] = React.useState(() => Math.min(pageSize, all.length))
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const failed = React.useRef(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const loadMore = React.useCallback(() => {
    if (loading || count >= all.length) return
    setLoading(true)
    setError(null)
    timer.current = setTimeout(() => {
      setLoading(false)
      if (failOnce !== undefined && count >= failOnce && !failed.current) {
        failed.current = true
        setError("Couldn't load more activity")
        return
      }
      setCount((c) => Math.min(c + pageSize, all.length))
    }, delay)
  }, [loading, count, all.length, pageSize, delay, failOnce])

  return {
    events: React.useMemo(() => all.slice(0, count), [all, count]),
    hasMore: count < all.length,
    loading,
    error,
    loadMore,
  }
}

function Name({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-foreground">{children}</span>
}

function EventTime({ at, now }: { at: string; now: Date }) {
  const d = new Date(at)
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <TimelineTime
            dateTime={at}
            suppressHydrationWarning
            className="cursor-default"
          />
        }
      >
        <span aria-hidden suppressHydrationWarning>
          {relative(d, now)}
        </span>
        <span className="sr-only" suppressHydrationWarning>
          {full.format(d)}
        </span>
      </TooltipTrigger>
      <TooltipContent suppressHydrationWarning>{full.format(d)}</TooltipContent>
    </Tooltip>
  )
}

function Sentence({ e }: { e: ActivityEvent }) {
  const target = e.href ? (
    <a
      href={e.href}
      className="rounded-sm font-medium text-foreground underline-offset-4 focus-ring hover:underline"
    >
      {e.target}
    </a>
  ) : (
    <Name>{e.target}</Name>
  )
  switch (e.type) {
    case "comment":
      return <>commented on {target}</>
    case "mention":
      return <>mentioned you in {target}</>
    case "status":
      return <>changed the status of {target}</>
    case "assignment":
      return (
        <>
          assigned {target} to <Name>{e.assignee}</Name>
        </>
      )
    case "upload":
      return <>uploaded a file to {target}</>
  }
}

function Detail({ e }: { e: ActivityEvent }) {
  if ((e.type === "comment" || e.type === "mention") && e.body)
    return (
      <blockquote
        dir="auto"
        className="mt-1 line-clamp-3 border-s-2 ps-3 text-sm [overflow-wrap:anywhere] text-foreground"
      >
        {e.body}
      </blockquote>
    )
  if (e.type === "status" && e.from && e.to)
    return (
      <span className="mt-1 flex flex-wrap items-center gap-1.5">
        <Badge tone="gray" className="max-w-40">
          <span className="truncate">{e.from}</span>
        </Badge>
        <ArrowRightIcon
          aria-label="to"
          className="size-3.5 text-muted-foreground rtl:rotate-180"
        />
        <Badge tone="purple" className="max-w-40">
          <span className="truncate">{e.to}</span>
        </Badge>
      </span>
    )
  if (e.type === "upload" && e.file)
    return (
      <span className="mt-1 inline-flex max-w-full items-center gap-2 rounded-lg p-1.5 pe-3 shadow-border">
        <IconTile tone="green" size="sm">
          <FileIcon />
        </IconTile>
        <span dir="auto" className="min-w-0 truncate text-sm text-foreground">
          {e.file.name}
        </span>
        <span className="shrink-0 text-xs tabular-nums">{e.file.size}</span>
      </span>
    )
  return null
}

function EventItem({ e, now }: { e: ActivityEvent; now: Date }) {
  const meta = TYPES[e.type]
  return (
    <TimelineItem icon={meta.icon} tone={meta.tone}>
      <TimelineHeader>
        <span className="flex min-w-0 flex-1 items-start gap-2">
          <Avatar size="sm" className="mt-px">
            <AvatarFallback>{initials(e.actor.name)}</AvatarFallback>
          </Avatar>
          <TimelineTitle
            dir="auto"
            className="min-w-0 flex-1 py-0.5 text-sm leading-snug font-normal [overflow-wrap:anywhere] text-muted-foreground"
          >
            <Name>{e.actor.name}</Name> <Sentence e={e} />
          </TimelineTitle>
        </span>
        <EventTime at={e.at} now={now} />
      </TimelineHeader>
      <TimelineDescription>
        <Detail e={e} />
      </TimelineDescription>
    </TimelineItem>
  )
}

type Entry =
  | { kind: "event"; event: ActivityEvent }
  | { kind: "run"; id: string; type: ActivityType; rest: ActivityEvent[] }

type Day = { key: string; date: Date; entries: Entry[] }

function group(events: ActivityEvent[]): Day[] {
  const days: { key: string; date: Date; events: ActivityEvent[] }[] = []
  for (const e of events) {
    const date = new Date(e.at)
    const key = dayKey(date)
    const last = days[days.length - 1]
    if (last?.key === key) last.events.push(e)
    else days.push({ key, date, events: [e] })
  }
  return days.map(({ key, date, events: list }) => {
    const entries: Entry[] = []
    for (let i = 0; i < list.length;) {
      let j = i + 1
      while (
        j < list.length &&
        list[j].type === list[i].type &&
        list[j].actor.name === list[i].actor.name
      )
        j++
      entries.push({ kind: "event", event: list[i] })
      if (j - i >= MIN_RUN)
        entries.push({
          kind: "run",
          id: list[i].id,
          type: list[i].type,
          rest: list.slice(i + 1, j),
        })
      else
        for (let k = i + 1; k < j; k++)
          entries.push({ kind: "event", event: list[k] })
      i = j
    }
    return { key, date, entries }
  })
}

/** Holds no data: pass `events` newest first, or take them from `useActivityPages`. */
export function ActivityFeed({
  events,
  hasMore = false,
  loading = false,
  error,
  onLoadMore,
  now: nowProp,
  className,
}: {
  events: ActivityEvent[]
  hasMore?: boolean
  loading?: boolean
  error?: string | null
  onLoadMore?: () => void
  now?: Date | string
  className?: string
}) {
  const [now] = React.useState(() => (nowProp ? new Date(nowProp) : new Date()))
  const typeParam = useSearchParams().get("type")
  const active = React.useMemo(
    () =>
      (typeParam?.split(",") ?? []).filter((t): t is ActivityType =>
        TYPE_IDS.includes(t as ActivityType)
      ),
    [typeParam]
  )
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())

  const shown = React.useMemo(() => {
    if (!active.length) return events
    const wanted = new Set(active)
    return events.filter((e) => wanted.has(e.type))
  }, [events, active])
  const days = React.useMemo(() => group(shown), [shown])

  // Load ahead of the end; the effect re-runs after each page, so a filter
  // that hides most events keeps loading until the sentinel leaves view.
  const [sentinel, { isIntersecting }] = useIntersection<HTMLDivElement>({
    rootMargin: "600px",
  })
  React.useEffect(() => {
    if (isIntersecting && hasMore && !loading && !error) onLoadMore?.()
  }, [isIntersecting, hasMore, loading, error, onLoadMore, events.length])

  const setTypes = (next: string[]) =>
    setSearchParams({ type: next.length ? next.join(",") : null })

  return (
    <div
      data-slot="activity-feed"
      className={cn("@container/feed flex flex-col gap-6", className)}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ListFilterIcon className="size-4" aria-hidden />
          Show
        </span>
        <ToggleGroup
          multiple
          value={active}
          onValueChange={(v) => setTypes(v.map(String))}
          variant="outline"
          size="sm"
          spacing={1}
          aria-label="Filter by event type"
          className="flex-wrap"
        >
          {TYPE_IDS.map((id) => (
            <ToggleGroupItem key={id} value={id}>
              {TYPES[id].icon}
              {TYPES[id].label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {active.length > 0 && (
          <Button variant="ghost" size="xs" onClick={() => setTypes([])}>
            Clear
          </Button>
        )}
      </div>

      {days.length === 0 && !hasMore && !loading ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HistoryIcon />
            </EmptyMedia>
            <EmptyTitle>
              {active.length ? "No matching activity" : "No activity yet"}
            </EmptyTitle>
            <EmptyDescription>
              {active.length
                ? "Nothing of that type has happened. Try another filter."
                : "Comments, status changes and uploads show up here as they happen."}
            </EmptyDescription>
          </EmptyHeader>
          {active.length > 0 && (
            <EmptyContent>
              <Button variant="outline" size="sm" onClick={() => setTypes([])}>
                Show everything
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="flex flex-col gap-8">
          {days.map((day) => {
            const headingId = `feed-day-${day.key}`
            return (
              <section key={day.key} aria-labelledby={headingId}>
                <h3
                  id={headingId}
                  suppressHydrationWarning
                  className="mb-3 text-sm font-semibold"
                >
                  {dayLabel(day.date, now)}
                </h3>
                <Timeline>
                  {day.entries.map((entry) => {
                    if (entry.kind === "event")
                      return (
                        <EventItem
                          key={entry.event.id}
                          e={entry.event}
                          now={now}
                        />
                      )
                    const open = expanded.has(entry.id)
                    return (
                      <React.Fragment key={`run-${entry.id}`}>
                        <TimelineItem>
                          <Button
                            variant="ghost"
                            size="xs"
                            aria-expanded={open}
                            className="-ms-2 w-fit"
                            onClick={() =>
                              setExpanded((s) => {
                                const next = new Set(s)
                                if (!next.delete(entry.id)) next.add(entry.id)
                                return next
                              })
                            }
                          >
                            {open
                              ? "Show fewer"
                              : `+${entry.rest.length} more ${TYPES[entry.type].noun}`}
                          </Button>
                        </TimelineItem>
                        {open &&
                          entry.rest.map((e) => (
                            <EventItem key={e.id} e={e} now={now} />
                          ))}
                      </React.Fragment>
                    )
                  })}
                </Timeline>
              </section>
            )
          })}
        </div>
      )}

      {loading && (
        <div
          role="status"
          aria-label="Loading activity"
          className="flex flex-col gap-4"
        >
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="size-6 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div ref={sentinel} aria-hidden className="h-px" />
      <div
        className="flex flex-col items-center gap-2 pb-2 text-sm text-muted-foreground"
        aria-live="polite"
      >
        {error ? (
          <>
            <span role="alert">{error}</span>
            <Button variant="outline" size="sm" onClick={onLoadMore}>
              <RefreshCwIcon data-icon="inline-start" />
              Retry
            </Button>
          </>
        ) : hasMore ? (
          !loading && (
            <Button variant="outline" size="sm" onClick={onLoadMore}>
              Load more
            </Button>
          )
        ) : (
          events.length > 0 && (
            <span>You&apos;ve reached the start of the feed</span>
          )
        )}
      </div>
    </div>
  )
}
