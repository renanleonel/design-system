"use client"

import * as React from "react"

import { Field, FieldLabel } from "@/components/ui/field"
import { TimezoneSelect } from "@/components/ui/timezone-select"

/** Search by city, region or offset ("GMT-3"); ~420 zones, virtualized. */
export function Default() {
  const [value, setValue] = React.useState<string | null>("America/Sao_Paulo")
  return (
    <Field className="w-full max-w-xs">
      <FieldLabel htmlFor="tz-default">Time zone</FieldLabel>
      <TimezoneSelect id="tz-default" value={value} onValueChange={setValue} />
    </Field>
  )
}

export function Empty() {
  return (
    <TimezoneSelect aria-label="Time zone" className="w-full max-w-xs" />
  )
}
