"use client"

import * as React from "react"

import { NumberField } from "@/components/ui/number-field"

export function Default() {
  return (
    <div className="w-full max-w-48">
      <NumberField label="Quantity" defaultValue={2} min={0} max={99} />
    </div>
  )
}

/** `format` takes `Intl.NumberFormat` options; the value is still a number. */
export function Currency() {
  const [value, setValue] = React.useState<number | null>(1299.9)
  return (
    <div className="flex w-full max-w-48 flex-col gap-2">
      <NumberField
        label="Price"
        value={value}
        onValueChange={setValue}
        min={0}
        step={0.5}
        locale="pt-BR"
        format={{ style: "currency", currency: "BRL" }}
      />
      <p className="text-xs text-muted-foreground tabular-nums">
        Value: {value ?? "empty"}
      </p>
    </div>
  )
}

export function Percent() {
  return (
    <div className="w-full max-w-48">
      <NumberField
        label="Discount"
        defaultValue={0.15}
        min={0}
        max={1}
        step={0.01}
        smallStep={0.001}
        largeStep={0.1}
        locale="en-US"
        format={{ style: "percent", maximumFractionDigits: 1 }}
      />
    </div>
  )
}

/** Drag the label sideways to change the value. */
export function Scrub() {
  return (
    <div className="w-full max-w-48">
      <NumberField label="Opacity" scrub defaultValue={80} min={0} max={100} />
    </div>
  )
}

export function Unit() {
  return (
    <div className="w-full max-w-48">
      <NumberField
        label="Distance"
        defaultValue={12}
        min={0}
        locale="en-US"
        format={{ style: "unit", unit: "kilometer", unitDisplay: "short" }}
      />
    </div>
  )
}

export function States() {
  return (
    <div className="flex w-full max-w-48 flex-col gap-4">
      <NumberField label="Disabled" defaultValue={3} disabled />
      <NumberField label="Read only" defaultValue={3} readOnly />
      <NumberField label="No buttons" defaultValue={3} hideSteppers />
    </div>
  )
}

export function Empty() {
  return (
    <div className="w-full max-w-48">
      <NumberField
        label="Seats"
        placeholder="Add seats"
        min={1}
      />
    </div>
  )
}

export function WorstCase() {
  return (
    <div className="flex w-full max-w-48 flex-col gap-4">
      <NumberField
        label="Maria Eduarda dos Santos Albuquerque Cavalcanti e Silva Junior"
        defaultValue={1}
      />
      <NumberField
        label="数量とても長いラベルのテスト用文字列"
        defaultValue={1}
      />
      <NumberField label="الكمية" defaultValue={1} />
      <NumberField
        label="Extreme"
        defaultValue={9876543210123}
        locale="pt-BR"
        format={{ style: "currency", currency: "BRL", maximumFractionDigits: 0 }}
      />
      <NumberField label="Negative" defaultValue={-1234567.891} locale="en-US" />
    </div>
  )
}
