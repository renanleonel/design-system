"use client"

import * as React from "react"
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "cn"
import { ArrowDownIcon, ArrowUpIcon, CheckIcon } from "lucide-react"

import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu"
import { IconTile } from "@/components/ui/icon-tile"
import { InlineEdit } from "@/components/ui/inline-edit"

import {
  describe,
  formatBytes,
  formatDate,
  type FileEntry,
  type SortDir,
  type SortKey,
} from "./file-utils"

const GRID_MIN = 140
const GRID_GAP = 8
const GRID_ROW = 132
const LIST_ROW = 52

export type ListKey =
  | { type: "move"; to: number; extend: boolean; keepSelection: boolean }
  | { type: "toggle" }
  | { type: "all" }
  | { type: "clear" }
  | { type: "open" }
  | { type: "rename" }
  | { type: "delete" }
  | { type: "parent" }

function useWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = React.useState(0)
  // Layout effect: the first measurement lands before paint, so the grid never
  // shows a guessed column count and then reflows (a layout shift).
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth)
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width)
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
  return width
}

/**
 * The folder's contents as a virtualized listbox, in a grid or a list. Rows
 * are measured by formula (fixed heights), so 5,000 files cost the same as 50.
 * The active item is a mounted `aria-activedescendant`; right click or long
 * press opens `menu` for it.
 */
