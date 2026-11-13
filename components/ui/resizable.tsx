"use client"

import * as React from "react"
import { cn } from "cn"
import * as ResizablePrimitive from "react-resizable-panels"

/**
 * Panels split by draggable handles: editors beside a preview, a list beside
 * its detail. Handles take drag, arrows, Home/End and double-click (reset).
 * Sizes are percentages by default; persist them with `onLayoutChanged` and
 * `defaultLayout`. For app sidebars use the app shell's pattern instead
 * (BLOCKS.md, Resizable sidebars).
 */
function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      // The library sets flex direction from `orientation`.
      className={cn("size-full", className)}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  /** Shows a grip, for handles people might not find. */
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        // A 1px rule; the library widens the hit target around it.
        // aria-orientation is the handle's own: vertical in a horizontal group.
        "relative flex w-px shrink-0 items-center justify-center bg-border outline-none transition-colors",
        // data-separator: inactive | hover | active | focus | disabled.
        "data-[separator=active]:bg-(--ds-focus-ring) data-[separator=focus]:bg-(--ds-focus-ring) data-[separator=hover]:bg-foreground/30",
        "aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full",
        className
      )}
      {...props}
    >
      {withHandle && (
        <span
          aria-hidden
          className="z-10 flex h-6 w-1.5 shrink-0 rounded-full border bg-border in-aria-[orientation=horizontal]:h-1.5 in-aria-[orientation=horizontal]:w-6"
        />
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
