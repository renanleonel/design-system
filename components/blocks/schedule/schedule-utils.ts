import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  type Day,
  type Locale,
} from "date-fns"

export type ScheduleView = "month" | "week" | "day"
export const SCHEDULE_VIEWS: ScheduleView[] = ["month", "week", "day"]

export type EventTone =
  | "blue"
  | "green"
  | "amber"
  | "orange"
  | "red"
  | "purple"
  | "gray"

export type ScheduleEvent = {
  id: string
  title: string
  /** Timed events: an instant. All-day events: any time on the first day. */
  start: Date
  /** Timed events: an exclusive instant. All-day events: any time on the last day (inclusive). */
  end: Date
  allDay?: boolean
  tone?: EventTone
  location?: string
  description?: string
  /** IANA id the event was created in; shown in the details. */
  timeZone?: string
}

/** Tone classes, written out so Tailwind can see them. */
export const TONE_CLASS: Record<EventTone, string> = {
  blue: "bg-tone-blue/12 text-tone-blue [--tone:var(--ds-tone-blue)]",
  green: "bg-tone-green/12 text-tone-green [--tone:var(--ds-tone-green)]",
  amber: "bg-tone-amber/12 text-tone-amber [--tone:var(--ds-tone-amber)]",
  orange: "bg-tone-orange/12 text-tone-orange [--tone:var(--ds-tone-orange)]",
  red: "bg-tone-red/12 text-tone-red [--tone:var(--ds-tone-red)]",
  purple: "bg-tone-purple/12 text-tone-purple [--tone:var(--ds-tone-purple)]",
  gray: "bg-tone-gray/12 text-tone-gray [--tone:var(--ds-tone-gray)]",
}

/** Only the `--tone` variable, for markers on a neutral surface. */
export const TONE_VAR: Record<EventTone, string> = {
  blue: "[--tone:var(--ds-tone-blue)]",
  green: "[--tone:var(--ds-tone-green)]",
  amber: "[--tone:var(--ds-tone-amber)]",
  orange: "[--tone:var(--ds-tone-orange)]",
  red: "[--tone:var(--ds-tone-red)]",
  purple: "[--tone:var(--ds-tone-purple)]",
  gray: "[--tone:var(--ds-tone-gray)]",
}

export const TONES = Object.keys(TONE_CLASS) as EventTone[]

export const DATE_PARAM = "yyyy-MM-dd"

export function parseDateParam(value: string | null, ref: Date) {
  if (!value) return null
  const date = parse(value, DATE_PARAM, ref)
  return isValid(date) ? date : null
}

export function weekStart(locale: Locale, override?: Day): Day {
  return override ?? locale.options?.weekStartsOn ?? 0
}

export function weekDays(date: Date, locale: Locale, override?: Day) {
  const start = startOfWeek(date, {
    locale,
    weekStartsOn: weekStart(locale, override),
  })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

/** Every week of the month as 7 days, padded to whole weeks. */
export function monthWeeks(date: Date, locale: Locale, override?: Day) {
  const opts = { locale, weekStartsOn: weekStart(locale, override) }
  const first = startOfWeek(startOfMonth(date), opts)
  const last = endOfWeek(endOfMonth(date), opts)
  const count = Math.round(differenceInCalendarDays(last, first) / 7) + 1
  return Array.from({ length: count }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d))
  )
}

/** The last calendar day an event touches (an end at exactly midnight belongs to the day before). */
export function lastDay(event: ScheduleEvent) {
  if (event.allDay) return startOfDay(event.end)
  const end =
    event.end.getTime() > event.start.getTime()
      ? new Date(event.end.getTime() - 1)
      : event.start
  return startOfDay(end)
}

/** All-day and multi-day events live in the all-day row / banner lanes. */
export const isBanner = (event: ScheduleEvent) =>
  event.allDay ||
  differenceInCalendarDays(lastDay(event), startOfDay(event.start)) > 0

export function eventsOnDay(events: ScheduleEvent[], day: Date) {
  const d = startOfDay(day).getTime()
  return events.filter(
    (e) => startOfDay(e.start).getTime() <= d && lastDay(e).getTime() >= d
  )
}

