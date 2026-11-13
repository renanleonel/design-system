"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const toggleVariants = cva(
  "group/toggle hit-area inline-flex shrink-0 motion-press items-center justify-center gap-1.5 rounded-control text-sm font-medium whitespace-nowrap text-muted-foreground focus-ring transition-[color,background-color,box-shadow,scale] outline-none select-none hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-pressed:bg-muted data-pressed:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-border bg-background hover:bg-muted data-pressed:border-transparent dark:bg-input/30",
      },
      size: {
        default: "h-control min-w-(--ds-control-h) px-2",
        sm: "h-control-sm min-w-(--ds-control-h-sm) px-1.5 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-control-lg min-w-(--ds-control-h-lg) px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/** A two-state button (bold on/off). `pressed` / `onPressedChange`. */
function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
