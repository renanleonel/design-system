"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "cn"
import { ArrowUpIcon, RotateCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Numbers align to the trailing edge (layout.md). */
    align?: "start" | "end"
    /** Hidden while the table is narrower than 42rem. */
    hideOnMobile?: boolean
    /** Skeleton bar width while loading, e.g. "w-24". */
    skeleton?: string
  }
}

export type CursorPage<T> = {
  items: T[]
  /** Opaque cursor for the next page; null on the last page. */
  nextCursor: string | null
  /** Total matches, when the API knows it cheaply. */
  total?: number
}

/**
 * Cursor pagination state with the same shape as TanStack Query's
 * `useInfiniteQuery` result, so `InfiniteTable` takes either. Reset it with a
 * `key` when the filters change. Already on TanStack Query? Use
 * `useInfiniteQuery({ queryKey, queryFn: ({ pageParam }) => fetchPage(pageParam),
 * initialPageParam: null, getNextPageParam: (p) => p.nextCursor })` instead.
 */
export function useCursorPages<T>(
  fetchPage: (cursor: string | null) => Promise<CursorPage<T>>
) {
  const [pages, setPages] = React.useState<CursorPage<T>[]>([])
  const [status, setStatus] = React.useState<"idle" | "fetching" | "error">(
    "idle"
  )
  // Guards double calls in the same tick (observer + click), before state lands.
  const inFlight = React.useRef(false)
  const last = pages.at(-1)
  const hasNextPage = !last || last.nextCursor !== null

  const fetchNextPage = React.useCallback(async () => {
    if (inFlight.current || !hasNextPage) return
    inFlight.current = true
    setStatus("fetching")
    try {
      const page = await fetchPage(last?.nextCursor ?? null)
      setPages((prev) => [...prev, page])
      setStatus("idle")
    } catch {
      setStatus("error")
    } finally {
      inFlight.current = false
    }
  }, [fetchPage, hasNextPage, last])

  return {
    data: { pages },
    rows: React.useMemo(() => pages.flatMap((p) => p.items), [pages]),
    total: last?.total,
    hasNextPage,
    isFetchingNextPage: status === "fetching",
    isPending: pages.length === 0 && status !== "error",
    isError: status === "error",
    fetchNextPage,
  }
}

type Noun = { one: string; other: string }
type Meta = ColumnDef<unknown>["meta"]
type Scroller = React.RefObject<HTMLDivElement | null>

const cellClass = (meta?: Meta) =>
  cn(
    meta?.align === "end" && "text-end tabular-nums",
    meta?.hideOnMobile && "hidden @2xl/table:table-cell"
  )

/**
 * Feeds grow without bound: render only the rows near the viewport, with
 * spacer rows standing in for the rest (keeps native table layout and the
 * pinned header).
 */
function useVirtualRows(scroller: Scroller, ids: string[]) {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns non-memoizable functions by design
  const virtualizer = useVirtualizer({
    count: ids.length,
    getScrollElement: () => scroller.current,
    estimateSize: () => ROW_HEIGHT,
    getItemKey: (i) => ids[i],
    overscan: 10,
    // Rows start under the pinned header.
    paddingStart: HEAD_HEIGHT,
    scrollPaddingStart: HEAD_HEIGHT,
  })
  const items = virtualizer.getVirtualItems()
  return {
    items,
    measure: virtualizer.measureElement,
    padTop: (items[0]?.start ?? HEAD_HEIGHT) - HEAD_HEIGHT,
    padBottom: virtualizer.getTotalSize() - (items.at(-1)?.end ?? HEAD_HEIGHT),
  }
}

/**
 * Watches the end of the list. A new callback (after each page, or a state
 * change) re-observes, and a fresh observer reports at once, so a page that
 * doesn't fill the screen loads the next one too. No effect needed: React 19
 * runs the returned cleanup when the ref changes.
 */
