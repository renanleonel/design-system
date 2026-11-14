"use client"

import type * as React from "react"
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

/**
 * A two-state button (bold on/off). `pressed` / `onPressedChange`.
 * `pressedChildren` swaps the icon and label while on ("Bookmark" →
 * "Bookmarked"); both stay laid out in one cell, so the width never jumps.
 */
function Toggle({
  className,
  variant = "default",
  size = "default",
  children,
  pressedChildren,
  ...props
}: TogglePrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    /** Shown instead of `children` while pressed. */
    pressedChildren?: React.ReactNode
  }) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    >
      {pressedChildren === undefined ? (
        children
      ) : (
        // gap-[inherit] here too: the button's gap reaches the icon and label
        // through this one-cell grid (where it has no layout effect).
        <span className="inline-grid gap-[inherit] *:col-start-1 *:row-start-1 *:inline-flex *:items-center *:justify-center *:gap-[inherit]">
          {/* `invisible` also drops the hidden one from the accessible name. */}
          <span className="group-data-pressed/toggle:invisible">
            {children}
          </span>
          <span className="invisible group-data-pressed/toggle:visible">
            {pressedChildren}
          </span>
        </span>
      )}
    </TogglePrimitive>
  )
}

export { Toggle, toggleVariants }
