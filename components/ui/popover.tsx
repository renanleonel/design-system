"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "cn"

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <PopoverPrimitive.Portal>
      {/* Below 640px the popover is a bottom sheet over a dimmed page. */}
      <PopoverPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/10 motion-backdrop [--ds-duration-modal:300ms] sm:hidden" />
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50 max-sm:fixed! max-sm:inset-x-0! max-sm:top-auto! max-sm:bottom-0! max-sm:transform-none!"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "z-50 flex w-72 motion-popover flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-popover outline-hidden max-sm:max-h-[80dvh]! max-sm:w-full! max-sm:max-w-none! max-sm:origin-bottom! max-sm:rounded-t-xl max-sm:rounded-b-none max-sm:p-4 max-sm:pb-[max(0.5rem,env(safe-area-inset-bottom))] max-sm:[--ds-duration-popover:300ms] max-sm:[--ds-motion-ease:var(--ds-ease-drawer)] max-sm:[--ds-motion-scale:1] max-sm:[--ds-motion-y:100%]",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
