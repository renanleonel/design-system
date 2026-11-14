"use client"

import { Meter as MeterPrimitive } from "@base-ui/react/meter"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const meterIndicatorVariants = cva(
  "h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none",
  {
    variants: {
      // Same tones as Badge. The bar is a graphic (3:1), so the full tone color.
      tone: {
        default: "bg-primary",
        gray: "bg-tone-gray",
        blue: "bg-tone-blue",
        green: "bg-tone-green",
        amber: "bg-tone-amber",
        orange: "bg-tone-orange",
        red: "bg-tone-red",
        purple: "bg-tone-purple",
      },
    },
    defaultVariants: { tone: "default" },
  }
)

type MeterProps = MeterPrimitive.Root.Props &
  VariantProps<typeof meterIndicatorVariants>

/**
 * A value within a known range (storage used, seats taken), as opposed to
 * `Progress`, which tracks a task. Children are the label and value; the
 * track and bar follow. Pick the `tone` from the value (green, amber, red).
 */
function Meter({ className, children, tone, ...props }: MeterProps) {
  return (
    <MeterPrimitive.Root
      data-slot="meter"
      className={cn("flex flex-wrap gap-x-3 gap-y-2", className)}
      {...props}
    >
      {children}
      <MeterTrack>
        <MeterIndicator tone={tone} />
      </MeterTrack>
    </MeterPrimitive.Root>
  )
}

function MeterTrack({ className, ...props }: MeterPrimitive.Track.Props) {
  return (
    <MeterPrimitive.Track
      data-slot="meter-track"
      className={cn(
        "relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    />
  )
}

function MeterIndicator({
  className,
  tone,
  ...props
}: MeterPrimitive.Indicator.Props &
  VariantProps<typeof meterIndicatorVariants>) {
  return (
    <MeterPrimitive.Indicator
      data-slot="meter-indicator"
      className={cn(meterIndicatorVariants({ tone }), className)}
      {...props}
    />
  )
}

function MeterLabel({ className, ...props }: MeterPrimitive.Label.Props) {
  return (
    <MeterPrimitive.Label
      data-slot="meter-label"
      className={cn("min-w-0 flex-1 truncate text-sm font-medium", className)}
      {...props}
    />
  )
}

function MeterValue({ className, ...props }: MeterPrimitive.Value.Props) {
  return (
    <MeterPrimitive.Value
      data-slot="meter-value"
      className={cn(
        "ms-auto shrink-0 text-sm text-muted-foreground tabular-nums",
        className
      )}
      {...props}
    />
  )
}

export { Meter, MeterTrack, MeterIndicator, MeterLabel, MeterValue }
