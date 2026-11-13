"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "cn"
import { ChevronRightIcon, CheckIcon } from "lucide-react"
import type { RegisterableHotkey } from "@tanstack/react-hotkeys"

import { Hotkey } from "@/components/ui/hotkey"
import { opticalText } from "@/lib/utils"
import {
  mergeRefs,
  toAriaKeyShortcuts,
  useHotkeyPress,
} from "@/hooks/use-hotkey-press"

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      {/* Below 640px the menu is a bottom sheet over a dimmed page. */}
      <MenuPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/10 motion-backdrop [--ds-duration-modal:300ms] sm:hidden" />
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none max-sm:fixed! max-sm:inset-x-0! max-sm:top-auto! max-sm:bottom-0! max-sm:transform-none!"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "z-50 max-h-(--available-height) w-max max-w-(--available-width) min-w-[max(var(--anchor-width),8rem)] motion-popover overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg bg-popover p-1 text-popover-foreground shadow-popover outline-none max-sm:max-h-[80dvh]! max-sm:w-full! max-sm:max-w-none! max-sm:origin-bottom! max-sm:rounded-t-xl max-sm:rounded-b-none max-sm:pb-[max(0.5rem,env(safe-area-inset-bottom))] max-sm:[--ds-duration-popover:300ms] max-sm:[--ds-motion-ease:var(--ds-ease-drawer)] max-sm:[--ds-motion-scale:1] max-sm:[--ds-motion-y:100%] data-closed:overflow-hidden",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

/** True inside a Group or RadioGroup, where a label can name the group. */
const InGroupContext = React.createContext(false)

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return (
    <InGroupContext value={true}>
      <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
    </InGroupContext>
  )
}

/**
 * A heading in the menu. Inside `DropdownMenuGroup` / `DropdownMenuRadioGroup`
 * it labels the group for screen readers; anywhere else it's a plain heading
 * (Base UI's GroupLabel throws outside a group).
 */

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}) {
  const inGroup = React.useContext(InGroupContext)
  const classes = cn(
    "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7",
    typeof className === "string" ? className : undefined
  )
  if (!inGroup) {
    const rest = { ...props }
    delete rest.render
    return (
      <div
        data-slot="dropdown-menu-label"
        data-inset={inset}
        className={classes}
        {...(rest as React.ComponentProps<"div">)}
      />
    )
  }
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={classes}
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  hotkey,
  ref,
  children,
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
  /**
   * Shown at the end of the item, and fires it while the menu is open. For a
   * shortcut that also works with the menu closed, register the same hotkey on the
   * action itself (`useHotkey`) and pass it here only for display.
   */
  hotkey?: RegisterableHotkey
}) {
  const innerRef = React.useRef<HTMLDivElement>(null)
  useHotkeyPress(innerRef, hotkey, { enabled: !props.disabled })
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      ref={mergeRefs(ref, innerRef)}
      aria-keyshortcuts={toAriaKeyShortcuts(hotkey)}
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex min-h-9 cursor-default items-center gap-1.5 rounded-sm px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 pointer-coarse:min-h-11 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    >
      {opticalText(children)}
      {hotkey && (
        <DropdownMenuShortcut>
          <Hotkey hotkey={hotkey} variant="text" />
        </DropdownMenuShortcut>
      )}
    </MenuPrimitive.Item>
  )
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex min-h-9 cursor-default items-center gap-1.5 rounded-sm px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-popup-open:bg-accent data-popup-open:text-accent-foreground pointer-coarse:min-h-11 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {opticalText(children)}
      <ChevronRightIcon className="ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "w-auto min-w-[96px] motion-popover rounded-lg bg-popover p-1 text-popover-foreground shadow-popover",
        className
      )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex min-h-9 cursor-default items-center gap-1.5 rounded-sm py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 pointer-coarse:min-h-11 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {opticalText(children)}
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return (
    <InGroupContext value={true}>
      <MenuPrimitive.RadioGroup
        data-slot="dropdown-menu-radio-group"
        {...props}
      />
    </InGroupContext>
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex min-h-9 cursor-default items-center gap-1.5 rounded-sm py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 pointer-coarse:min-h-11 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {opticalText(children)}
    </MenuPrimitive.RadioItem>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
