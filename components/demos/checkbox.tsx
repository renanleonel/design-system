"use client"

import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"

export function Default() {
  return (
    <Field orientation="horizontal" className="w-auto">
      <Checkbox id="checkbox-terms" defaultChecked />
      <FieldLabel htmlFor="checkbox-terms">Accept the terms</FieldLabel>
    </Field>
  )
}

export function WithDescription() {
  return (
    <Field orientation="horizontal" className="max-w-xs">
      <Checkbox id="checkbox-digest" />
      <FieldContent>
        <FieldLabel htmlFor="checkbox-digest">Weekly digest</FieldLabel>
        <FieldDescription>A summary of activity every Monday.</FieldDescription>
      </FieldContent>
    </Field>
  )
}

const ROWS = ["Invoices", "Receipts", "Payouts"]

/** A parent shows a dash while only some of its rows are checked. */
export function Indeterminate() {
  const [checked, setChecked] = React.useState(["Invoices"])
  const all = checked.length === ROWS.length
  return (
    <div className="flex flex-col gap-3">
      <Field orientation="horizontal" className="w-auto">
        <Checkbox
          id="checkbox-all"
          checked={all}
          indeterminate={checked.length > 0 && !all}
          onCheckedChange={() => setChecked(all ? [] : ROWS)}
        />
        <FieldLabel htmlFor="checkbox-all">All exports</FieldLabel>
      </Field>
      {ROWS.map((row) => (
        <Field key={row} orientation="horizontal" className="w-auto ps-6">
          <Checkbox
            id={`checkbox-${row}`}
            checked={checked.includes(row)}
            onCheckedChange={(on) =>
              setChecked((c) =>
                on ? [...c, row] : c.filter((r) => r !== row)
              )
            }
          />
          <FieldLabel htmlFor={`checkbox-${row}`}>{row}</FieldLabel>
        </Field>
      ))}
    </div>
  )
}

export function Disabled() {
  return (
    <Field orientation="horizontal" className="w-auto">
      <Checkbox id="checkbox-disabled" disabled defaultChecked />
      <FieldLabel htmlFor="checkbox-disabled">Managed by your admin</FieldLabel>
    </Field>
  )
}
