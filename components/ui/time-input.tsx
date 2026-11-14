"use client"

import * as React from "react"
import { cn } from "cn"
import { ArrowRightIcon, ClockIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { mergeRefs } from "@/hooks/use-hotkey-press"

const toMinutes = (time: string) => {
  const [h = 0, m = 0] = time.split(":").map(Number)
  return h * 60 + m
}
const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`

/** "HH:mm" every `interval` minutes, inside `min`/`max` (inclusive). */
function timeSlots(interval: number, min?: string, max?: string) {
  const from = min ? toMinutes(min) : 0
  const to = max ? toMinutes(max) : 24 * 60 - 1
  const out: string[] = []
  for (let m = 0; m < 24 * 60; m += Math.max(1, interval))
    if (m >= from && m <= to) out.push(toTime(m))
  return out
}

/** Sets the value the way typing does, so `onChange` and form libraries see it. */
function setNative(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set?.call(input, value)
  input.dispatchEvent(new Event("input", { bubbles: true }))
}

/** The browser's locale and 12/24h, like the native field beside it. */
const defaultLabel = (time: string) =>
  new Date(
    2000,
    0,
    1,
    ...(time.split(":").map(Number) as [number, number])
  ).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })

/**
 * A column of time slots: arrows, Home and End move between them, the picked
 * one is marked, and it opens scrolled to the value (or the next slot after
 * it). Rendered only inside an open popover, so the browser locale is safe.
 */
function TimeSlots({
  value,
  interval = 30,
  min,
  max,
  isDisabled,
  onPick,
  formatLabel = defaultLabel,
  className,
  "aria-label": ariaLabel = "Times",
}: {
  value?: string
  interval?: number
  min?: string
  max?: string
  /** Slots shown but not pickable (before a range's start). */
  isDisabled?: (time: string) => boolean
  onPick: (time: string) => void
  formatLabel?: (time: string) => string
  className?: string
  "aria-label"?: string
}) {
  const slots = React.useMemo(
    () => timeSlots(interval, min, max),
    [interval, min, max]
  )
  const current = value?.slice(0, 5)
  // The slot to land on: the value, else the first one after it.
  const target =
    slots.find((t) => t === current) ??
    (current ? slots.find((t) => t > current) : undefined) ??
    slots.find((t) => !isDisabled?.(t))

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      data-slot="time-slots"
      className={cn(
        "relative no-scrollbar flex max-h-64 scroll-py-1 flex-col gap-px overflow-y-auto overscroll-contain p-1",
        className
      )}
      onKeyDown={(e) => {
        const keys = ["ArrowDown", "ArrowUp", "Home", "End"]
        if (!keys.includes(e.key)) return
        const buttons = [
          ...e.currentTarget.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)"
          ),
        ]
        const at = buttons.indexOf(document.activeElement as HTMLButtonElement)
        const next =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? buttons.length - 1
              : Math.min(
                  buttons.length - 1,
                  Math.max(0, at + (e.key === "ArrowDown" ? 1 : -1))
                )
        e.preventDefault()
        buttons[next]?.focus()
      }}
    >
      {slots.map((time) => {
        const selected = time === current
        return (
          <button
            key={time}
            type="button"
            aria-pressed={selected}
            data-target={time === target || undefined}
            disabled={isDisabled?.(time)}
            onClick={() => onPick(time)}
            ref={
              // Center the landing slot on open. Not scrollIntoView: that
              // would scroll the page too.
              time === target ? centerInList : undefined
            }
            className="flex min-h-9 shrink-0 items-center rounded-sm px-2 text-start text-sm whitespace-nowrap tabular-nums outline-none select-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-primary aria-pressed:text-primary-foreground pointer-coarse:min-h-11"
          >
            {formatLabel(time)}
          </button>
        )
      })}
    </div>
  )
}

function centerInList(el: HTMLElement | null) {
  const list = el?.parentElement
  if (!el || !list) return
  // Vertical column, or a horizontal row (DateTimePicker on phones).
  list.scrollTop = el.offsetTop - (list.clientHeight - el.offsetHeight) / 2
  list.scrollLeft = el.offsetLeft - (list.clientWidth - el.offsetWidth) / 2
}

/** Focus the landing slot when a slot list opens (keyboard and pointer alike). */
const focusTarget = (popup: HTMLElement | null) =>
  popup?.querySelector<HTMLElement>("[data-target]") ?? true

const nativeTime =
  "tabular-nums scheme-light dark:scheme-dark [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit-fields-wrapper]:p-0"

/**
 * A time of day ("HH:mm", or "HH:mm:ss" with `step` under 60). Type it in the
 * browser's own segmented field (arrows, the locale's 12/24h), or open the
 * clock for a styled list of slots every `interval` minutes within
 * `min`/`max`. Picking sets the value like typing does, so `onChange` and
 * form libraries see it. `className` sizes the field.
 */
function TimeInput({
  className,
  step = 60,
  interval = 30,
  min,
  max,
  disabled,
  ref,
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "min" | "max"> & {
  /** Minutes between slots in the list. */
  interval?: number
  min?: string
  max?: string
}) {
  const input = React.useRef<HTMLInputElement>(null)
  const popup = React.useRef<HTMLDivElement>(null)
  const group = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState(false)
  const [current, setCurrent] = React.useState("")

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Read the live value on open: it may be uncontrolled or typed.
        if (next) setCurrent(input.current?.value ?? "")
        setOpen(next)
      }}
    >
      <InputGroup
        ref={group}
        data-slot="time-input"
        className={cn("w-auto min-w-32", className)}
      >
        <InputGroupInput
          ref={mergeRefs(input, ref)}
          type="time"
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          className={nativeTime}
          {...props}
        />
        <InputGroupAddon align="inline-end">
          <PopoverTrigger
            disabled={disabled}
            render={
              <InputGroupButton
                size="icon-xs"
                aria-label="Choose a time"
                className="text-muted-foreground data-popup-open:bg-muted data-popup-open:text-foreground"
              />
            }
          >
            <ClockIcon />
          </PopoverTrigger>
        </InputGroupAddon>
      </InputGroup>
      <PopoverContent
        ref={popup}
        anchor={group}
        align="start"
        sideOffset={6}
        initialFocus={() => focusTarget(popup.current)}
        className="w-(--anchor-width) gap-0 p-0 max-sm:p-0"
      >
        <TimeSlots
          value={current}
          interval={interval}
          min={min}
          max={max}
          onPick={(time) => {
            if (input.current) setNative(input.current, time)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

type TimeRange = { from?: string; to?: string }

/** "8h 30m" between two "HH:mm" (overnight wraps past midnight). */
function duration(range: TimeRange) {
  if (!range.from || !range.to) return undefined
  const total =
    (toMinutes(range.to) - toMinutes(range.from) + 24 * 60) % (24 * 60)
  if (!total) return undefined
  const h = Math.floor(total / 60)
  const m = total % 60
  return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(" ")
}

/**
 * A start and end time as one field: type either side, or open the clock for
 * two slot columns (pick the start, then the end; the end can't come first).
 * Shows the length ("8h 30m") once both are set. `name` submits
 * `09:00/17:30`.
 */
function TimeRangeInput({
  value,
  defaultValue,
  onValueChange,
  interval = 30,
  step = 60,
  min,
  max,
  showDuration = true,
  name,
  required,
  disabled,
  id,
  className,
  "aria-label": ariaLabel = "Time range",
  "aria-labelledby": ariaLabelledby,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
}: {
  value?: TimeRange | null
  defaultValue?: TimeRange | null
  onValueChange?: (range: TimeRange) => void
  /** Minutes between slots in the list. */
  interval?: number
  /** Seconds per arrow press in the typed fields. */
  step?: number
  min?: string
  max?: string
  showDuration?: boolean
  name?: string
  required?: boolean
  disabled?: boolean
  /** On the start field, so a `<label htmlFor>` focuses it. */
  id?: string
  className?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-invalid"?: boolean | "true" | "false"
  "aria-describedby"?: string
}) {
  const popup = React.useRef<HTMLDivElement>(null)
  const group = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState(false)
  const [internal, setInternal] = React.useState<TimeRange>(defaultValue ?? {})
  const range = value !== undefined ? (value ?? {}) : internal
  const set = (next: TimeRange) => {
    setInternal(next)
    onValueChange?.(next)
  }
  const length = showDuration ? duration(range) : undefined
  const field = {
    type: "time",
    step,
    min,
    max,
    disabled,
    required,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedby,
    className: cn(nativeTime, "w-auto flex-none px-0"),
  } as const

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <InputGroup
        ref={group}
        role="group"
        aria-label={ariaLabelledby ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledby}
        data-slot="time-range-input"
        className={cn("w-fit max-w-full gap-1.5 ps-2.5", className)}
      >
        <InputGroupInput
          {...field}
          id={id}
          aria-label="Start time"
          value={range.from ?? ""}
          onChange={(e) => set({ ...range, from: e.target.value })}
        />
        <ArrowRightIcon
          aria-hidden
          className="size-3.5 shrink-0 text-muted-foreground"
        />
        <InputGroupInput
          {...field}
          aria-label="End time"
          value={range.to ?? ""}
          onChange={(e) => set({ ...range, to: e.target.value })}
        />
        <InputGroupAddon align="inline-end" className="gap-1.5">
          {length ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {length}
            </span>
          ) : null}
          <PopoverTrigger
            disabled={disabled}
            render={
              <InputGroupButton
                size="icon-xs"
                aria-label="Choose times"
                className="text-muted-foreground data-popup-open:bg-muted data-popup-open:text-foreground"
              />
            }
          >
            <ClockIcon />
          </PopoverTrigger>
        </InputGroupAddon>
      </InputGroup>
      {name && (
        <input
          type="hidden"
          name={name}
          value={range.from && range.to ? `${range.from}/${range.to}` : ""}
        />
      )}
      <PopoverContent
        ref={popup}
        anchor={group}
        align="start"
        sideOffset={6}
        initialFocus={() => focusTarget(popup.current)}
        className="w-auto min-w-(--anchor-width) gap-0 p-0 max-sm:p-0"
      >
        <div className="grid grid-cols-2 divide-x">
          {(["from", "to"] as const).map((side) => (
            <div key={side} className="flex min-w-32 flex-col">
              <p className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
                {side === "from" ? "Start" : "End"}
              </p>
              <TimeSlots
                aria-label={side === "from" ? "Start time" : "End time"}
                value={range[side]}
                interval={interval}
                min={min}
                max={max}
                isDisabled={
                  side === "to" && range.from
                    ? (time) => time <= range.from!.slice(0, 5)
                    : undefined
                }
                onPick={(time) => {
                  if (side === "from") {
                    // A start at or after the end clears the end.
                    const keepEnd = range.to && range.to.slice(0, 5) > time
                    set({ from: time, to: keepEnd ? range.to : undefined })
                    // Move on to the end column once it re-renders.
                    requestAnimationFrame(() =>
                      popup.current
                        ?.querySelector<HTMLElement>(
                          '[aria-label="End time"] [data-target]'
                        )
                        ?.focus()
                    )
                  } else {
                    set({ ...range, to: time })
                    setOpen(false)
                  }
                }}
              />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { TimeInput, TimeRangeInput, TimeSlots, type TimeRange }
