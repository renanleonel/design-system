"use client"

import * as React from "react"
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "cn"

import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"

// The rows are the dropdown menu's own, so both menus look and behave the same.
const ContextMenuGroup = DropdownMenuGroup
const ContextMenuLabel = DropdownMenuLabel
const ContextMenuItem = DropdownMenuItem
const ContextMenuCheckboxItem = DropdownMenuCheckboxItem
const ContextMenuRadioGroup = DropdownMenuRadioGroup
const ContextMenuRadioItem = DropdownMenuRadioItem
const ContextMenuSeparator = DropdownMenuSeparator
const ContextMenuShortcut = DropdownMenuShortcut
const ContextMenuSub = DropdownMenuSub
const ContextMenuSubTrigger = DropdownMenuSubTrigger

function ContextMenu({ ...props }: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

/** The region that opens the menu on right click or long press. */
function ContextMenuTrigger({ ...props }: ContextMenuPrimitive.Trigger.Props) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  )
}

const popupClassName =
  "z-50 max-h-(--available-height) w-max max-w-(--available-width) min-w-32 motion-popover overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg bg-popover p-1 text-popover-foreground shadow-popover outline-none data-closed:overflow-hidden"

function ContextMenuContent({
  className,
  ...props
}: ContextMenuPrimitive.Popup.Props) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner className="isolate z-50 outline-none">
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
          className={cn(popupClassName, className)}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuSubContent({
  className,
  ...props
}: MenuPrimitive.Popup.Props) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        side="inline-end"
        align="start"
        alignOffset={-3}
        sideOffset={0}
      >
        <MenuPrimitive.Popup
          data-slot="context-menu-sub-content"
          className={cn(popupClassName, "w-auto min-w-24", className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
}
