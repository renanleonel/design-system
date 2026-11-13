"use client"

import * as React from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "cn"

/**
 * A scrolling list that renders only the items in view, for feeds, logs and
 * any list that can grow past ~100 items. Items may differ in height; each is
 * measured once rendered. Give it a height (`max-h-96` default, or `h-full`
 * inside a sized parent). `onEndReached` fires as the end comes within
 * `endThreshold` items, for loading the next page; it can fire more than once,
 * so guard requests already in flight (`useCursorPages` does).
 */
function VirtualList<T>({
  items,
  getKey,
  renderItem,
  estimateSize = 56,
  gap = 0,
  overscan = 6,
  onEndReached,
  endThreshold = 10,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: {
  items: readonly T[]
  getKey: (item: T, index: number) => string | number
  renderItem: (item: T, index: number) => React.ReactNode
  /** Typical item height in px, used before an item is measured. */
  estimateSize?: number
  /** Space between items in px. */
  gap?: number
  overscan?: number
  onEndReached?: () => void
  endThreshold?: number
  className?: string
  "aria-label"?: string
  "aria-labelledby"?: string
}) {
  const scroller = React.useRef<HTMLDivElement>(null)
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns non-memoizable functions by design
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scroller.current,
    estimateSize: () => estimateSize,
    getItemKey: (i) => getKey(items[i], i),
    gap,
    overscan,
    initialRect: { width: 0, height: 384 },
    onChange: (instance) => {
      const last = instance.range?.endIndex ?? 0
      if (onEndReached && items.length && last >= items.length - endThreshold)
        onEndReached()
    },
  })

  return (
    <div
      ref={scroller}
      // Scrollable regions must be reachable by keyboard (WCAG 2.1.1).
      tabIndex={0}
      role="region"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      data-slot="virtual-list"
      className={cn(
        "relative max-h-96 overflow-y-auto overscroll-contain rounded-lg focus-ring-inset",
        className
      )}
    >
      <div
        role="list"
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((v) => (
          <div
            key={v.key}
            ref={virtualizer.measureElement}
            data-index={v.index}
            role="listitem"
            aria-setsize={items.length}
            aria-posinset={v.index + 1}
            className="absolute inset-x-0 top-0"
            style={{ transform: `translateY(${v.start}px)` }}
          >
            {renderItem(items[v.index], v.index)}
          </div>
        ))}
      </div>
    </div>
  )
}

export { VirtualList }
