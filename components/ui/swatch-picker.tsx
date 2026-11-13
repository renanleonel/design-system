"use client"

import * as React from "react"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cn } from "cn"
import { CheckIcon } from "lucide-react"

export type Swatch = {
  value: string
  /** Read by screen readers and shown as a tooltip ("Blue"). */
  label: string
  /** Any CSS color; prefer tokens (`var(--ds-tone-blue)`). */
  color: string
  /**
   * Check mark color. Defaults to the page background, which contrasts with
   * tone colors in both themes (dark tones in light, pale tones in dark).
   */
  foreground?: string
  disabled?: boolean
}

/**
 * Pick one color from a row of swatches: accent colors, labels, themes. A
 * radio group (arrows move and pick); the chosen swatch gets a ring in its own
 * color and a check, so it never relies on color alone. Name it with
 * `aria-label` or `aria-labelledby`.
 */
function SwatchPicker({
  swatches,
  value,
  defaultValue,
  onValueChange,
  disabled,
  name,
  size = "default",
  className,
  ...aria
}: {
  swatches: Swatch[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string) => void
  disabled?: boolean
  name?: string
  size?: "sm" | "default"
  className?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
}) {
  return (
    <RadioGroupPrimitive
      data-slot="swatch-picker"
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => onValueChange?.(v as string)}
      disabled={disabled}
      name={name}
      className={cn(
        "flex flex-wrap items-center gap-3 data-disabled:opacity-50",
        className
      )}
      {...aria}
    >
      {swatches.map((swatch) => (
        <RadioPrimitive.Root
          key={swatch.value}
          value={swatch.value}
          disabled={swatch.disabled}
          aria-label={swatch.label}
          title={swatch.label}
          style={
            {
              "--swatch": swatch.color,
              "--swatch-fg": swatch.foreground ?? "var(--background)",
            } as React.CSSProperties
          }
          className={cn(
            "group/swatch hit-area relative flex shrink-0 items-center justify-center rounded-full bg-(--swatch) text-(--swatch-fg) motion-press outline-none",
            // Hairline so pale swatches still read against the page (3:1).
            "shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground)_15%,transparent)]",
            // Chosen: a gap, then a ring in the swatch's own color.
            "data-checked:shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--swatch)]",
            "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--ds-focus-ring)",
            "data-disabled:cursor-not-allowed",
            size === "sm" ? "size-6" : "size-8"
          )}
        >
          <CheckIcon
            aria-hidden
            strokeWidth={3}
            className={cn(
              "scale-50 opacity-0 transition-[scale,opacity] duration-150 ease-out group-data-checked/swatch:scale-100 group-data-checked/swatch:opacity-100 motion-reduce:transition-none",
              size === "sm" ? "size-3" : "size-4"
            )}
          />
        </RadioPrimitive.Root>
      ))}
    </RadioGroupPrimitive>
  )
}

export { SwatchPicker }
