"use client"

import { Field, FieldLabel } from "@/components/ui/field"
import { TimeInput, TimeRangeInput } from "@/components/ui/time-input"

/** Type the time, or open the clock for a list of 30-minute slots. */
export function Default() {
  return (
    <Field className="w-fit">
      <FieldLabel htmlFor="time-start">Starts at</FieldLabel>
      <TimeInput id="time-start" defaultValue="09:30" />
    </Field>
  )
}

/**
 * One field for a start and end: pick the start, then the end (it can't come
 * first). The length shows once both are set.
 */
export function Range() {
  return (
    <Field className="w-fit">
      <FieldLabel htmlFor="time-from">Opening hours</FieldLabel>
      <TimeRangeInput
        id="time-from"
        defaultValue={{ from: "09:00", to: "17:30" }}
        interval={15}
        step={900}
      />
    </Field>
  )
}

/** `interval` sets the slots; `min` and `max` bound them (and the typed value). */
export function Bounded() {
  return (
    <Field className="w-fit">
      <FieldLabel htmlFor="time-slot">Delivery slot</FieldLabel>
      <TimeInput id="time-slot" interval={60} min="08:00" max="18:00" />
    </Field>
  )
}

export function Disabled() {
  return <TimeInput aria-label="Time" defaultValue="12:00" disabled />
}