export function eventsInRange(events: ScheduleEvent[], from: Date, to: Date) {
  const a = startOfDay(from).getTime()
  const b = startOfDay(to).getTime()
  return events.filter(
    (e) => startOfDay(e.start).getTime() <= b && lastDay(e).getTime() >= a
  )
}

export const byStart = (a: ScheduleEvent, b: ScheduleEvent) =>
  a.start.getTime() - b.start.getTime() ||
  b.end.getTime() - a.end.getTime() ||
  a.id.localeCompare(b.id)

export type Banner = {
  event: ScheduleEvent
  startIdx: number
  endIdx: number
  lane: number
  /** Began before the first visible day / continues after the last. */
  fromBefore: boolean
  toAfter: boolean
}

/** Lanes for banner events across a run of days (a week row, or the all-day row). */
export function layoutBanners(events: ScheduleEvent[], days: Date[]) {
  const first = startOfDay(days[0])
  const lastIdx = days.length - 1
  const items = events
    .filter(isBanner)
    .map((event) => {
      const s = differenceInCalendarDays(startOfDay(event.start), first)
      const e = differenceInCalendarDays(lastDay(event), first)
      return { event, s, e }
    })
    .filter((x) => x.e >= 0 && x.s <= lastIdx)
    .sort(
      (a, b) =>
        Math.max(a.s, 0) - Math.max(b.s, 0) ||
        b.e - b.s - (a.e - a.s) ||
        a.event.id.localeCompare(b.event.id)
    )
  const laneEnds: number[] = []
  const banners: Banner[] = items.map(({ event, s, e }) => {
    const startIdx = Math.max(s, 0)
    const endIdx = Math.min(e, lastIdx)
    let lane = laneEnds.findIndex((end) => end < startIdx)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = endIdx
    return {
      event,
      startIdx,
      endIdx,
      lane,
      fromBefore: s < 0,
      toAfter: e > lastIdx,
    }
  })
  return { banners, lanes: laneEnds.length }
}

export type Placed = {
  event: ScheduleEvent
  /** Minutes from midnight. */
  top: number
  bottom: number
  col: number
  cols: number
}

export type Overflow = {
  events: ScheduleEvent[]
  top: number
  bottom: number
  col: number
  cols: number
}

const MIN_MINUTES = 20

/**
 * Overlap layout for one day column: events that touch form a cluster; inside
 * it each event takes the first free column and all share the cluster's width.
 * Clusters wider than `cap` columns fold the rest into one "+N" block.
 */
export function layoutDay(events: ScheduleEvent[], day: Date, cap: number) {
  const dayStart = startOfDay(day).getTime()
  const segs = events
    .filter((e) => !isBanner(e))
    .map((event) => {
      const top = Math.max(
        0,
        Math.round((event.start.getTime() - dayStart) / 60000)
      )
      const end = Math.min(
        1440,
        Math.round((event.end.getTime() - dayStart) / 60000)
      )
      return {
        event,
        top,
        bottom: Math.min(1440, Math.max(end, top + MIN_MINUTES)),
      }
    })
    .sort(
      (a, b) =>
        a.top - b.top ||
        b.bottom - b.top - (a.bottom - a.top) ||
        a.event.id.localeCompare(b.event.id)
    )

  const placed: Placed[] = []
  const overflow: Overflow[] = []
  let cluster: typeof segs = []
  let clusterEnd = -1

  const flush = () => {
    if (!cluster.length) return
    const colEnds: number[] = []
    const cols = cluster.map((seg) => {
      let col = colEnds.findIndex((end) => end <= seg.top)
      if (col === -1) col = colEnds.length
      colEnds[col] = seg.bottom
      return col
    })
    const total = colEnds.length
    if (total <= cap) {
      cluster.forEach((seg, i) =>
        placed.push({ ...seg, col: cols[i], cols: total })
      )
    } else {
      const hidden: typeof segs = []
      cluster.forEach((seg, i) => {
        if (cols[i] < cap - 1) placed.push({ ...seg, col: cols[i], cols: cap })
        else hidden.push(seg)
      })
      overflow.push({
        events: hidden.map((h) => h.event),
        top: Math.min(...hidden.map((h) => h.top)),
        bottom: Math.max(...hidden.map((h) => h.bottom)),
        col: cap - 1,
        cols: cap,
      })
    }
    cluster = []
  }

  for (const seg of segs) {
    if (seg.top >= clusterEnd) {
      flush()
      clusterEnd = seg.bottom
    } else clusterEnd = Math.max(clusterEnd, seg.bottom)
    cluster.push(seg)
  }
  flush()
  return { placed, overflow }
}

