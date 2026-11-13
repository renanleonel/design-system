import * as React from "react"
import { cn } from "cn"

import { Input } from "@/components/ui/input"

/**
 * A time of day ("HH:mm", or "HH:mm:ss" with `step` under 60). The browser's
 * own field: segment-by-segment typing, arrow keys, the locale's 12/24h
 * format and the native picker on touch. Pair it with `DatePicker` for a
 * date and time.
 */
function TimeInput({
  className,
  step = 60,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  return (
    <Input
      type="time"
      step={step}
      data-slot="time-input"
      className={cn(
        "w-auto min-w-28 tabular-nums scheme-light dark:scheme-dark [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-datetime-edit-fields-wrapper]:p-0",
        className
      )}
      {...props}
    />
  )
}

export { TimeInput }
