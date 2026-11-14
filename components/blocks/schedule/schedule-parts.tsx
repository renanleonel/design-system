"use client"

import * as React from "react"
import { cn } from "cn"
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  type Day,
  type Locale,
} from "date-fns"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  SCHEDULE_VIEWS,
  TONE_VAR,
  monthDayPattern,
  monthWeeks,
  weekDays,
  type ScheduleEvent,
  type ScheduleStrings,
  type ScheduleView,
} from "./schedule-utils"
import {
  Agenda,
  MonthGrid,
  TimeGrid,
  describeWhen,
  formatTime,
  type ViewContext,
} from "./schedule-views"

export type Overlay = { anchor: HTMLElement } & (
  | { kind: "event"; event: ScheduleEvent }
  | { kind: "more"; events: ScheduleEvent[]; title: string }
)

/** The date one step (a day, week or month, per `view`) before or after `date`. */
export function stepDate(view: ScheduleView, date: Date, dir: 1 | -1) {
  if (view === "month") return addMonths(date, dir)
  if (view === "week") return addWeeks(date, dir)
  return addDays(date, dir)
}

/** The days a view shows, the agenda fallback's days, and the header label. */
export function rangeFor(
  view: ScheduleView,
  date: Date,
  locale: Locale,
  weekStartsOn?: Day
) {
  const days =
    view === "week"
      ? weekDays(date, locale, weekStartsOn)
      : view === "day"
        ? [date]
        : monthWeeks(date, locale, weekStartsOn).flat()
  // Agenda for the narrow fallback: the month's own days only.
  const agendaDays =
    view === "month"
      ? days.filter((d) => d.getMonth() === date.getMonth())
      : days
  const pattern = monthDayPattern(locale)
  const label =
    view === "month"
      ? format(date, "LLLL yyyy", { locale })
      : view === "day"
        ? format(date, "PPPP", { locale })
        : `${format(days[0], pattern, { locale })} – ${format(days[6], `${pattern}, yyyy`, { locale })}`
  return { days, agendaDays, label }
}

