"use client"

import * as React from "react"
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "cn"
import { CheckIcon, ChevronRightIcon } from "lucide-react"

export type TreeNode = {
  /** Unique across the whole tree. */
  id: string
  label: string
  icon?: React.ReactNode
  children?: TreeNode[]
  /** Focusable but not selectable. */
  disabled?: boolean
}

type Row = {
  node: TreeNode
  depth: number
  parentId: string | null
  /** Children shown under this row (all of them, or the filter's matches). */
  kids: TreeNode[]
  open: boolean
  setSize: number
  pos: number
}

/** Matches the 36px row (44px on touch); rows are measured after mount. */
const ROW_HEIGHT = 36
const TYPEAHEAD_MS = 500

type SingleProps = {
  multiple?: false
  /** Selected node id. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (id: string, node: TreeNode) => void
}
type MultipleProps = {
  /** Checkbox rows; each node toggles on its own. */
  multiple: true
  /** Selected node ids. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (ids: string[], node: TreeNode) => void
}

/**
 * A file-explorer style tree (WAI-ARIA tree pattern). Only the rows in view
 * render, so it stays fast at tens of thousands of nodes. Focus stays on the
 * tree and moves with `aria-activedescendant`: arrows move and open/close,
 * Home/End jump, Enter/Space select, `*` opens siblings, typing jumps to a
 * label. Pointer: the chevron opens and closes without selecting; the rest of
 * the row selects (double-click also opens a folder). The highlight covers
 * only the icon and label, from the row's indent. `multiple` turns rows into
 * checkboxes. `filter` shows matches with their ancestors (debounce it, see
 * `useDebouncedState`). Give it a height; it scrolls inside (`max-h-96`
 * default).
 */
function Tree({
  nodes,
  expanded,
  defaultExpanded = [],
  onExpandedChange,
  filter = "",
  empty = "No matches.",
  className,
  ref,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...selection
}: (SingleProps | MultipleProps) & {
  nodes: TreeNode[]
  /** Open node ids. */
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (ids: string[]) => void
  /** Shows nodes whose label contains this text, with their ancestors open. */
  filter?: string
  /** Shown when `filter` matches nothing. */
  empty?: React.ReactNode
  className?: string
  /** The scrolling `role="tree"` element, e.g. to focus it. */
  ref?: React.Ref<HTMLDivElement>
  "aria-label"?: string
  "aria-labelledby"?: string
}) {
  const baseId = React.useId()
  const multiple = selection.multiple === true
  const [selectedState, setSelectedState] = React.useState<string[]>(() =>
    toIds(selection.defaultValue)
  )
  const selectedIds =
    selection.value !== undefined ? toIds(selection.value) : selectedState
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds])
  const [expandedState, setExpandedState] = React.useState(defaultExpanded)
  const openIds = expanded ?? expandedState
  const openSet = React.useMemo(() => new Set(openIds), [openIds])

  const setOpen = (ids: Set<string>) => {
    const next = [...ids]
    setExpandedState(next)
    onExpandedChange?.(next)
  }

  // Filtering: matches plus every ancestor, all shown open.
  const query = filter.trim().toLowerCase()
  const included = React.useMemo(() => {
    if (!query) return null
    const keep = new Set<string>()
    const walk = (list: TreeNode[]): boolean => {
      let any = false
      for (const node of list) {
        const childHit = node.children ? walk(node.children) : false
        if (childHit || node.label.toLowerCase().includes(query)) {
          keep.add(node.id)
          any = true
        }
      }
      return any
    }
    walk(nodes)
    return keep
  }, [nodes, query])

  const rows = React.useMemo(() => {
    const out: Row[] = []
    const kidsOf = (node: TreeNode) =>
      included
        ? (node.children ?? []).filter((c) => included.has(c.id))
        : (node.children ?? [])
    const walk = (list: TreeNode[], depth: number, parentId: string | null) => {
      list.forEach((node, i) => {
        const kids = kidsOf(node)
        const open = kids.length > 0 && (included ? true : openSet.has(node.id))
        out.push({
          node,
          depth,
          parentId,
          kids,
          open,
          setSize: list.length,
          pos: i + 1,
        })
        if (open) walk(kids, depth + 1, node.id)
      })
    }
    walk(included ? nodes.filter((n) => included.has(n.id)) : nodes, 1, null)
    return out
  }, [nodes, included, openSet])

  const indexOf = React.useMemo(
    () => new Map(rows.map((r, i) => [r.node.id, i])),
    [rows]
  )

  const [activeId, setActiveId] = React.useState<string | null>(null)
  // The active row falls back to the selection, then the first row.
  const activeIndex =
    indexOf.get(activeId ?? "") ?? indexOf.get(selectedIds[0] ?? "") ?? 0
  const active = rows[activeIndex]

  const scroller = React.useRef<HTMLDivElement>(null)
  const setScroller = (el: HTMLDivElement | null) => {
    scroller.current = el
    if (typeof ref === "function") ref(el)
    else if (ref) ref.current = el
  }
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns non-memoizable functions by design
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scroller.current,
    estimateSize: () => ROW_HEIGHT,
    getItemKey: (i) => rows[i].node.id,
    overscan: 10,
    // The active row stays mounted so aria-activedescendant always resolves.
    rangeExtractor: (range) => {
      const indexes = defaultRangeExtractor(range)
      return indexes.includes(activeIndex)
        ? indexes
        : [...indexes, activeIndex].sort((a, b) => a - b)
    },
    initialRect: { width: 0, height: 384 },
  })

  const rowId = (id: string) => `${baseId}-${encodeURIComponent(id)}`

  const moveTo = (index: number) => {
    const row = rows[Math.max(0, Math.min(rows.length - 1, index))]
    if (!row) return
    setActiveId(row.node.id)
    virtualizer.scrollToIndex(indexOf.get(row.node.id)!)
  }

  const select = (row: Row) => {
    const { node } = row
    if (node.disabled) return
    if (selection.multiple) {
      const next = selectedSet.has(node.id)
        ? selectedIds.filter((id) => id !== node.id)
        : [...selectedIds, node.id]
      setSelectedState(next)
      selection.onValueChange?.(next, node)
    } else {
      setSelectedState([node.id])
      selection.onValueChange?.(node.id, node)
    }
  }

  const toggle = (row: Row, open = !row.open) => {
    if (row.kids.length === 0 || included) return
    const next = new Set(openSet)
    if (open) next.add(row.node.id)
    else next.delete(row.node.id)
    setOpen(next)
  }

  const typeahead = React.useRef({ text: "", at: 0 })
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!active) return
    switch (e.key) {
      case "ArrowDown":
        moveTo(activeIndex + 1)
        break
      case "ArrowUp":
        moveTo(activeIndex - 1)
        break
      case "Home":
        moveTo(0)
        break
      case "End":
        moveTo(rows.length - 1)
        break
      case "ArrowRight":
      case "ArrowLeft": {
        const rtl = getComputedStyle(e.currentTarget).direction === "rtl"
        const inward = (e.key === "ArrowRight") !== rtl
        if (inward) {
          if (active.kids.length && !active.open) toggle(active, true)
          else if (active.open) moveTo(activeIndex + 1)
        } else if (active.open && !included) toggle(active, false)
        else if (active.parentId) moveTo(indexOf.get(active.parentId)!)
        break
      }
      case "Enter":
      case " ":
        select(active)
        break
      case "*": {
        if (included) break
        const next = new Set(openSet)
        for (const r of rows)
          if (r.parentId === active.parentId && r.kids.length)
            next.add(r.node.id)
        setOpen(next)
        break
      }
      default: {
        if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return
        const t = typeahead.current
        t.text = e.timeStamp - t.at > TYPEAHEAD_MS ? e.key : t.text + e.key
        t.at = e.timeStamp
        const needle = t.text.toLowerCase()
        // A repeated single letter cycles; a longer word refines in place.
        const start = t.text.length === 1 ? activeIndex + 1 : activeIndex
        for (let i = 0; i < rows.length; i++) {
          const r = rows[(start + i) % rows.length]
          if (r.node.label.toLowerCase().startsWith(needle)) {
            moveTo((start + i) % rows.length)
            break
          }
        }
        break
      }
    }
    e.preventDefault()
  }

  if (rows.length === 0)
    return (
      <div
        role="status"
        className={cn(
          "flex min-h-24 items-center justify-center text-sm text-muted-foreground",
          className
        )}
      >
        {empty}
      </div>
    )

  return (
    <div
      ref={setScroller}
      role="tree"
      tabIndex={0}
      aria-multiselectable={multiple || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-activedescendant={active ? rowId(active.node.id) : undefined}
      onKeyDown={onKeyDown}
      data-slot="tree"
      className={cn(
        "group/tree relative max-h-96 overflow-y-auto overscroll-contain rounded-lg outline-none select-none",
        className
      )}
    >
      <div
        role="none"
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((v) => {
          const row = rows[v.index]
          const { node } = row
          const isSelected = selectedSet.has(node.id)
          return (
            <div
              key={v.key}
              ref={virtualizer.measureElement}
              data-index={v.index}
              id={rowId(node.id)}
              role="treeitem"
              aria-level={row.depth}
              aria-setsize={row.setSize}
              aria-posinset={row.pos}
              aria-expanded={row.kids.length ? row.open : undefined}
              aria-selected={isSelected}
              aria-disabled={node.disabled || undefined}
              data-active={v.index === activeIndex || undefined}
              data-selected={isSelected || undefined}
              data-disabled={node.disabled || undefined}
              onClick={() => {
                setActiveId(node.id)
                select(row)
              }}
              onDoubleClick={() => {
                if (!multiple) toggle(row)
              }}
              style={
                {
                  transform: `translateY(${v.start}px)`,
                  "--depth": row.depth - 1,
                } as React.CSSProperties
              }
              className={cn(
                "group/row absolute inset-x-0 top-0 flex h-9 cursor-default items-center gap-0.5 ps-[calc(var(--depth)*--spacing(4)+--spacing(1))] pe-1 text-sm pointer-coarse:h-11",
                "data-disabled:opacity-50",
                "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              )}
            >
              {row.kids.length ? (
                // Opens and closes only, never selects. Not a button: focus
                // stays on the tree (aria-activedescendant).
                <span
                  aria-hidden
                  data-slot="tree-toggle"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveId(node.id)
                    toggle(row)
                  }}
                  onDoubleClick={(e) => e.stopPropagation()}
                  className="flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground pointer-coarse:size-9"
                >
                  <ChevronRightIcon
                    className={cn(
                      "transition-transform duration-150 ease-out motion-reduce:transition-none rtl:-scale-x-100",
                      row.open && "rotate-90 rtl:-rotate-90"
                    )}
                  />
                </span>
              ) : (
                <span
                  aria-hidden
                  className="size-6 shrink-0 pointer-coarse:size-9"
                />
              )}
              <span
                data-slot="tree-label"
                className={cn(
                  "flex h-7 max-w-full min-w-0 items-center gap-1.5 rounded-md px-1.5 transition-colors group-hover/row:bg-muted/60 pointer-coarse:h-9",
                  !multiple &&
                    "group-data-selected/row:bg-accent group-data-selected/row:text-accent-foreground",
                  "group-focus-visible/tree:group-data-active/row:outline-2 group-focus-visible/tree:group-data-active/row:-outline-offset-2 group-focus-visible/tree:group-data-active/row:outline-(--ds-focus-ring)"
                )}
              >
                {multiple && (
                  <span
                    aria-hidden
                    data-slot="tree-checkbox"
                    className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input text-primary-foreground transition-colors group-data-selected/row:border-primary group-data-selected/row:bg-primary dark:bg-input/30 dark:group-data-selected/row:bg-primary"
                  >
                    <CheckIcon className="size-3.5! opacity-0 group-data-selected/row:opacity-100" />
                  </span>
                )}
                {node.icon && (
                  <span aria-hidden className="flex text-muted-foreground">
                    {node.icon}
                  </span>
                )}
                <span className="truncate" title={node.label}>
                  <Highlight text={node.label} query={query} />
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Highlight({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLowerCase().indexOf(query) : -1
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-transparent font-semibold text-current">
        {text.slice(at, at + query.length)}
      </mark>
      {text.slice(at + query.length)}
    </>
  )
}

const toIds = (v: string | string[] | null | undefined) =>
  v == null ? [] : Array.isArray(v) ? v : [v]

/** Every node by id, e.g. to show the labels of selected ids. */
function indexTree(nodes: TreeNode[]) {
  const map = new Map<string, TreeNode>()
  const walk = (list: TreeNode[]) => {
    for (const node of list) {
      map.set(node.id, node)
      if (node.children) walk(node.children)
    }
  }
  walk(nodes)
  return map
}

export { Tree, indexTree }