export function FileList({
  items,
  view,
  baseId,
  selected,
  activeId,
  renamingId,
  childCount,
  sort,
  dir,
  onSort,
  onItemClick,
  onItemOpen,
  onContextItem,
  onKey,
  onRenamed,
  onRenameCancel,
  validateName,
  menu,
  label,
}: {
  items: FileEntry[]
  view: "grid" | "list"
  baseId: string
  selected: ReadonlySet<string>
  activeId: string | null
  renamingId: string | null
  childCount: (id: string) => number
  sort: SortKey
  dir: SortDir
  onSort: (key: SortKey) => void
  onItemClick: (entry: FileEntry, e: React.MouseEvent) => void
  onItemOpen: (entry: FileEntry) => void
  /** Right click / long press / the menu key, with the item under it (if any). */
  onContextItem: (entry: FileEntry | null) => void
  onKey: (key: ListKey) => void
  onRenamed: (entry: FileEntry, name: string) => void | Promise<void>
  onRenameCancel: () => void
  validateName: (entry: FileEntry, name: string) => string | undefined
  menu: React.ReactNode
  label: string
}) {
  const scroller = React.useRef<HTMLDivElement>(null)
  const width = useWidth(scroller)
  const grid = view === "grid"
  const cols = grid
    ? Math.max(1, Math.floor((width + GRID_GAP) / (GRID_MIN + GRID_GAP)) || 4)
    : 1
  const rowCount = Math.ceil(items.length / cols)
  const rowSize = grid ? GRID_ROW : LIST_ROW
  const indexById = React.useMemo(
    () => new Map(items.map((e, i) => [e.id, i])),
    [items]
  )
  const activeIndex = activeId ? (indexById.get(activeId) ?? -1) : -1
  const activeRow = activeIndex < 0 ? -1 : Math.floor(activeIndex / cols)

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns non-memoizable functions by design
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scroller.current,
    estimateSize: () => rowSize,
    overscan: 4,
    initialRect: { width: 0, height: 600 },
    // The active row stays mounted so `aria-activedescendant` resolves.
    rangeExtractor: (range) => {
      const rows = defaultRangeExtractor(range)
      return activeRow >= 0 && !rows.includes(activeRow)
        ? [...rows, activeRow].sort((a, b) => a - b)
        : rows
    },
  })

  // After a rename the keyboard returns to the list.
  const focusList = () =>
    requestAnimationFrame(() =>
      scroller.current?.focus({ preventScroll: true })
    )

  // Set when the menu key or Shift+F10 asks for the menu, so the native
  // `contextmenu` event that follows reads as "the active item", not a click.
  const keyMenuAt = React.useRef(0)
  const openMenuAtActive = () => {
    const el = activeId
      ? scroller.current?.querySelector<HTMLElement>(
          `[data-entry-id="${CSS.escape(activeId)}"]`
        )
      : null
    keyMenuAt.current = performance.now()
    const r = (el ?? scroller.current)?.getBoundingClientRect()
    ;(el ?? scroller.current)?.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: r ? r.left + r.width / 2 : 0,
        clientY: r ? r.top + r.height / 2 : 0,
      })
    )
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Typing in the rename field is not ours.
    if (e.target !== e.currentTarget) return
    if (e.key === "ContextMenu" || (e.key === "F10" && e.shiftKey)) {
      e.preventDefault()
      return openMenuAtActive()
    }
    const mod = e.ctrlKey || e.metaKey
    const n = items.length
    const move = (to: number) => {
      e.preventDefault()
      const clamped = Math.max(0, Math.min(n - 1, to))
      onKey({
        type: "move",
        to: clamped,
        extend: e.shiftKey,
        keepSelection: mod,
      })
      virtualizer.scrollToIndex(Math.floor(clamped / cols), { align: "auto" })
    }
    const cur = Math.max(0, activeIndex)
    // Arrows follow the screen: in a grid, RTL puts the next item on the left.
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl"
    const key =
      rtl && (e.key === "ArrowLeft" || e.key === "ArrowRight")
        ? e.key === "ArrowLeft"
          ? "ArrowRight"
          : "ArrowLeft"
        : e.key
    switch (key) {
      case "ArrowDown":
        return n ? move(cur + cols) : undefined
      case "ArrowUp":
        if (e.altKey) {
          e.preventDefault()
          return onKey({ type: "parent" })
        }
        return n ? move(cur - cols) : undefined
      case "ArrowRight":
        if (grid && n) return move(cur + 1)
        return
      case "ArrowLeft":
        if (grid && n) return move(cur - 1)
        return
      case "Home":
        return n ? move(0) : undefined
      case "End":
        return n ? move(n - 1) : undefined
      case "PageDown":
        return n ? move(cur + cols * 8) : undefined
      case "PageUp":
        return n ? move(cur - cols * 8) : undefined
      case " ":
        e.preventDefault()
        return onKey({ type: "toggle" })
      case "Enter":
        e.preventDefault()
        return onKey({ type: "open" })
      case "F2":
        e.preventDefault()
        return onKey({ type: "rename" })
      case "Delete":
        e.preventDefault()
        return onKey({ type: "delete" })
      case "Backspace":
        e.preventDefault()
        return onKey({ type: "parent" })
      case "Escape":
        return onKey({ type: "clear" })
      case "a":
      case "A":
        if (mod) {
          e.preventDefault()
          return onKey({ type: "all" })
        }
    }
  }

  return (
    <div className="@container/list flex min-h-0 flex-1 flex-col">
      {!grid && <SortHeader sort={sort} dir={dir} onSort={onSort} />}
      <ContextMenu
        onOpenChange={(open) => {
          // Keep the keyboard where it was, unless a rename took the focus.
          if (!open)
            requestAnimationFrame(() => {
              const at = document.activeElement
              if (!at || at === document.body || at.closest("[role=menu]"))
                scroller.current?.focus({ preventScroll: true })
            })
        }}
      >
        <ContextMenuTrigger
          ref={scroller}
          role="listbox"
          aria-label={label}
          aria-multiselectable
          aria-orientation={grid ? undefined : "vertical"}
          aria-activedescendant={activeId ? `${baseId}-${activeId}` : undefined}
          tabIndex={items.length ? 0 : -1}
          onKeyDown={onKeyDown}
          onContextMenu={(e) => {
            const el = (e.target as HTMLElement).closest<HTMLElement>(
              "[data-entry-id]"
            )
            const keyboard = performance.now() - keyMenuAt.current < 1000
            const id =
              el?.dataset.entryId ??
              (keyboard || e.button === 0 ? activeId : null)
            onContextItem(id ? (items[indexById.get(id) ?? -1] ?? null) : null)
          }}
          className={cn(
            "group/list relative min-h-0 flex-1 [scrollbar-gutter:stable] overflow-y-auto overscroll-contain outline-none",
            grid ? "px-3" : "px-2"
          )}
        >
          <div
            // Until the width is known (server HTML) the grid's column count
            // is a guess: keep it invisible so the real layout doesn't shift it.
            className={cn(
              "relative w-full",
              grid && width === 0 && "invisible"
            )}
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((row) => {
              const slice = items.slice(
                row.index * cols,
                (row.index + 1) * cols
              )
              return (
                <div
                  key={row.key}
                  role="presentation"
                  className="absolute inset-x-0 top-0 grid"
                  style={{
                    height: rowSize,
                    transform: `translateY(${row.start}px)`,
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    columnGap: GRID_GAP,
                    paddingBlock: grid ? GRID_GAP / 2 : 2,
                  }}
                >
                  {slice.map((entry, c) => {
                    const index = row.index * cols + c
                    const props = {
                      entry,
                      id: `${baseId}-${entry.id}`,
                      index,
                      total: items.length,
                      selected: selected.has(entry.id),
                      active: entry.id === activeId,
                      count: entry.type === "folder" ? childCount(entry.id) : 0,
                      onClick: (e: React.MouseEvent) => onItemClick(entry, e),
                      onDoubleClick: () => onItemOpen(entry),
                      name:
                        renamingId === entry.id ? (
                          <RenameField
                            entry={entry}
                            onRenamed={async (e, name) => {
                              await onRenamed(e, name)
                              focusList()
                            }}
                            onCancel={() => {
                              onRenameCancel()
                              focusList()
                            }}
                            validate={validateName}
                          />
                        ) : undefined,
                    }
                    return grid ? (
                      <GridItem key={entry.id} {...props} />
                    ) : (
                      <ListItem key={entry.id} {...props} />
                    )
                  })}
                </div>
              )
            })}
          </div>
          {menu}
        </ContextMenuTrigger>
      </ContextMenu>
    </div>
  )
}

