"use client"

import * as React from "react"
import { cn } from "cn"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-media-query"

type TriggerProps = {
  placeholder?: string
  /** date-fns pattern for the trigger label. */
  dateFormat?: string
  disabled?: boolean
  id?: string
  className?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
}

function Trigger({
  label,
  placeholder,
  className,
  ...props
}: Omit<TriggerProps, "dateFormat"> & { label?: string }) {
  return (
    <PopoverTrigger
      render={
        <Button
          variant="outline"
          className={cn(
            "w-60 justify-start px-2.5 font-normal data-[empty=true]:text-muted-foreground",
            className
          )}
          data-empty={!label}
          {...props}
        />
      }
    >
      <CalendarIcon data-icon="inline-start" />
      <span className="truncate">{label ?? placeholder}</span>
    </PopoverTrigger>
  )
}

/**
 * A button that opens a calendar in a popover (a bottom sheet on phones).
 * Picking a day closes it and returns focus to the button.
 */
function DatePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Pick a date",
  dateFormat = "PPP",
  calendarProps,
  ...trigger
}: TriggerProps & {
  value?: Date
  defaultValue?: Date
  onValueChange?: (date: Date | undefined) => void
  calendarProps?: Omit<
    React.ComponentProps<typeof Calendar>,
    "mode" | "selected" | "onSelect"
  >
}) {
  const [open, setOpen] = React.useState(false)
  const [internal, setInternal] = React.useState(defaultValue)
  const date = value !== undefined ? value : internal
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Trigger
        label={date ? format(date, dateFormat) : undefined}
        placeholder={placeholder}
        {...trigger}
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(next) => {
            setInternal(next)
            onValueChange?.(next)
            setOpen(false)
          }}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  )
}

/** Two months side by side (one on phones); stays open until both ends are set. */
function DateRangePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Pick dates",
  dateFormat = "LLL d, y",
  calendarProps,
  ...trigger
}: TriggerProps & {
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (range: DateRange | undefined) => void
  calendarProps?: Omit<
    React.ComponentProps<typeof Calendar>,
    "mode" | "selected" | "onSelect"
  >
}) {
  const isMobile = useIsMobile()
  const [internal, setInternal] = React.useState(defaultValue)
  const range = value !== undefined ? value : internal
  const label = range?.from
    ? range.to
      ? `${format(range.from, dateFormat)} – ${format(range.to, dateFormat)}`
      : format(range.from, dateFormat)
    : undefined
  return (
    <Popover>
      <Trigger
        label={label}
        placeholder={placeholder}
        className="w-72"
        {...trigger}
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          defaultMonth={range?.from}
          numberOfMonths={isMobile ? 1 : 2}
          onSelect={(next) => {
            setInternal(next)
            onValueChange?.(next)
          }}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, DateRangePicker }
