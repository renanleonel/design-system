"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cn } from "cn"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-3", className)}
      {...props}
    />
  )
}

/**
 * One option. The dot grows in from half size (never from 0) in 150ms; the
 * hit area extends past the circle like Checkbox's.
 */
function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer hit-area relative flex size-4 shrink-0 items-center justify-center rounded-full border border-input focus-ring transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 not-data-checked:hover:border-foreground/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30 dark:not-data-checked:hover:border-foreground/30 dark:aria-invalid:border-destructive/50 data-checked:border-primary data-checked:bg-primary dark:data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className="size-1.5 scale-50 rounded-full bg-primary-foreground opacity-0 transition-[scale,opacity] duration-150 ease-out group-data-checked/radio-group-item:scale-100 group-data-checked/radio-group-item:opacity-100 motion-reduce:transition-none"
      />
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