/** Snaps a pointer offset (0..1 of the day) to the nearest earlier half hour. */
export function slotAt(day: Date, fraction: number) {
  const minutes = Math.min(23.5 * 60, Math.floor((fraction * 1440) / 30) * 30)
  const date = startOfDay(day)
  date.setMinutes(minutes)
  return date
}

// ---- Locale and strings --------------------------------------------------

export const uses12h = (locale: Locale) =>
  /[ap]\.?m/i.test(format(new Date(2000, 0, 1, 13), "p", { locale }))

export const monthDayPattern = (locale: Locale) =>
  locale.code === "en-US" ? "MMM d" : "d MMM"

export type ScheduleStrings = {
  today: string
  previous: string
  next: string
  month: string
  week: string
  day: string
  newEvent: string
  allDay: string
  more: (n: number) => string
  noEvents: string
  nothingHere: string
  views: string
  pickDate: string
  createAt: (when: string) => string
  delete: string
  deleted: string
  allDayEvent: string
  continues: string
  dialogTitle: string
  dialogDescription: string
  title: string
  titleRequired: string
  date: string
  allDayToggle: string
  time: string
  timeAfter: string
  zone: string
  color: string
  location: string
  notes: string
  save: string
  cancel: string
  eventsOverlap: (n: number) => string
  untitled: string
}

export const STRINGS: Record<"en" | "pt", ScheduleStrings> = {
  en: {
    today: "Today",
    previous: "Previous",
    next: "Next",
    month: "Month",
    week: "Week",
    day: "Day",
    newEvent: "New event",
    allDay: "All day",
    more: (n) => `+${n} more`,
    noEvents: "No events",
    nothingHere: "Nothing scheduled in this period.",
    views: "Calendar view",
    pickDate: "Pick a date",
    createAt: (when) => `Create an event, ${when}`,
    delete: "Delete",
    deleted: "Event deleted",
    allDayEvent: "All day",
    continues: "Continues",
    dialogTitle: "New event",
    dialogDescription: "It shows up on the calendar as soon as you save.",
    title: "Title",
    titleRequired: "Give the event a title.",
    date: "Date",
    allDayToggle: "All day",
    time: "Time",
    timeAfter: "Pick an end time after the start.",
    zone: "Time zone",
    color: "Color",
    location: "Location",
    notes: "Notes",
    save: "Save event",
    cancel: "Cancel",
    eventsOverlap: (n) => `${n} events at this time`,
    untitled: "Untitled",
  },
  pt: {
    today: "Hoje",
    previous: "Anterior",
    next: "Próximo",
    month: "Mês",
    week: "Semana",
    day: "Dia",
    newEvent: "Novo evento",
    allDay: "Dia todo",
    more: (n) => `+${n} mais`,
    noEvents: "Sem eventos",
    nothingHere: "Nada agendado neste período.",
    views: "Visualização do calendário",
    pickDate: "Escolher data",
    createAt: (when) => `Criar evento, ${when}`,
    delete: "Excluir",
    deleted: "Evento excluído",
    allDayEvent: "Dia todo",
    continues: "Continua",
    dialogTitle: "Novo evento",
    dialogDescription: "Ele aparece no calendário assim que você salvar.",
    title: "Título",
    titleRequired: "Dê um título ao evento.",
    date: "Data",
    allDayToggle: "Dia todo",
    time: "Horário",
    timeAfter: "Escolha um horário final depois do início.",
    zone: "Fuso horário",
    color: "Cor",
    location: "Local",
    notes: "Notas",
    save: "Salvar evento",
    cancel: "Cancelar",
    eventsOverlap: (n) => `${n} eventos neste horário`,
    untitled: "Sem título",
  },
}

export const stringsFor = (locale: Locale) =>
  STRINGS[locale.code?.startsWith("pt") ? "pt" : "en"]
