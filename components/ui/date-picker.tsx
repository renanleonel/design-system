"use client"

import * as React from "react"
import { cn } from "cn"
import { format } from "date-fns"
import { CalendarIcon, ChevronDownIcon, XIcon } from "lucide-react"
import type { DateRange, Matcher } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TimeSlots } from "@/components/ui/time-input"
import { useIsMobile } from "@/hooks/use-media-query"

type CalendarProps = React.ComponentProps<typeof Calendar>

type FieldProps = {
  placeholder?: string
  dateFormat?: string
  disabled?: boolean
  id?: string
  /** Submits the value as ISO (`2026-11-13`; a range as `2026-11-01/2026-11-15`). */
  name?: string
  required?: boolean
  clearable?: boolean
  className?: string
  ref?: React.Ref<HTMLButtonElement>
  /**
   * Fires when the calendar closes, not when focus moves into it, so a form
   * validating on blur doesn't flag the field while it's being filled.
   */
  onBlur?: () => void
  "aria-invalid"?: boolean | "true" | "false"
  "aria-describedby"?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  captionLayout?: CalendarProps["captionLayout"]
  startMonth?: Date
  endMonth?: Date
  disabledDays?: Matcher | Matcher[]
  calendarProps?: Omit<
    CalendarProps,
    "mode" | "selected" | "onSelect" | "required"
  >
}

const iso = (d: Date) => format(d, "yyyy-MM-dd")

function DateField({
  text,
  placeholder,
  clearable,
  onClear,
  className,
  disabled,
  ref,
  ...props
}: Pick<
  FieldProps,
  | "placeholder"
  | "clearable"
  | "className"
  | "disabled"
  | "ref"
  | "id"
  | "aria-invalid"
  | "aria-describedby"
  | "aria-label"
  | "aria-labelledby"
> & { text?: string; onClear: () => void }) {
  const canClear = clearable && !!text && !disabled
  return (
    <div data-slot="date-picker" className={cn("relative w-60", className)}>
      <PopoverTrigger
        ref={ref}
        disabled={disabled}
        data-empty={!text || undefined}
        className={cn(
          "group/date-field flex h-control w-full min-w-0 items-center gap-2 rounded-control border border-input bg-transparent ps-2.5 pe-2 text-start text-sm whitespace-nowrap focus-ring transition-colors outline-none select-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-empty:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          canClear && "[&>span]:pe-6"
        )}
        {...props}
      >
        <CalendarIcon className="text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate tabular-nums">
          {text ?? placeholder}
        </span>
        <ChevronDownIcon className="text-muted-foreground transition-transform duration-(--ds-duration-popover) ease-out group-data-popup-open/date-field:rotate-180 motion-reduce:transition-none" />
      </PopoverTrigger>
      {canClear && (
        // A sibling, not inside the trigger: buttons can't nest.
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Clear date"
          onClick={onClear}
          className="absolute end-8 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <XIcon />
        </Button>
      )}
    </div>
  )
}

/** Works with `FormField`: spread `field`, then map `value` / `onValueChange`. */
function DatePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Pick a date",
  dateFormat = "PPP",
  name,
  required,
  onBlur,
  captionLayout,
  startMonth,
  endMonth,
  disabledDays,
  calendarProps,
  ...field
}: FieldProps & {
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (date: Date | undefined) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [internal, setInternal] = React.useState(defaultValue ?? undefined)
  const date = value !== undefined ? (value ?? undefined) : internal
  const set = (next: Date | undefined) => {
    setInternal(next)
    onValueChange?.(next)
  }
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) onBlur?.()
      }}
    >
      <DateField
        text={date ? format(date, dateFormat) : undefined}
        placeholder={placeholder}
        onClear={() => set(undefined)}
        {...field}
      />
      {name && (
        <input
          type="hidden"
          name={name}
          value={date ? iso(date) : ""}
          required={required}
        />
      )}
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          autoFocus
          selected={date}
          defaultMonth={date}
          captionLayout={captionLayout}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={disabledDays}
          onSelect={(next) => {
            set(next)
            setOpen(false)
            onBlur?.()
          }}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  )
}

function DateRangePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Pick dates",
  dateFormat = "LLL d, y",
  name,
  required,
  onBlur,
  captionLayout,
  startMonth,
  endMonth,
  disabledDays,
  calendarProps,
  className,
  ...field
}: FieldProps & {
  value?: DateRange | null
  defaultValue?: DateRange | null
  onValueChange?: (range: DateRange | undefined) => void
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const [internal, setInternal] = React.useState(defaultValue ?? undefined)
  const range = value !== undefined ? (value ?? undefined) : internal
  const set = (next: DateRange | undefined) => {
    setInternal(next)
    onValueChange?.(next)
  }
  const text = range?.from
    ? range.to
      ? `${format(range.from, dateFormat)} – ${format(range.to, dateFormat)}`
      : `${format(range.from, dateFormat)} – …`
    : undefined
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) onBlur?.()
      }}
    >
      <DateField
        text={text}
        placeholder={placeholder}
        onClear={() => set(undefined)}
        className={cn("w-72", className)}
        {...field}
      />
      {name && (
        <input
          type="hidden"
          name={name}
          value={
            range?.from && range.to ? `${iso(range.from)}/${iso(range.to)}` : ""
          }
          required={required}
        />
      )}
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          autoFocus
          resetOnSelect
          selected={range}
          defaultMonth={range?.from}
          numberOfMonths={isMobile ? 1 : 2}
          captionLayout={captionLayout}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={disabledDays}
          onSelect={(next) => {
            set(next)
            if (next?.from && next.to && range?.from && !range.to) {
              setOpen(false)
              onBlur?.()
            }
          }}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  )
}

/** Until a time is picked, a new day starts at `defaultTime`. `name` submits local ISO (`2026-11-13T09:30`). */
function DateTimePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Pick a date and time",
  dateFormat = "PPP, p",
  interval = 30,
  defaultTime = "09:00",
  name,
  required,
  onBlur,
  captionLayout,
  startMonth,
  endMonth,
  disabledDays,
  calendarProps,
  className,
  ...field
}: FieldProps & {
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (date: Date | undefined) => void
  interval?: number
  defaultTime?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [internal, setInternal] = React.useState(defaultValue ?? undefined)
  const date = value !== undefined ? (value ?? undefined) : internal
  const set = (next: Date | undefined) => {
    setInternal(next)
    onValueChange?.(next)
  }
  const withTime = (day: Date, time: string) => {
    const [h = 0, m = 0] = time.split(":").map(Number)
    const next = new Date(day)
    next.setHours(h, m, 0, 0)
    return next
  }
  const close = () => {
    setOpen(false)
    onBlur?.()
  }
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) onBlur?.()
      }}
    >
      <DateField
        text={date ? format(date, dateFormat) : undefined}
        placeholder={placeholder}
        onClear={() => set(undefined)}
        className={cn("w-72", className)}
        {...field}
      />
      {name && (
        <input
          type="hidden"
          name={name}
          value={date ? format(date, "yyyy-MM-dd'T'HH:mm") : ""}
          required={required}
        />
      )}
      <PopoverContent
        className="w-auto gap-0 p-0 max-sm:p-0 sm:flex-row"
        align="start"
      >
        <Calendar
          mode="single"
          autoFocus
          selected={date}
          defaultMonth={date}
          captionLayout={captionLayout}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={disabledDays}
          onSelect={(day) => {
            if (!day) return
            set(withTime(day, date ? format(date, "HH:mm") : defaultTime))
          }}
          {...calendarProps}
        />
        <div className="relative max-sm:border-t sm:w-32 sm:border-s">
          <TimeSlots
            aria-label="Time"
            value={date ? format(date, "HH:mm") : undefined}
            interval={interval}
            formatLabel={(time) =>
              format(withTime(new Date(2000, 0, 1), time), "p")
            }
            isDisabled={date ? undefined : () => true}
            onPick={(time) => {
              if (!date) return
              set(withTime(date, time))
              close()
            }}
            className="max-sm:max-h-none max-sm:flex-row max-sm:overflow-x-auto max-sm:overflow-y-hidden sm:absolute sm:inset-0 sm:max-h-none"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, DateRangePicker, DateTimePicker }