function SortButton({
  sortKey,
  text,
  className,
  sort,
  dir,
  onSort,
}: {
  sortKey: SortKey
  text: string
  className?: string
  sort: SortKey
  dir: SortDir
  onSort: (key: SortKey) => void
}) {
  const active = sort === sortKey
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      aria-label={`Sort by ${text}${active ? `, ${dir === "asc" ? "ascending" : "descending"}` : ""}`}
      className={cn(
        "inline-flex min-w-0 items-center gap-1 rounded-sm text-start focus-ring hover:text-foreground",
        active && "text-foreground",
        className
      )}
    >
      <span className="truncate">{text}</span>
      {active &&
        (dir === "asc" ? (
          <ArrowUpIcon aria-hidden className="size-3 shrink-0" />
        ) : (
          <ArrowDownIcon aria-hidden className="size-3 shrink-0" />
        ))}
    </button>
  )
}

function SortHeader(props: {
  sort: SortKey
  dir: SortDir
  onSort: (key: SortKey) => void
}) {
  return (
    <div
      aria-label="Sort by"
      role="group"
      className="hidden [scrollbar-gutter:stable] grid-cols-[minmax(0,1fr)_8rem_6rem] gap-3 border-b px-4 py-2 text-xs font-medium text-muted-foreground @md/list:grid"
    >
      <SortButton sortKey="name" text="Name" {...props} />
      <SortButton sortKey="modified" text="Modified" {...props} />
      <SortButton
        sortKey="size"
        text="Size"
        className="justify-end"
        {...props}
      />
    </div>
  )
}

function RenameField({
  entry,
  onRenamed,
  onCancel,
  validate,
}: {
  entry: FileEntry
  onCancel: () => void
  onRenamed: (entry: FileEntry, name: string) => void | Promise<void>
  validate: (entry: FileEntry, name: string) => string | undefined
}) {
  const started = React.useRef(false)
  return (
    <div
      className="min-w-0"
      // Opens the editor once, as the field appears.
      ref={(el) => {
        if (el && !started.current) {
          started.current = true
          el.querySelector<HTMLButtonElement>(
            "[data-slot=inline-edit-trigger]"
          )?.click()
        }
      }}
      onKeyDownCapture={(e) => {
        if (e.key === "Escape") onCancel()
      }}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <InlineEdit
        value={entry.name}
        label={`Name of ${entry.name}`}
        onSubmit={(name) => onRenamed(entry, name)}
        validate={(name) => validate(entry, name)}
        inputClassName="text-sm"
      />
    </div>
  )
}

