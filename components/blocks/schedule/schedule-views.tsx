"use client"

import * as React from "react"
import { cn } from "cn"
import {
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  type Day,
  type Locale,
} from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  byStart,
  eventsInRange,
  eventsOnDay,
  isBanner,
  layoutBanners,
  layoutDay,
  lastDay,
  monthWeeks,
  slotAt,
  TONE_CLASS,
  TONE_VAR,
  uses12h,
  weekDays,
  type Banner,
  type Overflow,
  type Placed,
  type ScheduleEvent,
  type ScheduleStrings,
} from "./schedule-utils"

export type ViewContext = {
  locale: Locale
  strings: ScheduleStrings
  weekStartsOn?: Day
  now: Date
  onSelect: (event: ScheduleEvent, anchor: HTMLElement) => void
  onMore: (events: ScheduleEvent[], anchor: HTMLElement, title: string) => void
  onCreate: (start: Date) => void
  onOpenDay: (day: Date) => void
}

const tone = (event: ScheduleEvent) => TONE_CLASS[event.tone ?? "blue"]
const toneVar = (event: ScheduleEvent) => TONE_VAR[event.tone ?? "blue"]

export function formatTime(date: Date, locale: Locale) {
  return format(date, "p", { locale })
}

export function describeWhen(
  event: ScheduleEvent,
  ctx: Pick<ViewContext, "locale" | "strings">
) {
  const { locale, strings } = ctx
  const day = (d: Date) => format(d, "PP", { locale })
  if (event.allDay || isBanner(event)) {
    const last = lastDay(event)
    const first = startOfDay(event.start)
    if (event.allDay)
      return isSameDay(first, last)
        ? `${day(first)} · ${strings.allDayEvent}`
        : `${day(first)} – ${day(last)}`
    return `${day(event.start)} ${formatTime(event.start, locale)} – ${day(event.end)} ${formatTime(event.end, locale)}`
  }
  return `${day(event.start)} · ${formatTime(event.start, locale)} – ${formatTime(event.end, locale)}`
}

function DayNumber({
  day,
  ctx,
  className,
}: {
  day: Date
  ctx: ViewContext
  className?: string
}) {
  const today = isSameDay(day, ctx.now)
  return (
    <button
      type="button"
      onClick={() => ctx.onOpenDay(day)}
      aria-label={`${format(day, "d", { locale: ctx.locale })}, ${format(day, "PPPP", { locale: ctx.locale })}`}
      aria-current={today ? "date" : undefined}
      className={cn(
        "grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs font-medium tabular-nums focus-ring hover:bg-muted",
        today && "bg-primary text-primary-foreground hover:bg-primary",
        className
      )}
    >
      {format(day, "d", { locale: ctx.locale })}
    </button>
  )
}

const GUTTER = "grid-cols-[3rem_repeat(var(--cols),minmax(0,1fr))]"

function BannerButton({
  banner,
  ctx,
  style,
  className,
}: {
  banner: Banner
  ctx: ViewContext
  style?: React.CSSProperties
  className?: string
}) {
  const { event } = banner
  return (
    <button
      type="button"
      title={event.title}
      onClick={(e) => ctx.onSelect(event, e.currentTarget)}
      style={style}
      className={cn(
        "flex h-6 min-w-0 items-center rounded-md px-1.5 text-start text-xs font-medium focus-ring hover:brightness-95 dark:hover:brightness-110",
        tone(event),
        banner.fromBefore && "rounded-s-none",
        banner.toAfter && "rounded-e-none",
        className
      )}
    >
      <span className="truncate">{event.title}</span>
    </button>
  )
}

