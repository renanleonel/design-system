"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "cn"
import type { RegisterableHotkey } from "@tanstack/react-hotkeys"

import { Hotkey } from "@/components/ui/hotkey"

// First hover waits 400ms (no accidental tooltips); neighbours then open instantly.
function TooltipProvider({
  delay = 400,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  hotkey,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > & {
    /** Shows the trigger's hotkey after the label. */
    hotkey?: RegisterableHotkey
  }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 inline-flex w-fit max-w-xs motion-tooltip items-center gap-1.5 rounded-md bg-foreground px-2 py-1 text-xs/5 font-medium text-pretty text-background antialiased has-data-[slot=kbd]:pe-1 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm",
            className
          )}
          {...props}
        >
          {children}
          {hotkey && <Hotkey hotkey={hotkey} />}
          <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

/** Wider or taller than its box (1px slack for subpixel rounding). */
const isClipped = (el: HTMLElement | null) =>
  !!el &&
  (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)

/**
 * Text that truncates (or clamps to `lines`) and shows the full text in a
 * tooltip only while it's actually cut off: in a fixed-width table column,
 * a sidebar, a card title. Measured when the tooltip would open, so resizing
 * needs no listeners. Opens after 200ms (it reveals text already on screen,
 * so it needn't wait as long as a hint). The full text stays in the DOM for
 * screen readers.
 */
function TooltipOverflow({
  children,
  content,
  lines,
  side = "top",
  align,
  delay = 200,
  className,
}: {
  children: React.ReactNode
  /** Tooltip text; defaults to `children`. */
  content?: React.ReactNode
  /** Clamp to this many lines instead of one truncated line. */
  lines?: number
  side?: React.ComponentProps<typeof TooltipContent>["side"]
  align?: React.ComponentProps<typeof TooltipContent>["align"]
  /** Hover time before it opens, in ms. */
  delay?: number
  className?: string
}) {
  const ref = React.useRef<HTMLElement>(null)
  const [open, setOpen] = React.useState(false)
  return (
    <Tooltip
      open={open}
      onOpenChange={(next) => setOpen(next && isClipped(ref.current))}
    >
      <TooltipTrigger
        // Rendered as a span; the trigger's own type says button.
        ref={(el: HTMLElement | null) => {
          ref.current = el
        }}
        render={<span />}
        delay={delay}
        data-slot="tooltip-overflow"
        style={
          lines ? ({ "--lines": lines } as React.CSSProperties) : undefined
        }
        className={cn(
          "block min-w-0",
          lines ? "line-clamp-(--lines)" : "truncate",
          className
        )}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} align={align}>
        {content ?? children}
      </TooltipContent>
    </Tooltip>
  )
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipOverflow,
}
