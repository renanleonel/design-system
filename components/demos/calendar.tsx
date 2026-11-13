"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"

const TODAY = new Date(2026, 4, 14)

export function Default() {
  const [date, setDate] = React.useState<Date | undefined>(TODAY)
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      defaultMonth={TODAY}
      className="rounded-xl shadow-border"
    />
  )
}

export function Range() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 4, 11),
    to: new Date(2026, 4, 16),
  })
  return (
    <Calendar
      mode="range"
      selected={range}
      onSelect={setRange}
      defaultMonth={TODAY}
      className="rounded-xl shadow-border"
    />
  )
}

/** `captionLayout="dropdown"` for dates far away, like a birthday. */
export function WithDropdowns() {
  return (
    <Calendar
      mode="single"
      captionLayout="dropdown"
      defaultMonth={new Date(1990, 0, 1)}
      startMonth={new Date(1920, 0)}
      endMonth={TODAY}
      className="rounded-xl shadow-border"
    />
  )
}
