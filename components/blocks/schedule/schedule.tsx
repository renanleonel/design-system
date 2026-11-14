"use client"

import * as React from "react"
import { cn } from "cn"
import { format, isSameDay, startOfDay, type Day, type Locale } from "date-fns"
import { enUS } from "date-fns/locale"

import { Skeleton } from "@/components/ui/skeleton"
import { toastUndo } from "@/components/ui/sonner"
import { setSearchParams, useSearchParams } from "@/hooks/use-url-state"
import { EventDialog } from "./schedule-event-dialog"
import {
  EventOverlay,
  ScheduleBody,
  ScheduleToolbar,
  rangeFor,
  stepDate,
  type Overlay,
} from "./schedule-parts"
import {
  DATE_PARAM,
  SCHEDULE_VIEWS,
  eventsInRange,
  parseDateParam,
  stringsFor,
  type ScheduleEvent,
  type ScheduleStrings,
  type ScheduleView,
} from "./schedule-utils"
import type { ViewContext } from "./schedule-views"

export type { ScheduleEvent, ScheduleView } from "./schedule-utils"

// The clock ticks once a minute. The server snapshot is 0, so the first client
// render matches the server; `now` can also be pinned (demos, tests).
const subscribeClock = (onChange: () => void) => {
  const id = setInterval(onChange, 60_000)
  return () => clearInterval(id)
}
const minute = () => Math.floor(Date.now() / 60_000) * 60_000
const serverMinute = () => 0

/**
 * Month, week and day calendar. The view (`?view=`) and the date (`?date=`)
 * live in the URL. Week and month fall back to an agenda list when the block is
 * narrower than 42rem (container query), so a phone gets a list, not a grid.
 * Events are held in state; `onEventsChange` hands the new list to the parent.
 */
export function Schedule({
  events: initialEvents,
  locale = enUS,
  weekStartsOn,
  now: nowProp,
  defaultView = "week",
  timeZone = "America/Sao_Paulo",
  strings: stringsProp,
  onEventsChange,
  className,
}: {
  events: ScheduleEvent[]
  /** A date-fns locale: sets the week start, date and time formats, and the UI language (en, pt). */
  locale?: Locale
  /** Overrides the locale's first day of the week (0 = Sunday). */
  weekStartsOn?: Day
  /** Pin "now" (demos, tests); otherwise the clock starts after mount. */
  now?: Date
  defaultView?: ScheduleView
  /** Time zone preselected in the create dialog. */
  timeZone?: string
  strings?: Partial<ScheduleStrings>
  onEventsChange?: (events: ScheduleEvent[]) => void
  className?: string
}) {
  const tick = React.useSyncExternalStore(subscribeClock, minute, serverMinute)
  const now = nowProp ?? (tick ? new Date(tick) : null)

  const params = useSearchParams()
  const strings = React.useMemo(
    () => ({ ...stringsFor(locale), ...stringsProp }),
    [locale, stringsProp]
  )
  const [items, setItems] = React.useState(initialEvents)
  const [overlay, setOverlay] = React.useState<Overlay | null>(null)
  const [creating, setCreating] = React.useState<Date | null>(null)
  const returnFocus = React.useRef<HTMLElement | null>(null)

  const update = (next: ScheduleEvent[]) => {
    setItems(next)
    onEventsChange?.(next)
  }

  if (!now)
    return (
      <Skeleton
        className={cn("min-h-96 flex-1 rounded-xl", className)}
        aria-hidden
      />
    )

  const viewParam = params.get("view") as ScheduleView | null
  const view =
    viewParam && SCHEDULE_VIEWS.includes(viewParam) ? viewParam : defaultView
  const date = parseDateParam(params.get("date"), now) ?? startOfDay(now)

  const goTo = (next: Date) =>
    setSearchParams(
      { date: isSameDay(next, now) ? null : format(next, DATE_PARAM) },
      "push"
    )
  const step = (dir: 1 | -1) => goTo(stepDate(view, date, dir))

  const {
    days,
    agendaDays,
    label: rangeLabel,
  } = rangeFor(view, date, locale, weekStartsOn)

  const ctx: ViewContext = {
    locale,
    strings,
    weekStartsOn,
    now,
    onSelect: (event, anchor) => {
      returnFocus.current = anchor
      setOverlay({ kind: "event", event, anchor })
    },
    onMore: (list, anchor, title) => {
      returnFocus.current = anchor
      setOverlay({ kind: "more", events: list, title, anchor })
    },
    onCreate: (start) => {
      setOverlay(null)
      setCreating(start)
    },
    onOpenDay: (day) =>
      setSearchParams(
        {
          view: "day",
          date: isSameDay(day, now) ? null : format(day, DATE_PARAM),
        },
        "push"
      ),
  }

  const newEventStart = () => {
    const start = startOfDay(date)
    start.setHours(isSameDay(date, now) ? Math.min(now.getHours() + 1, 22) : 9)
    return start
  }

  const rangeEvents = eventsInRange(items, days[0], days[days.length - 1])

  const remove = (event: ScheduleEvent) => {
    setOverlay(null)
    const before = items
    update(items.filter((e) => e.id !== event.id))
    toastUndo(strings.deleted, { onUndo: () => update(before) })
  }

  return (
    <div
      data-slot="schedule"
      className={cn(
        "@container/schedule flex min-h-0 flex-1 flex-col gap-3",
        className
      )}
    >
      <ScheduleToolbar
        view={view}
        date={date}
        rangeLabel={rangeLabel}
        todayActive={isSameDay(date, now)}
        locale={locale}
        weekStartsOn={weekStartsOn}
        strings={strings}
        onToday={() => goTo(now)}
        onStep={step}
        onPickDate={goTo}
        onViewChange={(v) =>
          setSearchParams({ view: v === defaultView ? null : v }, "push")
        }
        onNewEvent={() => ctx.onCreate(newEventStart())}
      />

      <ScheduleBody
        view={view}
        date={date}
        days={days}
        agendaDays={agendaDays}
        events={rangeEvents}
        ctx={ctx}
        onEmptyCreate={() => ctx.onCreate(newEventStart())}
      />

      <EventOverlay
        overlay={overlay}
        returnFocus={returnFocus}
        locale={locale}
        strings={strings}
        onClose={() => setOverlay(null)}
        onPick={setOverlay}
        onDelete={remove}
      />

      <EventDialog
        start={creating}
        onClose={() => setCreating(null)}
        onCreate={(event) => update([...items, event])}
        locale={locale}
        weekStartsOn={weekStartsOn}
        strings={strings}
        timeZone={timeZone}
      />
    </div>
  )
}
