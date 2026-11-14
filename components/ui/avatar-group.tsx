"use client"

import * as React from "react"
import { cn, initials } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

type AvatarStackPerson = {
  name: string
  /** Picture URL; initials show while it loads or when it's missing. */
  src?: string
}

const SIZE = {
  sm: "h-6 min-w-6 text-[0.625rem]",
  default: "h-8 min-w-8 text-xs",
  lg: "h-10 min-w-10 text-sm",
} as const

/** The popover lists this many; past it, a count (no virtual list needed). */
const LIST_LIMIT = 100

/** 999 -> "999", 12_400 -> "12K": keeps the +N chip from growing. */
const COMPACT_COUNT = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
})

function formatCount(n: number) {
  return n < 1000 ? String(n) : COMPACT_COUNT.format(n)
}

/** Pairs each person with a key: their name, plus a counter for repeats. */
function keyPeople(people: AvatarStackPerson[]) {
  const seen = new Map<string, number>()
  return people.map((person) => {
    const n = seen.get(person.name) ?? 0
    seen.set(person.name, n + 1)
    return { person, key: `${person.name}:${n}` }
  })
}

/**
 * Overlapping avatars for a list of people: members, assignees, viewers. Shows
 * the first `max` and a "+N" chip that opens a popover listing everyone else
 * (a popover rather than a tooltip, so it works on touch and with the
 * keyboard). Each avatar carries the person's name for screen readers and as a
 * hover title. Sizes match `Avatar`.
 *
 * `avatar.tsx` also exports `AvatarGroup` for composing avatars by hand; this
 * builds the whole stack from data.
 */
function AvatarStack({
  people,
  max = 4,
  size = "default",
  label = "People",
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  people: AvatarStackPerson[]
  /** Avatars shown before the +N chip. */
  max?: number
  size?: keyof typeof SIZE
  /** Names the group for screen readers, and titles the overflow list. */
  label?: string
}) {
  const keyed = keyPeople(people)
  const visible = keyed.slice(0, Math.max(0, max))
  const rest = keyed.slice(visible.length)
  return (
    <div
      role="group"
      aria-label={label}
      data-slot="avatar-stack"
      className={cn(
        "flex items-center *:not-first:-ms-2 *:ring-2 *:ring-background",
        className
      )}
      {...props}
    >
      {visible.map(({ person, key }) => (
        <Avatar
          key={key}
          size={size}
          title={person.name}
          className="rounded-full"
        >
          {person.src && <AvatarImage src={person.src} alt="" />}
          <AvatarFallback>{initials(person.name)}</AvatarFallback>
          <span className="sr-only">{person.name}</span>
        </Avatar>
      ))}
      {rest.length > 0 && (
        <Popover>
          <PopoverTrigger
            aria-label={`+${formatCount(rest.length)} more, show all`}
            data-slot="avatar-stack-overflow"
            className={cn(
              "hit-area relative flex shrink-0 items-center justify-center rounded-full bg-muted px-1.5 font-medium text-muted-foreground tabular-nums focus-ring outline-none hover:bg-muted/70 aria-expanded:bg-muted/70",
              SIZE[size]
            )}
          >
            <span aria-hidden>+{formatCount(rest.length)}</span>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 max-w-[90vw] gap-2">
            <PopoverHeader>
              <PopoverTitle>
                {label} ({formatCount(people.length)})
              </PopoverTitle>
            </PopoverHeader>
            <ul className="-mx-1 flex max-h-64 flex-col overflow-y-auto">
              {rest.slice(0, LIST_LIMIT).map(({ person, key }) => (
                <li
                  key={key}
                  className="flex min-h-9 items-center gap-2 px-1"
                >
                  <Avatar size="sm">
                    {person.src && <AvatarImage src={person.src} alt="" />}
                    <AvatarFallback>{initials(person.name)}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 truncate text-sm" title={person.name}>
                    {person.name}
                  </span>
                </li>
              ))}
            </ul>
            {rest.length > LIST_LIMIT && (
              <p className="text-sm text-muted-foreground">
                and {formatCount(rest.length - LIST_LIMIT)} more
              </p>
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

export { AvatarStack }
export type { AvatarStackPerson }
