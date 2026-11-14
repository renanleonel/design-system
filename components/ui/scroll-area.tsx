"use client"

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import { cn } from "cn"

type ScrollAreaProps = ScrollAreaPrimitive.Root.Props & {
  /** Which scrollbars to render. */
  orientation?: "vertical" | "horizontal" | "both"
  /** Fades the edges that still have content beyond them. */
  fade?: boolean
  /** Props for the scrolling viewport (aria-label, className, ref). */
  viewportProps?: ScrollAreaPrimitive.Viewport.Props
}

const FADE_Y =
  "mask-linear-[to_bottom,transparent_0,black_min(1.5rem,var(--scroll-area-overflow-y-start)),black_calc(100%_-_min(1.5rem,var(--scroll-area-overflow-y-end,1.5rem))),transparent_100%] mask-no-repeat"
const FADE_X =
  "rtl:mask-linear-[to_left,transparent_0,black_min(1.5rem,var(--scroll-area-overflow-x-start)),black_calc(100%_-_min(1.5rem,var(--scroll-area-overflow-x-end,1.5rem))),transparent_100%] mask-linear-[to_right,transparent_0,black_min(1.5rem,var(--scroll-area-overflow-x-start)),black_calc(100%_-_min(1.5rem,var(--scroll-area-overflow-x-end,1.5rem))),transparent_100%] mask-no-repeat"

function ScrollArea({
  className,
  children,
  orientation = "vertical",
  fade = false,
  viewportProps,
  ...props
}: ScrollAreaProps) {
  const { className: viewportClassName, ...viewportRest } = viewportProps ?? {}
  const vertical = orientation !== "horizontal"
  const horizontal = orientation !== "vertical"
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative min-h-0 min-w-0 overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className={cn(
          "size-full rounded-[inherit] focus-ring outline-none",
          fade && vertical && FADE_Y,
          fade && !vertical && FADE_X,
          viewportClassName
        )}
        {...viewportRest}
      >
        {/* Base UI sizes Content to fit-content; with no horizontal scrollbar
            that lets one wide child (a <pre>) widen every sibling. */}
        <ScrollAreaPrimitive.Content className={cn(!horizontal && "min-w-0!")}>
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      {vertical && <ScrollBar orientation="vertical" />}
      {horizontal && <ScrollBar orientation="horizontal" />}
      {vertical && horizontal && (
        <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
      )}
    </ScrollAreaPrimitive.Root>
  )
}

/** Overlay bars: invisible until hover or scroll, 10px wide with a 24px hit area on touch. */
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "pointer-events-none flex touch-none p-0.5 opacity-0 transition-opacity duration-(--ds-duration-press) select-none data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0 data-horizontal:h-2.5 data-horizontal:flex-col data-vertical:w-2.5 motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border hover:bg-muted-foreground/60"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar }
