"use client"

import * as React from "react"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cn } from "cn"
import { StarIcon } from "lucide-react"

const plural = (n: number) =>
  `${n.toLocaleString("en-US")} ${n === 1 ? "star" : "stars"}`

/**
 * A star rating. Interactive, it's a radio group: arrows move and pick,
 * hovering previews. With `readOnly` it's an image named "4.5 out of 5 stars"
 * and shows fractions, for review summaries. `allowHalf` splits each star
 * into two targets (left half, right half), so arrows step by 0.5.
 */
function Rating({
  value,
  defaultValue,
  onValueChange,
  max = 5,
  readOnly = false,
  allowHalf = false,
  disabled,
  name,
  size = "default",
  className,
  "aria-label": ariaLabel = "Rating",
  "aria-labelledby": ariaLabelledby,
}: {
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number) => void
  max?: number
  /** Display only; accepts fractions (4.5). */
  readOnly?: boolean
  /** Interactive half stars: values 0.5, 1, 1.5 … `max`. */
  allowHalf?: boolean
  disabled?: boolean
  name?: string
  size?: "sm" | "default"
  className?: string
  "aria-label"?: string
  "aria-labelledby"?: string
}) {
  const [own, setOwn] = React.useState(defaultValue ?? null)
  const current = value !== undefined ? value : own
  const [hover, setHover] = React.useState<number | null>(null)
  const stars = Array.from({ length: max }, (_, i) => i + 1)
  const iconSize = size === "sm" ? "size-4" : "size-5"

  if (readOnly) {
    const shown = Math.max(0, Math.min(max, current ?? 0))
    return (
      <span
        role="img"
        aria-label={`${shown.toLocaleString("en-US")} out of ${plural(max)}`}
        data-slot="rating"
        className={cn("inline-flex items-center gap-0.5", className)}
      >
        {stars.map((n) => (
          <Star
            key={n}
            fill={Math.max(0, Math.min(1, shown - (n - 1)))}
            className={iconSize}
          />
        ))}
      </span>
    )
  }

  const lit = hover ?? current ?? 0
  return (
    <RadioGroupPrimitive
      data-slot="rating"
      value={current}
      onValueChange={(v) => {
        setOwn(v as number)
        onValueChange?.(v as number)
      }}
      disabled={disabled}
      name={name}
      aria-label={ariaLabelledby ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledby}
      onPointerLeave={() => setHover(null)}
      className={cn(
        "inline-flex items-center gap-0.5 data-disabled:opacity-50",
        className
      )}
    >
      {stars.map((n) =>
        allowHalf ? (
          // One star, two radios over its halves; the ring shows on the star.
          <span
            key={n}
            className="relative flex rounded-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--ds-focus-ring)"
          >
            <Star
              fill={Math.max(0, Math.min(1, lit - (n - 1)))}
              className={iconSize}
            />
            {[n - 0.5, n].map((v) => (
              <RadioPrimitive.Root
                key={v}
                value={v}
                aria-label={plural(v)}
                onPointerEnter={() => !disabled && setHover(v)}
                className={cn(
                  "absolute inset-y-0 w-1/2 outline-none disabled:cursor-not-allowed",
                  v === n ? "end-0" : "start-0"
                )}
              />
            ))}
          </span>
        ) : (
          <RadioPrimitive.Root
            key={n}
            value={n}
            aria-label={plural(n)}
            onPointerEnter={() => !disabled && setHover(n)}
            className="hit-area flex items-center justify-center rounded-sm focus-ring outline-none disabled:cursor-not-allowed"
          >
            <Star fill={n <= lit ? 1 : 0} className={iconSize} />
          </RadioPrimitive.Root>
        )
      )}
    </RadioGroupPrimitive>
  )
}

/** An outlined star with `fill` (0–1) of it painted from the leading edge. */
function Star({ fill, className }: { fill: number; className?: string }) {
  return (
    <span aria-hidden className={cn("relative inline-flex", className)}>
      <StarIcon className="size-full text-muted-foreground" />
      {fill > 0 && (
        <span
          className="absolute inset-y-0 start-0 overflow-hidden"
          style={{ width: `${fill * 100}%` }}
        >
          {/* Full-size star, clipped by the wrapper's width. */}
          <StarIcon
            className={cn(
              "max-w-none fill-tone-amber text-tone-amber",
              className
            )}
          />
        </span>
      )}
    </span>
  )
}

export { Rating }