function TimeBlock({ placed, ctx }: { placed: Placed; ctx: ViewContext }) {
  const { event, top, bottom, col, cols } = placed
  const minutes = bottom - top
  return (
    <button
      type="button"
      title={event.title}
      onClick={(e) => ctx.onSelect(event, e.currentTarget)}
      style={{
        top: `${(top / 1440) * 100}%`,
        height: `${(minutes / 1440) * 100}%`,
        insetInlineStart: `${(col / cols) * 100}%`,
        width: `calc(${100 / cols}% - 2px)`,
      }}
      className={cn(
        "absolute z-[1] flex min-w-0 flex-col overflow-hidden rounded-md border-s-2 border-(--tone) px-1.5 py-0.5 text-start text-xs leading-tight ring-1 ring-card focus-ring hover:z-[2] hover:brightness-95 dark:hover:brightness-110",
        minutes < 45 && "flex-row items-baseline gap-1",
        tone(event)
      )}
    >
      <span
        className={cn(
          "min-w-0 font-medium",
          minutes < 45 ? "truncate" : "line-clamp-2"
        )}
      >
        {event.title}
      </span>
      <span className="shrink-0 truncate tabular-nums opacity-80">
        {formatTime(event.start, ctx.locale)}
      </span>
    </button>
  )
}

function OverflowBlock({
  overflow,
  day,
  ctx,
}: {
  overflow: Overflow
  day: Date
  ctx: ViewContext
}) {
  const { top, bottom, col, cols, events } = overflow
  const title = format(day, "PPPP", { locale: ctx.locale })
  return (
    <button
      type="button"
      aria-label={`+${events.length}, ${ctx.strings.eventsOverlap(events.length)}, ${title}`}
      onClick={(e) => ctx.onMore(events, e.currentTarget, title)}
      style={{
        top: `${(top / 1440) * 100}%`,
        height: `${(Math.max(bottom - top, 30) / 1440) * 100}%`,
        insetInlineStart: `${(col / cols) * 100}%`,
        width: `calc(${100 / cols}% - 2px)`,
      }}
      className="absolute z-[1] grid place-items-center rounded-md bg-muted text-xs font-medium text-foreground tabular-nums ring-1 ring-card focus-ring hover:bg-accent"
    >
      +{events.length}
    </button>
  )
}

function HourLabels({ ctx }: { ctx: ViewContext }) {
  const h12 = uses12h(ctx.locale)
  return (
    <div className="relative border-e border-border" aria-hidden>
      {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => (
        <span
          key={h}
          style={{ top: `${(h / 24) * 100}%` }}
          className="absolute end-1.5 -translate-y-1/2 text-[0.6875rem] text-muted-foreground tabular-nums"
        >
          {format(new Date(2000, 0, 1, h), h12 ? "h a" : "HH:mm", {
            locale: ctx.locale,
          })}
        </span>
      ))}
    </div>
  )
}

