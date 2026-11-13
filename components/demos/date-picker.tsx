"use client"

import { DatePicker, DateRangePicker } from "@/components/ui/date-picker"

export function Default() {
  return <DatePicker aria-label="Due date" placeholder="Due date" />
}

export function Range() {
  return <DateRangePicker aria-label="Report period" placeholder="Report period" />
}

/** Disable days with the calendar's `disabled` matcher. */
export function FutureOnly() {
  return (
    <DatePicker
      aria-label="Delivery date"
      placeholder="Delivery date"
      calendarProps={{ disabled: { before: new Date() } }}
    />
  )
}
