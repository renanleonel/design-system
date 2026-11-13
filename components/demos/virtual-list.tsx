"use client"

import * as React from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { VirtualList } from "@/components/ui/virtual-list"

const PEOPLE = [
  "Ana Souza",
  "João Silva",
  "Pedro Santos",
  "Maria Oliveira",
  "Lucas Costa",
  "Beatriz Lima",
]
const ACTIONS = [
  "commented on Q3 roadmap",
  "merged “Fix invoice rounding”",
  "invited 3 people to Acme",
  "changed billing to annual",
  "archived Legacy dashboard",
  "deployed api to production",
]

type Event = { id: number; who: string; what: string; minutes: number }

const EVENTS: Event[] = Array.from({ length: 5000 }, (_, i) => ({
  id: i,
  who: PEOPLE[i % PEOPLE.length],
  what: ACTIONS[(i * 7) % ACTIONS.length],
  minutes: i * 3 + 1,
}))

const ago = (m: number) =>
  m < 60 ? `${m}m` : m < 1440 ? `${Math.floor(m / 60)}h` : `${Math.floor(m / 1440)}d`

/** 5,000 events; only the ~10 in view are in the DOM. */
export function Default() {
  return (
    <VirtualList
      items={EVENTS}
      getKey={(e) => e.id}
      estimateSize={52}
      aria-label="Activity"
      className="h-96 w-full max-w-md shadow-border"
      renderItem={(e) => (
        <div className="flex items-center gap-3 border-b px-3 py-2.5 text-sm">
          <Avatar className="size-7">
            <AvatarFallback className="text-xs">
              {e.who
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <p className="min-w-0 flex-1 truncate">
            <span className="font-medium">{e.who}</span>{" "}
            <span className="text-muted-foreground">{e.what}</span>
          </p>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {ago(e.minutes)}
          </span>
        </div>
      )}
    />
  )
}

/** Loads 50 more as the end nears (onEndReached), up to 500. */
export function LoadMore() {
  const [count, setCount] = React.useState(50)
  return (
    <VirtualList
      items={EVENTS.slice(0, count)}
      getKey={(e) => e.id}
      estimateSize={44}
      onEndReached={() => setCount((c) => Math.min(c + 50, 500))}
      aria-label="Activity"
      className="h-80 w-full max-w-md shadow-border"
      renderItem={(e, i) => (
        <div className="flex items-center justify-between gap-3 border-b px-3 py-3 text-sm">
          <span className="truncate">
            {e.who} {e.what}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            #{i + 1}
          </span>
        </div>
      )}
    />
  )
}
