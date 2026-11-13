"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-media-query"

/**
 * Responsive by default: a centered modal on desktop, a swipeable bottom drawer
 * below 640px (interaction.md: "on mobile prefer a bottom sheet"). Every part
 * reads the mode from context, so callers write one tree. `responsive={false}`
 * keeps the modal everywhere.
 */
const DialogModeContext = React.createContext<"dialog" | "drawer">("dialog")
const useDialogMode = () => React.useContext(DialogModeContext)

function Dialog({
  responsive = true,
  ...props
}: DialogPrimitive.Root.Props & { responsive?: boolean }) {
  const mobile = useIsMobile()
  const mode = responsive && mobile ? "drawer" : "dialog"
  return (
    <DialogModeContext value={mode}>
      {mode === "drawer" ? (
        <Drawer
          showSwipeHandle
          {...(props as React.ComponentProps<typeof Drawer>)}
        />
      ) : (
        <DialogPrimitive.Root data-slot="dialog" {...props} />
      )}
    </DialogModeContext>
  )
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  if (useDialogMode() === "drawer") {
    return (
      <DrawerTrigger
        {...(props as React.ComponentProps<typeof DrawerTrigger>)}
      />
    )
  }
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  if (useDialogMode() === "drawer") {
    return (
      <DrawerClose {...(props as React.ComponentProps<typeof DrawerClose>)} />
    )
  }
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 motion-backdrop supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  if (useDialogMode() === "drawer") {
    // The drawer has its own swipe handle and backdrop; no close button needed.
    return (
      <DrawerContent {...(props as React.ComponentProps<typeof DrawerContent>)}>
        <div
          data-slot="dialog-content"
          className={cn(
            "grid min-h-0 gap-4 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-sm",
            className
          )}
        >
          {children}
        </div>
      </DrawerContent>
    )
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid max-h-[90dvh] w-full max-w-[calc(100%-2rem)] motion-modal -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto overscroll-contain rounded-xl bg-popover p-4 text-sm text-popover-foreground shadow-modal outline-none sm:max-w-sm",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 in-data-[slot=drawer-popup]:mb-[calc(-1*max(1rem,env(safe-area-inset-bottom)))] in-data-[slot=drawer-popup]:rounded-none in-data-[slot=drawer-popup]:pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  const classes = cn(
    "font-heading text-base leading-none font-medium",
    className
  )
  if (useDialogMode() === "drawer") {
    return (
      <DrawerTitle
        {...(props as React.ComponentProps<typeof DrawerTitle>)}
        className={classes}
      />
    )
  }
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={classes}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  const classes = cn(
    "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
    className
  )
  if (useDialogMode() === "drawer") {
    return (
      <DrawerDescription
        {...(props as React.ComponentProps<typeof DrawerDescription>)}
        className={classes}
      />
    )
  }
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={classes}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
