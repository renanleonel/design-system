"use client"

import { Field, FieldLabel } from "@/components/ui/field"
import { TimeInput } from "@/components/ui/time-input"

export function Default() {
  return (
    <Field className="w-fit">
      <FieldLabel htmlFor="time-start">Starts at</FieldLabel>
      <TimeInput id="time-start" defaultValue="09:30" />
    </Field>
  )
}

/** `step` is in seconds: 900 snaps the arrows to 15 minutes. */
export function Range() {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <Field className="w-fit">
        <FieldLabel htmlFor="time-from">From</FieldLabel>
        <TimeInput id="time-from" defaultValue="09:00" step={900} />
      </Field>
      <Field className="w-fit">
        <FieldLabel htmlFor="time-to">To</FieldLabel>
        <TimeInput id="time-to" defaultValue="17:30" step={900} min="09:00" />
      </Field>
    </div>
  )
}

export function Disabled() {
  return <TimeInput aria-label="Time" defaultValue="12:00" disabled />
}
