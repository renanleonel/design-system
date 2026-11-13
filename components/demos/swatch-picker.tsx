"use client"

import * as React from "react"

import { SwatchPicker, type Swatch } from "@/components/ui/swatch-picker"

const TONES: Swatch[] = (
  ["gray", "orange", "red", "green", "blue", "purple"] as const
).map((tone) => ({
  value: tone,
  label: tone[0].toUpperCase() + tone.slice(1),
  color: `var(--ds-tone-${tone})`,
}))

/** Arrow keys move and pick; the chosen swatch gets a ring and a check. */
export function Default() {
  const [value, setValue] = React.useState("blue")
  return (
    <SwatchPicker
      swatches={TONES}
      value={value}
      onValueChange={setValue}
      aria-label="Accent color"
    />
  )
}

/** Small, for label colors in a menu or popover. */
export function Small() {
  return (
    <SwatchPicker
      swatches={TONES}
      defaultValue="green"
      size="sm"
      aria-label="Label color"
    />
  )
}

/** One option locked (e.g. a paid plan); the rest still work. */
export function DisabledOption() {
  return (
    <SwatchPicker
      swatches={TONES.map((s) =>
        s.value === "purple" ? { ...s, label: "Purple (Pro)", disabled: true } : s
      )}
      defaultValue="gray"
      aria-label="Accent color"
    />
  )
}