export function ScheduleToolbar({
  view,
  date,
  rangeLabel,
  todayActive,
  locale,
  weekStartsOn,
  strings,
  onToday,
  onStep,
  onPickDate,
  onViewChange,
  onNewEvent,
}: {
  view: ScheduleView
  date: Date
  rangeLabel: string
  /** True when `date` is already today, so the Today button is disabled. */
  todayActive: boolean
  locale: Locale
  weekStartsOn?: Day
  strings: ScheduleStrings
  onToday: () => void
  onStep: (dir: 1 | -1) => void
  onPickDate: (date: Date) => void
  onViewChange: (view: string) => void
  onNewEvent: () => void
}) {
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const labels: Record<ScheduleView, string> = {
    month: strings.month,
    week: strings.week,
    day: strings.day,
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToday}
        disabled={todayActive}
      >
        {strings.today}
      </Button>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={strings.previous}
          onClick={() => onStep(-1)}
        >
          <ChevronLeftIcon className="rtl:rotate-180" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={strings.next}
          onClick={() => onStep(1)}
        >
          <ChevronRightIcon className="rtl:rotate-180" />
        </Button>
      </div>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <h2 className="min-w-0 text-base font-semibold first-letter:uppercase">
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="group max-w-full min-w-0 justify-start"
                aria-label={`${rangeLabel}. ${strings.pickDate}`}
              />
            }
          >
            <span className="truncate">{rangeLabel}</span>
            <ChevronDownIcon
              data-icon="inline-end"
              className="transition-transform duration-(--ds-duration-popover) group-data-popup-open:rotate-180"
            />
          </PopoverTrigger>
        </h2>
        <PopoverContent align="start" className="w-auto p-0 max-sm:p-2">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            locale={locale}
            weekStartsOn={weekStartsOn ?? locale.options?.weekStartsOn}
            className="mx-auto"
            onSelect={(d) => {
              if (!d) return
              onPickDate(d)
              setCalendarOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      <div className="ms-auto flex items-center gap-2">
        <Tabs value={view} onValueChange={(v) => onViewChange(String(v))}>
          <TabsList variant="segmented" aria-label={strings.views}>
            {SCHEDULE_VIEWS.map((v) => (
              <TabsTrigger key={v} value={v}>
                {labels[v]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button size="sm" onClick={onNewEvent}>
          <PlusIcon data-icon="inline-start" />
          <span className="max-sm:sr-only">{strings.newEvent}</span>
        </Button>
      </div>
    </div>
  )
}

/** The day grid, or (week and month) the grid wide and the agenda narrow. */
export function ScheduleBody({
  view,
  date,
  days,
  agendaDays,
  events,
  ctx,
  onEmptyCreate,
}: {
  view: ScheduleView
  date: Date
  days: Date[]
  agendaDays: Date[]
  events: ScheduleEvent[]
  ctx: ViewContext
  onEmptyCreate: () => void
}) {
  if (view === "day") return <TimeGrid days={days} events={events} ctx={ctx} />
  return (
    <>
      <div className="hidden min-h-0 flex-1 flex-col @2xl/schedule:flex">
        {view === "week" ? (
          <TimeGrid days={days} events={events} ctx={ctx} />
        ) : (
          <MonthGrid date={date} events={events} ctx={ctx} />
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col @2xl/schedule:hidden">
        <Agenda
          days={agendaDays}
          events={events}
          ctx={ctx}
          onEmptyCreate={onEmptyCreate}
        />
      </div>
    </>
  )
}

/** The popover for one event, or for the events a "+N more" cell hides. */
export function EventOverlay({
  overlay,
  returnFocus,
  locale,
  strings,
  onClose,
  onPick,
  onDelete,
}: {
  overlay: Overlay | null
  returnFocus: React.RefObject<HTMLElement | null>
  locale: Locale
  strings: ScheduleStrings
  onClose: () => void
  onPick: (overlay: Overlay) => void
  onDelete: (event: ScheduleEvent) => void
}) {
  const detail = overlay?.kind === "event" ? overlay.event : null
  return (
    <Popover
      open={overlay !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <PopoverContent
        anchor={overlay?.anchor}
        align="start"
        className="w-80 max-w-[calc(100vw-1rem)] gap-3"
        finalFocus={returnFocus}
      >
        {detail && (
          <>
            <PopoverHeader
              className={cn("gap-1", TONE_VAR[detail.tone ?? "blue"])}
            >
              <PopoverTitle className="flex items-start gap-2 text-base leading-snug">
                <span
                  aria-hidden
                  className="mt-1.5 size-2.5 shrink-0 rounded-full bg-(--tone)"
                />
                <span className="line-clamp-4 min-w-0">{detail.title}</span>
              </PopoverTitle>
              <PopoverDescription className="ps-[1.125rem] tabular-nums">
                {describeWhen(detail, { locale, strings })}
                {detail.timeZone && !detail.allDay && (
                  <span className="block truncate text-xs">
                    {detail.timeZone.replaceAll("_", " ")}
                  </span>
                )}
              </PopoverDescription>
            </PopoverHeader>
            {detail.location && (
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPinIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span className="min-w-0">{detail.location}</span>
              </p>
            )}
            {detail.description && (
              <p className="line-clamp-6 text-pretty">{detail.description}</p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="self-start text-destructive"
              onClick={() => onDelete(detail)}
            >
              <Trash2Icon data-icon="inline-start" />
              {strings.delete}
            </Button>
          </>
        )}
        {overlay?.kind === "more" && (
          <>
            <PopoverHeader>
              <PopoverTitle>{overlay.title}</PopoverTitle>
              <PopoverDescription>
                {strings.eventsOverlap(overlay.events.length)}
              </PopoverDescription>
            </PopoverHeader>
            <ul className="-mx-1 flex max-h-72 flex-col gap-0.5 overflow-y-auto">
              {overlay.events.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() =>
                      onPick({
                        kind: "event",
                        event,
                        anchor: overlay.anchor,
                      })
                    }
                    className={cn(
                      "flex min-h-9 w-full min-w-0 items-center gap-2 rounded-md px-2 py-1 text-start focus-ring hover:bg-muted",
                      TONE_VAR[event.tone ?? "blue"]
                    )}
                  >
                    <span
                      aria-hidden
                      className="size-2 shrink-0 rounded-full bg-(--tone)"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {event.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {event.allDay
                        ? strings.allDay
                        : formatTime(event.start, locale)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
