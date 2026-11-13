"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "cn"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { useIsTouch } from "@/hooks/use-media-query"

type Item<Value> = { label: React.ReactNode; value: Value }

function toItemList<Value>(items: unknown): Item<Value>[] {
  if (Array.isArray(items)) return items as Item<Value>[]
  return Object.entries((items ?? {}) as Record<string, React.ReactNode>).map(
    ([value, label]) => ({ value: value as Value, label })
  )
}

/**
 * On touch devices a single select with `items` renders the platform's native
 * picker (interaction.md: native controls on mobile); its children are ignored
 * there. `native` forces it on (`true`) or off (`false`). In native mode, pass
 * `id` / `aria-label` / `placeholder` here, since the trigger isn't rendered.
 */
function Select<Value, Multiple extends boolean | undefined = false>({
  native = "touch",
  id,
  placeholder,
  "aria-label": ariaLabel,
  ...props
}: SelectPrimitive.Root.Props<Value, Multiple> & {
  native?: boolean | "touch"
  id?: string
  placeholder?: string
  "aria-label"?: string
}) {
  const touch = useIsTouch()
  const useNative =
    (native === true || (native === "touch" && touch)) &&
    props.items != null &&
    !props.multiple

  if (!useNative) return <SelectPrimitive.Root {...props} />

  // Native options carry string values; map them back by index.
  const list = toItemList<Value>(props.items)
  const indexOf = (value: unknown) =>
    list.findIndex((item) => item.value === value)
  const selected = props.value !== undefined ? indexOf(props.value) : undefined
  const initial =
    props.defaultValue !== undefined ? indexOf(props.defaultValue) : undefined
  // No match (e.g. a null value) selects the placeholder option.
  const toOption = (index: number) => (index < 0 ? "" : String(index))

  return (
    <NativeSelect
      id={id}
      aria-label={ariaLabel}
      name={props.name}
      required={props.required}
      disabled={props.disabled}
      className="w-full"
      value={selected === undefined ? undefined : toOption(selected)}
      defaultValue={
        initial === undefined
          ? placeholder
            ? ""
            : undefined
          : toOption(initial)
      }
      onChange={(event) => {
        const item = list[Number(event.target.value)]
        const change = props.onValueChange as
          ((value: Value, details: never) => void) | undefined
        if (item) change?.(item.value, undefined as never)
      }}
    >
      {placeholder && (
        <NativeSelectOption value="" disabled>
          {placeholder}
        </NativeSelectOption>
      )}
      {list.map((item, index) => (
        <NativeSelectOption key={index} value={String(index)}>
          {typeof item.label === "string" ? item.label : String(item.value)}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("block min-w-0 flex-1 truncate text-start", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "group/select-trigger flex w-fit items-center justify-between gap-1.5 rounded-control border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap focus-ring transition-colors outline-none select-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-control data-[size=sm]:h-control-sm data-[size=sm]:rounded-[min(var(--radius-md),10px)] dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground transition-transform duration-200 ease-out group-data-popup-open/select-trigger:rotate-180 motion-reduce:transition-none" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            "relative isolate z-50 max-h-(--available-height) w-max max-w-(--available-width) min-w-[max(var(--anchor-width),9rem)] motion-popover overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg bg-popover text-popover-foreground shadow-popover data-[side=none]:[--ds-motion-scale:1]",
            className
          )}
          {...props}
        >
          {/* No scroll arrows: they scroll on hover, so resting the pointer
              near an edge runs the list away. The list scrolls natively. */}
          <SelectPrimitive.List className="p-1">
            {children}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-1.75 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex min-h-9 w-full cursor-default items-center gap-1.5 rounded-sm py-1 pr-8 pl-1.75 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground pointer-coarse:min-h-11 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex min-w-0 flex-1 gap-2">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