type ItemProps = {
  entry: FileEntry
  id: string
  index: number
  total: number
  selected: boolean
  active: boolean
  count: number
  onClick: (e: React.MouseEvent) => void
  onDoubleClick: () => void
  /** The rename field, while this item is being renamed. */
  name?: React.ReactNode
}

const itemBase =
  "group/item relative cursor-default rounded-lg text-sm select-none hover:bg-muted aria-selected:bg-primary/10 aria-selected:hover:bg-primary/15 group-focus-visible/list:data-active:outline-2 group-focus-visible/list:data-active:-outline-offset-2 group-focus-visible/list:data-active:outline-(--ds-focus-ring)"

function meta(entry: FileEntry, count: number) {
  return entry.type === "folder"
    ? `${count} ${count === 1 ? "item" : "items"}`
    : formatBytes(entry.size ?? 0)
}

function GridItem({
  entry,
  id,
  index,
  total,
  selected,
  active,
  count,
  onClick,
  onDoubleClick,
  name,
}: ItemProps) {
  const { icon, tone } = describe(entry)
  return (
    <div
      id={id}
      role="option"
      aria-selected={selected}
      aria-setsize={total}
      aria-posinset={index + 1}
      data-entry-id={entry.id}
      data-active={active || undefined}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        itemBase,
        "flex min-w-0 flex-col items-center gap-1.5 px-2 pt-3 pb-2 text-center"
      )}
    >
      <span
        aria-hidden
        className="absolute start-1.5 top-1.5 hidden size-4 items-center justify-center rounded-full bg-primary text-primary-foreground group-aria-selected/item:flex"
      >
        <CheckIcon className="size-3" />
      </span>
      <IconTile
        size="lg"
        tone={tone}
        className="size-12 rounded-xl [&_svg:not([class*='size-'])]:size-6"
      >
        {icon}
      </IconTile>
      {name ?? (
        <span
          title={entry.name}
          className="line-clamp-2 w-full leading-snug wrap-anywhere"
        >
          {entry.name}
        </span>
      )}
      <span className="text-xs text-muted-foreground tabular-nums group-hover/item:text-foreground/75 group-aria-selected/item:text-foreground/75">
        {meta(entry, count)}
      </span>
    </div>
  )
}

function ListItem({
  entry,
  id,
  index,
  total,
  selected,
  active,
  count,
  onClick,
  onDoubleClick,
  name,
}: ItemProps) {
  const { icon, tone } = describe(entry)
  return (
    <div
      id={id}
      role="option"
      aria-selected={selected}
      aria-setsize={total}
      aria-posinset={index + 1}
      data-entry-id={entry.id}
      data-active={active || undefined}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        itemBase,
        "grid h-full grid-cols-[minmax(0,1fr)] items-center gap-3 px-2 @md/list:grid-cols-[minmax(0,1fr)_8rem_6rem]"
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="relative shrink-0">
          <IconTile size="md" tone={tone}>
            {icon}
          </IconTile>
          <span
            aria-hidden
            className="absolute -start-1 -top-1 hidden size-4 items-center justify-center rounded-full bg-primary text-primary-foreground group-aria-selected/item:flex"
          >
            <CheckIcon className="size-3" />
          </span>
        </span>
        <span className="min-w-0 flex-1">
          {name ?? (
            <span title={entry.name} className="block truncate">
              {entry.name}
            </span>
          )}
          <span className="block truncate text-xs text-muted-foreground tabular-nums group-hover/item:text-foreground/75 group-aria-selected/item:text-foreground/75 @md/list:hidden">
            {meta(entry, count)} · {formatDate(entry.modified)}
          </span>
        </span>
      </span>
      <span className="hidden truncate text-muted-foreground tabular-nums group-hover/item:text-foreground/75 group-aria-selected/item:text-foreground/75 @md/list:block">
        {formatDate(entry.modified)}
      </span>
      <span className="hidden truncate text-end text-muted-foreground tabular-nums group-hover/item:text-foreground/75 group-aria-selected/item:text-foreground/75 @md/list:block">
        {entry.type === "folder"
          ? meta(entry, count)
          : formatBytes(entry.size ?? 0)}
      </span>
    </div>
  )
}
