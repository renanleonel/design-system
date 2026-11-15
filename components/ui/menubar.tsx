"use client"

import * as React from "react"
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar"
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

const MenubarGroup = DropdownMenuGroup
const MenubarLabel = DropdownMenuLabel
const MenubarItem = DropdownMenuItem
const MenubarCheckboxItem = DropdownMenuCheckboxItem
const MenubarRadioGroup = DropdownMenuRadioGroup
const MenubarRadioItem = DropdownMenuRadioItem
const MenubarSeparator = DropdownMenuSeparator
const MenubarShortcut = DropdownMenuShortcut
const MenubarSub = DropdownMenuSub
const MenubarSubTrigger = DropdownMenuSubTrigger

function Menubar({ className, ...props }: MenubarPrimitive.Props) {
  return (
    <MenubarPrimitive
      data-slot="menubar"
      className={cn(
        "flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-lg bg-background p-0.5 shadow-border",
        className
      )}
      {...props}
    />
  )
}

function MenubarMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="menubar-menu" {...props} />
}

function MenubarTrigger({ className, ...props }: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "hit-area flex h-control-sm shrink-0 cursor-default items-center rounded-control px-2.5 text-sm font-medium whitespace-nowrap outline-hidden select-none hover:bg-accent/60 focus-visible:bg-accent focus-visible:text-accent-foreground data-popup-open:bg-accent data-popup-open:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

const popupClassName =
  "z-50 max-h-(--available-height) w-max max-w-(--available-width) min-w-[max(var(--anchor-width),8rem)] motion-popover overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg bg-popover p-1 text-popover-foreground shadow-popover outline-none data-closed:overflow-hidden"

function MenubarContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 6,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="menubar-content"
          className={cn(popupClassName, className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function MenubarSubContent({ className, ...props }: MenuPrimitive.Popup.Props) {
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
          data-slot="menubar-sub-content"
          className={cn(popupClassName, "w-auto min-w-24", className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarLabel,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
