"use client"

import * as React from "react"
import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card"
import { cn } from "cn"

function PreviewCard({ ...props }: PreviewCardPrimitive.Root.Props) {
  return <PreviewCardPrimitive.Root data-slot="preview-card" {...props} />
}

/** A real link. Hovering or focusing it previews the destination; touch follows the link. */
function PreviewCardTrigger({
  className,
  ...props
}: PreviewCardPrimitive.Trigger.Props) {
  return (
    <PreviewCardPrimitive.Trigger
      data-slot="preview-card-trigger"
      className={cn(
        "rounded-sm underline decoration-muted-foreground/50 underline-offset-4 outline-hidden focus-ring hover:decoration-foreground data-popup-open:decoration-foreground",
        className
      )}
      {...props}
    />
  )
}

function PreviewCardContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 6,
  ...props
}: PreviewCardPrimitive.Popup.Props &
  Pick<
    PreviewCardPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PreviewCardPrimitive.Popup
          data-slot="preview-card-content"
          className={cn(
            "z-50 flex w-72 max-w-(--available-width) motion-popover flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-popover outline-hidden",
            className
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export { PreviewCard, PreviewCardTrigger, PreviewCardContent }
