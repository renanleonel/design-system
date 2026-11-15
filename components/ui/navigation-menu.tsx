"use client"

import * as React from "react"
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"

/** Shared by triggers and plain top-level links, so both read as one bar. */
const navigationMenuTriggerClassName =
  "group/navigation-menu-trigger hit-area inline-flex min-h-control-sm max-w-full items-center justify-center gap-1 rounded-control px-3 py-1 text-start text-sm font-medium outline-hidden select-none hover:bg-accent/60 focus-visible:bg-accent data-popup-open:bg-accent data-active:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50"

/**
 * The bar. Its panels share one popup that resizes and slides between them,
 * so pass `NavigationMenuList` as the child.
 */
function NavigationMenu({
  className,
  children,
  align = "start",
  ...props
}: NavigationMenuPrimitive.Root.Props & {
  align?: "start" | "center" | "end"
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn("relative flex max-w-full", className)}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Portal>
        <NavigationMenuPrimitive.Positioner
          align={align}
          sideOffset={8}
          collisionPadding={{ top: 8, bottom: 8, left: 16, right: 16 }}
          collisionAvoidance={{ side: "none" }}
          className="isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) [transition-property:top,left,right,bottom] duration-(--ds-duration-popover) ease-out before:absolute before:content-[''] data-instant:transition-none data-[side=bottom]:before:inset-x-0 data-[side=bottom]:before:-top-2 data-[side=bottom]:before:h-2"
        >
          <NavigationMenuPrimitive.Popup
            data-slot="navigation-menu-popup"
            className="relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-lg bg-popover text-popover-foreground shadow-popover [transition-property:opacity,transform,width,height] duration-(--ds-duration-popover) ease-out outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
          >
            <NavigationMenuPrimitive.Viewport
              data-slot="navigation-menu-viewport"
              className="relative h-full w-full overflow-hidden rounded-lg"
            />
          </NavigationMenuPrimitive.Popup>
        </NavigationMenuPrimitive.Positioner>
      </NavigationMenuPrimitive.Portal>
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: NavigationMenuPrimitive.List.Props) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "relative flex max-w-full flex-wrap items-center gap-0.5",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: NavigationMenuPrimitive.Item.Props) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("max-w-full", className)}
      {...props}
    />
  )
}

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerClassName, className)}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Icon className="flex transition-transform duration-(--ds-duration-popover) ease-out group-data-popup-open/navigation-menu-trigger:rotate-180">
        <ChevronDownIcon className="size-4" />
      </NavigationMenuPrimitive.Icon>
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  ...props
}: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "h-full w-[calc(100vw-2rem)] p-1.5 transition-[opacity,transform,translate] duration-(--ds-duration-popover) ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:data-[activation-direction=left]:translate-x-1/4 data-starting-style:data-[activation-direction=left]:-translate-x-1/4 data-ending-style:data-[activation-direction=right]:-translate-x-1/4 data-starting-style:data-[activation-direction=right]:translate-x-1/4 sm:w-max sm:max-w-lg",
        className
      )}
      {...props}
    />
  )
}

/** A link in a panel (title and description). A top-level link takes `navigationMenuTriggerClassName`. */
function NavigationMenuLink({
  className,
  ...props
}: NavigationMenuPrimitive.Link.Props) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex flex-col gap-0.5 rounded-sm p-2 text-sm outline-hidden hover:bg-accent focus-visible:bg-accent data-active:bg-accent [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerClassName,
}
