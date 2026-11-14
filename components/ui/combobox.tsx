"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ChevronDownIcon, XIcon, CheckIcon } from "lucide-react"

/** Lets `ComboboxVirtualList` scroll keyboard-highlighted rows into view. */
const VirtualScroll = React.createContext<React.RefObject<
  ((index: number) => void) | null
> | null>(null)
/** Index of the virtual row an item renders in (Base UI needs it). */
const VirtualRow = React.createContext<{ index: number; size: number } | null>(
  null
)
/**
 * The field's whole `InputGroup` (addons included), so the popup anchors to
 * and matches the width of what people see, not just the bare `<input>`.
 */
const FieldAnchor = React.createContext<{
  element: HTMLDivElement | null
  set: (element: HTMLDivElement | null) => void
} | null>(null)
/** Inputs inside the popup (search fields) never become the anchor. */
const InPopup = React.createContext(false)

function Combobox<
  Value,
  Multiple extends boolean | undefined = false,
  Item = Value,
>({
  onItemHighlighted,
  ...props
}: ComboboxPrimitive.Root.Props<Value, Multiple, Item>) {
  const scrollTo = React.useRef<((index: number) => void) | null>(null)
  const [field, setField] = React.useState<HTMLDivElement | null>(null)
  const anchor = React.useMemo(
    () => ({ element: field, set: setField }),
    [field]
  )
  return (
    <FieldAnchor value={anchor}>
      <VirtualScroll value={scrollTo}>
        <ComboboxPrimitive.Root
          {...(props as ComboboxPrimitive.Root.Props<Value, Multiple, Item>)}
          onItemHighlighted={(item, details) => {
            // A virtualized row may not be mounted yet: bring it in first.
            if (details.reason !== "pointer") scrollTo.current?.(details.index)
            onItemHighlighted?.(item, details)
          }}
        />
      </VirtualScroll>
    </FieldAnchor>
  )
}

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        "group/combobox-trigger [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground transition-transform duration-200 ease-out group-data-popup-open/combobox-trigger:rotate-180 motion-reduce:transition-none" />
    </ComboboxPrimitive.Trigger>
  )
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      aria-label="Clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn(className)}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  )
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean
  showClear?: boolean
}) {
  const fieldAnchor = React.use(FieldAnchor)
  const inPopup = React.use(InPopup)
  return (
    <InputGroup
      ref={inPopup ? undefined : fieldAnchor?.set}
      className={cn("w-auto", className)}
    >
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} />}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            render={<ComboboxTrigger />}
            data-slot="input-group-button"
            aria-label="Show options"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
          />
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  children,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  const field = React.use(FieldAnchor)?.element
  const resolved = anchor ?? field ?? undefined
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={resolved}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-anchored={!!resolved}
          className={cn(
            "group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] motion-popover overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-popover data-[anchored=true]:min-w-(--anchor-width) *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-control *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none",
            className
          )}
          {...props}
        >
          <InPopup value>{children}</InPopup>
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * A `ComboboxList` that renders only the rows in view, for long lists
 * (hundreds of options and up). Set `virtualized` and `items` on `Combobox`;
 * `children` renders one filtered item.
 */
function ComboboxVirtualList<Item>({
  children,
  estimateSize = 36,
  className,
}: {
  children: (item: Item, index: number) => React.ReactNode
  /** Row height before measuring; 36px rows (44px on touch) by default. */
  estimateSize?: number
  className?: string
}) {
  const items = ComboboxPrimitive.useFilteredItems<Item>()
  const scroller = React.useRef<HTMLDivElement | null>(null)
  const scrollTo = React.use(VirtualScroll)
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns non-memoizable functions by design
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scroller.current,
    estimateSize: () => estimateSize,
    overscan: 8,
  })
  return (
    <ComboboxList
      ref={(el: HTMLDivElement | null) => {
        scroller.current = el
        if (!scrollTo) return
        scrollTo.current = (index) => virtualizer.scrollToIndex(index)
        return () => {
          scrollTo.current = null
        }
      }}
      className={className}
    >
      {items.length > 0 && (
        <div
          role="presentation"
          className="relative w-full"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((row) => (
            <div
              key={row.key}
              ref={virtualizer.measureElement}
              data-index={row.index}
              role="presentation"
              className="absolute inset-x-0 top-0"
              style={{ transform: `translateY(${row.start}px)` }}
            >
              <VirtualRow value={{ index: row.index, size: items.length }}>
                {children(items[row.index], row.index)}
              </VirtualRow>
            </div>
          ))}
        </div>
      )}
    </ComboboxList>
  )
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  const virtual = React.use(VirtualRow)
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      index={virtual?.index}
      aria-setsize={virtual?.size}
      aria-posinset={virtual ? virtual.index + 1 : undefined}
      className={cn(
        "relative flex min-h-9 w-full cursor-default items-center gap-2 rounded-sm px-1.5 py-1 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground pointer-coarse:min-h-11 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {/* Content fills the row, so trailing metadata (`ms-auto`) ends at the
          row's padding; the check only takes space on the selected row. */}
      <span className="flex min-w-0 flex-1 items-center gap-2">{children}</span>
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none flex size-4 shrink-0 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn(className)}
      {...props}
    />
  )
}

function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return (
    <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
  )
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "hidden w-full justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/combobox-content:flex",
        className
      )}
      {...props}
    />
  )
}

function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        "flex min-h-control flex-wrap items-center gap-1 rounded-control border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-base transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--ds-focus-ring) has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1 sm:text-sm dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean
}) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "flex h-[calc(--spacing(5.25))] w-fit max-w-full min-w-0 items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
        className
      )}
      {...props}
    >
      {/* User-entered labels: one line, ellipsis, full text on hover. */}
      <span
        className="truncate"
        title={typeof children === "string" ? children : undefined}
      >
        {children}
      </span>
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          className="-ml-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
          aria-label="Remove"
        >
          <XIcon className="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  )
}

function ComboboxChipsInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn("min-w-16 flex-1 outline-none", className)}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxVirtualList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
