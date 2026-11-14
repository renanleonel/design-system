"use client"

import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "cn"

/**
 * One value or a range (pass an array). Arrow keys step, Shift+arrows step
 * by 10, Home/End jump to the ends. The thumb's hit area is 32px (44px on
 * touch) and it grows slightly while dragged.
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  "aria-label": ariaLabel,
  ...props
}: SliderPrimitive.Root.Props) {
  const values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [value ?? defaultValue ?? min]

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center py-2 select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col data-vertical:px-2 data-vertical:py-0">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {values.map((_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            // A thumb is its position in the value array; Base UI keys it by index too.
            // react-doctor-disable-next-line react-doctor/no-array-index-as-key
            key={index}
            index={index}
            // The label belongs on each thumb's input (that's what gets focus).
            getAriaLabel={
              ariaLabel
                ? (i) =>
                    values.length > 1
                      ? `${ariaLabel}, ${i === 0 ? "minimum" : "maximum"}`
                      : ariaLabel
                : undefined
            }
            className="relative block size-4 shrink-0 rounded-full border border-primary bg-background shadow-border transition-[scale] duration-150 ease-out select-none after:absolute after:-inset-2 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--ds-focus-ring) data-disabled:pointer-events-none data-dragging:scale-110 motion-reduce:transition-none pointer-coarse:after:-inset-3.5"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