function useEndSentinel(
  scroller: Scroller,
  canLoad: boolean,
  count: number,
  fetchNextPage: () => unknown
) {
  return React.useCallback(
    (el: HTMLTableRowElement | null) => {
      if (!el || !canLoad) return
      // Nothing loaded yet: start now (the skeleton pushes this row out of view).
      if (count === 0) {
        fetchNextPage()
        return
      }
      const io = new IntersectionObserver(
        ([entry]) => entry.isIntersecting && fetchNextPage(),
        { root: scroller.current, rootMargin: "0px 0px 600px 0px" }
      )
      io.observe(el)
      return () => io.disconnect()
    },
    // count: re-observe after each page lands.
    [scroller, canLoad, fetchNextPage, count]
  )
}

/** The rows in the virtual window, with spacers standing in for the rest. */
function VirtualRows<TData>({
  rows,
  virtual,
  span,
}: {
  rows: Row<TData>[]
  virtual: ReturnType<typeof useVirtualRows>
  span: number
}) {
  return (
    <>
      {virtual.padTop > 0 && <Spacer height={virtual.padTop} span={span} />}
      {virtual.items.map((v) => {
        const row = rows[v.index]
        return (
          <tr
            key={row.id}
            ref={virtual.measure}
            data-index={v.index}
            aria-rowindex={v.index + 2}
            className="hover:bg-muted/50"
          >
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={cn(
                  CELL,
                  cellClass(cell.column.columnDef.meta as Meta)
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        )
      })}
      {virtual.padBottom > 0 && (
        <Spacer height={virtual.padBottom} span={span} />
      )}
    </>
  )
}

function SkeletonRows({ count, metas }: { count: number; metas: Meta[] }) {
  return Array.from({ length: count }, (_, i) => (
    <tr key={`skeleton-${i}`} aria-hidden>
      {metas.map((meta, j) => (
        <td
          // Placeholder cells, one per column, never reordered.
          // react-doctor-disable-next-line react-doctor/no-array-index-as-key
          key={j}
          className={cn(CELL, cellClass(meta))}
        >
          <Skeleton
            className={cn(
              "h-4",
              meta?.skeleton ?? "w-20",
              meta?.align === "end" && "ms-auto"
            )}
          />
        </td>
      ))}
    </tr>
  ))
}

/** The last row's copy: retry, loading, progress with Load more, or the end. */
function FeedStatus({
  count,
  total,
  hasNextPage,
  isFetchingNextPage,
  isError,
  fetchNextPage,
  noun,
}: {
  count: number
  total?: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isError: boolean
  fetchNextPage: () => unknown
  noun: Noun
}) {
  if (isError)
    return (
      <>
        <span>Couldn’t load more {noun.other}.</span>
        <Button variant="outline" size="sm" onClick={() => fetchNextPage()}>
          <RotateCwIcon data-icon="inline-start" />
          Retry
        </Button>
      </>
    )
  if (isFetchingNextPage)
    return <span className="sr-only">Loading more {noun.other}</span>
  if (hasNextPage)
    return (
      <>
        {total !== undefined && count > 0 && (
          <span className="tabular-nums">
            {count.toLocaleString("en-US")} of {total.toLocaleString("en-US")}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={() => fetchNextPage()}>
          Load more
        </Button>
      </>
    )
  if (count === 0) return null
  return (
    <span className="tabular-nums">
      That’s all{" "}
      {count === 1
        ? `1 ${noun.one}`
        : `${count.toLocaleString("en-US")} ${noun.other}`}
    </span>
  )
}

function BackToTop({ shown, scroller }: { shown: boolean; scroller: Scroller }) {
  return (
    <Button
      variant="outline"
      size="sm"
      inert={!shown}
      data-open={shown || undefined}
      onClick={() => {
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
        scroller.current?.scrollTo({
          top: 0,
          behavior: reduce ? "auto" : "smooth",
        })
      }}
      className="absolute top-12 left-1/2 z-20 -translate-x-1/2 -translate-y-2 rounded-full bg-popover opacity-0 shadow-popover transition-[opacity,translate] duration-150 ease-in data-open:translate-y-0 data-open:opacity-100 data-open:duration-200 data-open:ease-out motion-reduce:translate-y-0"
    >
      <ArrowUpIcon data-icon="inline-start" />
      Back to top
    </Button>
  )
}

/**
 * A table that loads the next page as you near the end (cursor pagination).
 * The header stays pinned; the next page starts loading 600px before the end,
 * so scrolling rarely waits. Loading, failure and the end each get a row, and a
 * "Load more" button stands in for scrolling (keyboard, screen readers). Give
 * it a height so it scrolls inside (`className="h-[600px]"`, or `flex-1 min-h-0`
 * inside `AppShellContent fill`).
 */
function InfiniteTable<TData>({
  columns,
  rows,
  getRowId,
  total,
  hasNextPage,
  isFetchingNextPage,
  isError,
  fetchNextPage,
  noun = { one: "item", other: "items" },
  empty,
  className,
}: {
  columns: ColumnDef<TData>[]
  rows: TData[]
  getRowId: (row: TData) => string
  total?: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isError: boolean
  fetchNextPage: () => unknown
  noun?: Noun
  /** Shown when the first page comes back empty. */
  empty?: React.ReactNode
  className?: string
}) {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions by design
  const table = useReactTable({
    data: rows,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
  })

  const scroller = React.useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = React.useState(false)
  const tableRows = table.getRowModel().rows
  const virtual = useVirtualRows(
    scroller,
    tableRows.map((r) => r.id)
  )
  const canLoad = hasNextPage && !isFetchingNextPage && !isError
  const sentinel = useEndSentinel(scroller, canLoad, rows.length, fetchNextPage)
  const span = columns.length
  const metas = columns.map((c) => c.meta as Meta)

  const firstLoad = rows.length === 0 && (hasNextPage || isFetchingNextPage)
  if (rows.length === 0 && !hasNextPage && !isError && empty)
    return <>{empty}</>

  return (
    <div
      data-slot="infinite-table"
      className={cn("@container/table relative min-h-80", className)}
    >
      <div
        ref={scroller}
        onScroll={(e) => {
          const past = e.currentTarget.scrollTop > 400
          if (past !== scrolled) setScrolled(past)
        }}
        className={cn(
          // relative: absolutely positioned bits (sr-only text) stay inside the clip.
          "relative h-full overscroll-contain rounded-lg bg-card shadow-border",
          // First load: skeleton rows fill any height, clipped, never scrollable.
          firstLoad ? "overflow-hidden" : "overflow-auto"
        )}
      >
        <table
          // Only the rows near the viewport are in the DOM; these keep the
          // real count and position available to screen readers.
          aria-rowcount={total !== undefined ? total + 1 : -1}
          className="w-full border-separate border-spacing-0 text-sm"
        >
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} aria-rowindex={1}>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      HEAD,
                      cellClass(header.column.columnDef.meta as Meta)
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody aria-busy={isFetchingNextPage || undefined}>
            <VirtualRows rows={tableRows} virtual={virtual} span={span} />
            {(firstLoad || isFetchingNextPage) && (
              <SkeletonRows count={firstLoad ? 40 : 3} metas={metas} />
            )}

            <tr ref={sentinel}>
              <td colSpan={span} className="h-14 px-3 text-center">
                {/* Announces progress; the visible copy matches. */}
                <div
                  role="status"
                  className="flex items-center justify-center gap-3 text-sm text-muted-foreground"
                >
                  <FeedStatus
                    count={rows.length}
                    total={total}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    isError={isError}
                    fetchNextPage={fetchNextPage}
                    noun={noun}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BackToTop shown={scrolled} scroller={scroller} />
    </div>
  )
}

/** Matches `h-10` on the header and `h-11` on rows; rows are also measured. */
const HEAD_HEIGHT = 40
const ROW_HEIGHT = 44

function Spacer({ height, span }: { height: number; span: number }) {
  return (
    <tr aria-hidden>
      <td colSpan={span} style={{ height }} className="p-0" />
    </tr>
  )
}

const HEAD =
  "sticky top-0 z-10 h-10 bg-card bg-clip-padding px-3 text-start align-middle text-xs font-medium whitespace-nowrap text-muted-foreground shadow-[inset_0_-1px_var(--border)]"
const CELL = "h-11 px-3 align-middle whitespace-nowrap border-b"

export { InfiniteTable }