export function TimeGrid({
  days,
  events,
  ctx,
}: {
  days: Date[]
  events: ScheduleEvent[]
  ctx: ViewContext
}) {
  const single = days.length === 1
  const cap = single ? 4 : 3
  const scroller = React.useRef<HTMLDivElement>(null)
  const { banners, lanes } = layoutBanners(events, days)
  const key = days[0].getTime() + ":" + days.length

  // Open on the working day (or an hour before the first event of the range).
  const firstMinute = events
    .filter((e) => !isBanner(e))
    .reduce((min, e) => Math.min(min, e.start.getHours() * 60), 7 * 60)
  React.useEffect(() => {
    const el = scroller.current
    const body = el?.querySelector<HTMLElement>("[data-grid-body]")
    const header = el?.querySelector<HTMLElement>("[data-grid-header]")
    if (!el || !body) return
    el.scrollTop =
      body.offsetTop +
      body.offsetHeight * (Math.max(0, firstMinute - 60) / 1440) -
      (header?.offsetHeight ?? 0)
  }, [key, firstMinute])

  const now = ctx.now
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return (
    <div
      ref={scroller}
      data-slot="schedule-grid"
      style={
        { "--cols": days.length, "--hour-h": "3.5rem" } as React.CSSProperties
      }
      className="relative min-h-0 flex-1 overflow-auto overscroll-contain rounded-xl bg-card shadow-border"
    >
      <div
        data-grid-header
        className="sticky top-0 z-30 border-b border-border bg-card"
      >
        <div className={cn("grid", GUTTER)}>
          <div className="border-e border-border" />
          {days.map((day) => {
            const today = isSameDay(day, ctx.now)
            return (
              <div
                key={day.getTime()}
                className="flex min-w-0 items-center justify-center gap-1.5 border-e border-border px-1 py-2 last:border-e-0"
              >
                <span
                  className={cn(
                    "truncate text-xs font-medium text-muted-foreground uppercase",
                    today && "text-foreground"
                  )}
                >
                  {format(day, single ? "EEEE" : "EEE", { locale: ctx.locale })}
                </span>
                <DayNumber day={day} ctx={ctx} />
              </div>
            )
          })}
        </div>
        {lanes > 0 && (
          <div className={cn("grid border-t border-border py-1", GUTTER)}>
            <div className="flex items-start justify-end border-e border-border pe-1.5 pt-0.5 text-[0.6875rem] text-muted-foreground">
              <span className="truncate">{ctx.strings.allDay}</span>
            </div>
            <div
              className="grid gap-y-0.5 px-1"
              style={{
                gridColumn: `2 / span ${days.length}`,
                gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
              }}
            >
              {banners.map((b) => (
                <BannerButton
                  key={b.event.id}
                  banner={b}
                  ctx={ctx}
                  style={{
                    gridColumn: `${b.startIdx + 1} / ${b.endIdx + 2}`,
                    gridRow: b.lane + 1,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        data-grid-body
        className={cn("grid h-[calc(24*var(--hour-h))]", GUTTER)}
      >
        <HourLabels ctx={ctx} />
        {days.map((day) => {
          const { placed, overflow } = layoutDay(
            eventsOnDay(events, day),
            day,
            cap
          )
          const today = isSameDay(day, ctx.now)
          const label = format(day, "PPPP", { locale: ctx.locale })
          return (
            <div
              key={day.getTime()}
              role="group"
              aria-label={label}
              onClick={(e) => {
                if (e.target !== e.currentTarget) return
                const rect = e.currentTarget.getBoundingClientRect()
                ctx.onCreate(slotAt(day, (e.clientY - rect.top) / rect.height))
              }}
              className="relative min-w-0 cursor-cell border-e border-border bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_calc(var(--hour-h)-1px),var(--border)_calc(var(--hour-h)-1px),var(--border)_var(--hour-h))] last:border-e-0"
            >
              {placed.map((p) => (
                <TimeBlock key={p.event.id} placed={p} ctx={ctx} />
              ))}
              {overflow.map((o) => (
                <OverflowBlock
                  key={o.events.map((e) => e.id).join("+")}
                  overflow={o}
                  day={day}
                  ctx={ctx}
                />
              ))}
              {today && (
                <div
                  aria-hidden
                  data-slot="schedule-now"
                  style={{ top: `${(nowMinutes / 1440) * 100}%` }}
                  className="pointer-events-none absolute inset-x-0 z-[3] h-px bg-tone-red before:absolute before:-start-1 before:-top-[3px] before:size-[7px] before:rounded-full before:bg-tone-red"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const MONTH_ROWS = 3

function MonthCell({
  day,
  month,
  index,
  banners,
  lanes,
  timed,
  ctx,
}: {
  day: Date
  month: Date
  index: number
  banners: Banner[]
  lanes: number
  timed: ScheduleEvent[]
  ctx: ViewContext
}) {
  const { strings, locale } = ctx
  const slots: (Banner | ScheduleEvent | null)[] = Array.from(
    { length: lanes },
    (_, lane) =>
      banners.find(
        (b) => b.lane === lane && b.startIdx <= index && b.endIdx >= index
      ) ?? null
  )
  const rows = [...slots, ...timed]
  const total = rows.filter(Boolean).length
  const visible =
    rows.length > MONTH_ROWS ? rows.slice(0, MONTH_ROWS - 1) : rows
  const hidden = total - visible.filter(Boolean).length
  const all = eventsOnDay([...banners.map((b) => b.event), ...timed], day).sort(
    byStart
  )
  const title = format(day, "PPPP", { locale })

  return (
    <div
      role="gridcell"
      className={cn(
        "relative h-30 min-w-0 bg-card",
        !isSameMonth(day, month) && "bg-muted/40"
      )}
    >
      {/* The empty space is a real button: Tab reaches it, Enter creates. */}
      <button
        type="button"
        aria-label={`${ctx.strings.newEvent}, ${title}`}
        onClick={() => {
          const start = startOfDay(day)
          start.setHours(9)
          ctx.onCreate(start)
        }}
        className="absolute inset-0 cursor-cell focus-ring"
      />
      <div className="pointer-events-none relative flex h-full min-w-0 flex-col gap-0.5 p-1">
        <div className={cn("flex", !isSameMonth(day, month) && "opacity-60")}>
          <DayNumber day={day} ctx={ctx} className="pointer-events-auto" />
        </div>
        {visible.map((row, i) => {
          if (!row)
            return (
              <div key={`s${i}`} className="pointer-events-none h-6 shrink-0" />
            )
          if ("lane" in row) {
            const first = row.startIdx === index || index === 0
            return (
              <div key={row.event.id} className="-mx-1 flex min-w-0 shrink-0">
                <BannerButton
                  banner={row}
                  ctx={ctx}
                  className={cn(
                    "pointer-events-auto w-full",
                    row.startIdx !== index && "rounded-s-none",
                    row.endIdx !== index && "rounded-e-none",
                    !first && "text-transparent"
                  )}
                />
              </div>
            )
          }
          return (
            <button
              key={row.id}
              type="button"
              title={row.title}
              onClick={(e) => ctx.onSelect(row, e.currentTarget)}
              className={cn(
                "pointer-events-auto flex h-6 min-w-0 shrink-0 items-center gap-1 rounded px-1 text-start text-xs focus-ring hover:bg-muted",
                toneVar(row)
              )}
            >
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full bg-(--tone)"
              />
              <span className="min-w-0 truncate text-foreground">
                <span className="text-muted-foreground tabular-nums">
                  {formatTime(row.start, locale)}
                </span>{" "}
                {row.title}
              </span>
            </button>
          )
        })}
        {hidden > 0 && (
          <button
            type="button"
            onClick={(e) => ctx.onMore(all, e.currentTarget, title)}
            aria-label={`${strings.more(hidden)}, ${title}`}
            className="pointer-events-auto flex h-6 shrink-0 items-center rounded px-1 text-start text-xs font-medium text-muted-foreground focus-ring hover:bg-muted hover:text-foreground"
          >
            {strings.more(hidden)}
          </button>
        )}
      </div>
    </div>
  )
}

export function MonthGrid({
  date,
  events,
  ctx,
}: {
  date: Date
  events: ScheduleEvent[]
  ctx: ViewContext
}) {
  const weeks = monthWeeks(date, ctx.locale, ctx.weekStartsOn)
  const inMonth = eventsInRange(events, weeks[0][0], weeks[weeks.length - 1][6])
  const header = weeks[0]
  return (
    <div
      data-slot="schedule-month"
      className="relative flex min-h-0 flex-1 flex-col overflow-auto overscroll-contain rounded-xl bg-card shadow-border"
    >
      <div
        role="grid"
        aria-label={format(date, "LLLL yyyy", { locale: ctx.locale })}
        className="flex flex-col"
      >
        <div
          role="row"
          className="sticky top-0 z-10 grid grid-cols-7 border-b border-border bg-card"
        >
          {header.map((d) => (
            <div
              key={d.getTime()}
              role="columnheader"
              className="truncate px-2 py-2 text-center text-xs font-medium text-muted-foreground uppercase"
            >
              {format(d, "EEE", { locale: ctx.locale })}
            </div>
          ))}
        </div>
        {weeks.map((week) => {
          const weekEvents = eventsInRange(inMonth, week[0], week[6])
          const { banners, lanes } = layoutBanners(weekEvents, week)
          return (
            <div
              key={week[0].getTime()}
              role="row"
              className="grid grid-cols-7 gap-px border-b border-border bg-border last:border-b-0"
            >
              {week.map((day, i) => (
                <MonthCell
                  key={day.getTime()}
                  day={day}
                  month={date}
                  index={i}
                  banners={banners}
                  lanes={lanes}
                  timed={eventsOnDay(weekEvents, day)
                    .filter((e) => !isBanner(e))
                    .sort(byStart)}
                  ctx={ctx}
                />
              ))}
            </div>
          )
        })}
      </div>
      {!eventsInRange(events, startOfMonth(date), endOfMonth(date)).length && (
        <p className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto w-fit max-w-[80%] -translate-y-1/2 rounded-full bg-popover px-4 py-2 text-center text-sm text-muted-foreground shadow-popover">
          {ctx.strings.nothingHere}
        </p>
      )}
    </div>
  )
}

export function Agenda({
  days,
  events,
  ctx,
  onEmptyCreate,
}: {
  days: Date[]
  events: ScheduleEvent[]
  ctx: ViewContext
  onEmptyCreate: () => void
}) {
  const { locale, strings } = ctx
  const groups = days
    .map((day) => ({
      day,
      items: eventsOnDay(events, day).sort(
        (a, b) => Number(!!isBanner(b)) - Number(!!isBanner(a)) || byStart(a, b)
      ),
    }))
    .filter((g) => g.items.length)

  if (!groups.length)
    return (
      <div className="flex min-h-0 flex-1 rounded-xl bg-card shadow-border">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{strings.noEvents}</EmptyTitle>
            <EmptyDescription>{strings.nothingHere}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={onEmptyCreate}>
              {strings.newEvent}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )

  return (
    <div
      data-slot="schedule-agenda"
      className="min-h-0 flex-1 overflow-auto overscroll-contain rounded-xl bg-card shadow-border"
    >
      {groups.map(({ day, items }) => {
        const today = isSameDay(day, ctx.now)
        return (
          <section
            key={day.getTime()}
            aria-label={format(day, "PPPP", { locale })}
            className="border-b border-border last:border-b-0"
          >
            <h3
              className={cn(
                "sticky top-0 z-10 flex items-center gap-2 bg-card/95 px-4 py-2 text-xs font-medium text-muted-foreground uppercase backdrop-blur-sm",
                today && "text-foreground"
              )}
            >
              <span className="truncate">
                {format(day, "EEEE, PP", { locale })}
              </span>
              {today && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[0.6875rem] text-primary-foreground normal-case">
                  {strings.today}
                </span>
              )}
            </h3>
            <ul className="flex flex-col px-2 pb-2">
              {items.map((event) => {
                const banner = isBanner(event)
                const cont = !isSameDay(event.start, day)
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={(e) => ctx.onSelect(event, e.currentTarget)}
                      className={cn(
                        "flex min-h-11 w-full min-w-0 items-stretch gap-3 rounded-lg px-2 py-1.5 text-start focus-ring hover:bg-muted",
                        toneVar(event)
                      )}
                    >
                      <span className="w-14 shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums">
                        {banner || cont ? (
                          cont && !event.allDay ? (
                            strings.continues
                          ) : (
                            strings.allDay
                          )
                        ) : (
                          <>
                            {formatTime(event.start, locale)}
                            <br />
                            {formatTime(event.end, locale)}
                          </>
                        )}
                      </span>
                      <span
                        aria-hidden
                        className="w-0.5 shrink-0 rounded-full bg-(--tone)"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-sm font-medium text-foreground">
                          {event.title}
                        </span>
                        {event.location && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {event.location}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export { weekDays }
