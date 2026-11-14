"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type Header,
  type Row,
  type SortingState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "cn"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { setSearchParams, useSearchParams } from "@/hooks/use-url-state"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Label for the sort button, the footer menu and screen readers. */
    label?: string
    /** Numbers align to the trailing edge (layout.md). */
    align?: "start" | "end"
    /** Numeric columns get sum, average, min and max in the footer. */
    numeric?: boolean
    /** Formats footer results of a numeric column (e.g. currency). */
    format?: (value: number) => string
  }
}

export type GroupOption = {
  /** Column id to group by; also the `?group=` value. */
  id: string
  label: string
  /** Group order. Values not listed follow, alphabetically. */
  order?: string[]
  /** The group band's label (e.g. a Badge). Defaults to the value. */
  render?: (value: string) => React.ReactNode
}

type Calc = "count" | "empty" | "unique" | "sum" | "avg" | "min" | "max"

const CALCS: { value: Calc; label: string; numeric?: boolean }[] = [
  { value: "count", label: "Count values" },
  { value: "empty", label: "Count empty" },
  { value: "unique", label: "Count unique" },
  { value: "sum", label: "Sum", numeric: true },
  { value: "avg", label: "Average", numeric: true },
  { value: "min", label: "Min", numeric: true },
  { value: "max", label: "Max", numeric: true },
]

const isEmpty = (v: unknown) =>
  v == null || v === "" || (Array.isArray(v) && v.length === 0)

function calculate(values: unknown[], calc: Calc) {
  const nums = values.filter((v): v is number => typeof v === "number")
  switch (calc) {
    case "count":
      return values.filter((v) => !isEmpty(v)).length
    case "empty":
      return values.filter(isEmpty).length
    case "unique":
      return new Set(values.filter((v) => !isEmpty(v)).map(String)).size
    case "sum":
      return nums.reduce((a, b) => a + b, 0)
    case "avg":
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
    case "min":
      return nums.length ? Math.min(...nums) : 0
    case "max":
      return nums.length ? Math.max(...nums) : 0
  }
}

type Noun = { one: string; other: string }

const ARIA_SORT = { asc: "ascending", desc: "descending" } as const

function sortingFrom(sortParam: string): SortingState {
  return sortParam
    ? [{ id: sortParam.replace(/^-/, ""), desc: sortParam.startsWith("-") }]
    : []
}

/** Rows split by the grouping column, in the group's order, then alphabetically. */
function groupRows<TData>(rows: Row<TData>[], group: GroupOption | undefined) {
  if (!group) return [{ value: "", rows }]
  const map = new Map<string, Row<TData>[]>()
  for (const row of rows) {
    const value = String(row.getValue(group.id) ?? "")
    map.set(value, [...(map.get(value) ?? []), row])
  }
  const order = group.order ?? []
  const rank = (v: string) =>
    order.includes(v) ? order.indexOf(v) : order.length
  return [...map.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([value, rows]) => ({ value, rows }))
}

/**
 * Bands and rows flattened into one virtual list: only what's near the
 * viewport renders, so thousands of rows scroll like dozens.
 */
function flatten<TData>(
  groups: { value: string; rows: Row<TData>[] }[],
  group: GroupOption | undefined,
  collapsed: Set<string>
) {
  const entries: Entry<TData>[] = []
  const spans: GroupSpan<TData>[] = []
  let number = 0
  for (const { value, rows } of groups) {
    const open = !group || !collapsed.has(`${group.id}:${value}`)
    const a = entries.length
    if (group) entries.push({ kind: "band", index: a })
    if (open)
      for (const row of rows)
        entries.push({ kind: "row", index: entries.length, row, number: ++number })
    else number += rows.length
    spans.push({ value, rows, open, a, b: entries.length - 1 })
  }
  return { entries, spans }
}

/** The virtualizer plus what the groups need to place themselves in its window. */
function useGroupWindow<TData>(
  entries: Entry<TData>[],
  spans: GroupSpan<TData>[]
) {
  const scroller = React.useRef<HTMLDivElement>(null)
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns non-memoizable functions by design
  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => scroller.current,
    estimateSize: (i) => (entries[i].kind === "band" ? BAND_HEIGHT : ROW_HEIGHT),
    overscan: 12,
    paddingStart: HEAD_HEIGHT,
    // Keyboard focus never lands under the pinned header and band.
    scrollPaddingStart: HEAD_HEIGHT + BAND_HEIGHT,
    // Server render and first paint show the top rows instead of nothing.
    initialRect: { width: 0, height: 800 },
  })
  const range = virtualizer.getVirtualItems()
  const rangeStart = range[0]?.index ?? 0
  const rangeEnd = range.at(-1)?.index ?? -1
  const measurements = virtualizer.measurementsCache
  const startOf = (i: number) => measurements[i]?.start ?? HEAD_HEIGHT
  const endOf = (i: number) => measurements[i]?.end ?? HEAD_HEIGHT
  const visibleSpans = spans.filter(
    (s) => s.b >= s.a && s.b >= rangeStart && s.a <= rangeEnd
  )
  const first = visibleSpans[0]
  const last = visibleSpans.at(-1)
  return {
    scroller,
    measure: virtualizer.measureElement,
    window: { rangeStart, rangeEnd, startOf, endOf },
    visibleSpans,
    topGap: first ? startOf(first.a) - HEAD_HEIGHT : 0,
    bottomGap: last ? virtualizer.getTotalSize() - endOf(last.b) : 0,
  }
}

type GroupWindow = {
  rangeStart: number
  rangeEnd: number
  startOf: (i: number) => number
  endOf: (i: number) => number
}

function Toolbar({
  groupOptions,
  group,
  allCollapsed,
  onToggleAll,
  total,
  groupCount,
  noun,
}: {
  groupOptions: GroupOption[]
  group: GroupOption | undefined
  allCollapsed: boolean
  onToggleAll: () => void
  total: number
  groupCount: number
  noun: Noun
}) {
  const ToggleIcon = allCollapsed ? ChevronsUpDownIcon : ChevronsDownUpIcon
  return (
    <div className="flex flex-wrap items-center gap-2">
      {groupOptions.length > 1 && (
        <Select
          items={groupOptions.map((g) => ({ value: g.id, label: g.label }))}
          value={group?.id ?? null}
          onValueChange={(v) => v && setSearchParams({ group: v })}
          aria-label="Group by"
        >
          <SelectTrigger aria-label="Group by" className="min-w-40">
            <span className="text-muted-foreground">Group by</span>
            <SelectValue />
          </SelectTrigger>
          {/* The "Group by" prefix sits before the value: open below, not over it. */}
          <SelectContent alignItemWithTrigger={false}>
            {groupOptions.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Button variant="ghost" onClick={onToggleAll} hotkey="Shift+E">
        <ToggleIcon data-icon="inline-start" />
        {allCollapsed ? "Expand all" : "Collapse all"}
      </Button>
      <p className="ms-auto text-sm text-muted-foreground tabular-nums">
        {total === 1 ? `1 ${noun.one}` : `${total} ${noun.other}`}
        {group && ` in ${groupCount} groups`}
      </p>
    </div>
  )
}

function HeadCell<TData>({
  header,
  onSort,
}: {
  header: Header<TData, unknown>
  onSort: (id: string) => void
}) {
  const def = header.column.columnDef
  const dir = header.column.getIsSorted()
  const label = flexRender(def.header, header.getContext())
  return (
    <th
      className={cn(HEAD, def.meta?.align === "end" && "text-end")}
      aria-sort={dir ? ARIA_SORT[dir] : undefined}
    >
      {header.column.getCanSort() ? (
        <button
          type="button"
          onClick={() => onSort(header.column.id)}
          className={cn(
            "-mx-1.5 inline-flex h-7 items-center gap-1 rounded-md px-1.5 focus-ring hover:text-foreground",
            def.meta?.align === "end" && "flex-row-reverse"
          )}
        >
          {label}
          {dir === "asc" && <ArrowUpIcon className="size-3.5" />}
          {dir === "desc" && <ArrowDownIcon className="size-3.5" />}
        </button>
      ) : (
        label
      )}
    </th>
  )
}

function Band<TData>({
  span,
  value,
  rows,
  open,
  label,
  index,
  measure,
  onSelect,
  onToggle,
}: {
  span: number
  value: string
  rows: Row<TData>[]
  open: boolean
  label: React.ReactNode
  index: number
  measure: (el: Element | null) => void
  onSelect: (rows: Row<TData>[], selected: boolean) => void
  onToggle: (value: string) => void
}) {
  const groupSelected = rows.every((r) => r.getIsSelected())
  const someSelected = rows.some((r) => r.getIsSelected())
  return (
    <tr ref={measure} data-index={index}>
      <td className={cn(BAND, "ps-3 pe-1")}>
        <Checkbox
          aria-label={`Select all in ${value || "No value"}`}
          checked={groupSelected}
          indeterminate={!groupSelected && someSelected}
          onCheckedChange={(v) => onSelect(rows, !!v)}
        />
      </td>
      <th scope="rowgroup" colSpan={span - 1} className={BAND}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => onToggle(value)}
          className="-ms-1 flex h-7 items-center gap-1.5 rounded-md ps-1 pe-2 text-start font-medium focus-ring hover:bg-foreground/5"
        >
          <ChevronRightIcon
            aria-hidden
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-150 ease-out motion-reduce:transition-none rtl:-scale-x-100",
              open && "rotate-90 rtl:-rotate-90"
            )}
          />
          {label}
          <span className="font-normal text-muted-foreground tabular-nums">
            {rows.length}
          </span>
        </button>
      </th>
    </tr>
  )
}

function DataRow<TData>({
  row,
  number,
  index,
  measure,
  getRowLabel,
}: {
  row: Row<TData>
  number: number
  index: number
  measure: (el: Element | null) => void
  getRowLabel?: (row: TData) => string
}) {
  return (
    <tr
      ref={measure}
      data-index={index}
      data-state={row.getIsSelected() ? "selected" : undefined}
      className="group/row hover:bg-muted/50 data-[state=selected]:bg-muted"
    >
      <td className={cn(CELL, "ps-3 pe-1")}>
        <Checkbox
          aria-label={`Select ${getRowLabel?.(row.original) ?? `row ${number}`}`}
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
        />
      </td>
      <td
        className={cn(
          CELL,
          "px-1 text-end text-xs text-muted-foreground tabular-nums"
        )}
      >
        {number}
      </td>
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className={cn(
            CELL,
            cell.column.columnDef.meta?.align === "end" &&
              "text-end tabular-nums"
          )}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  )
}

/**
 * One group's tbody: its band, then the rows inside the rendered range.
 * Spacers keep the tbody its full height so the band stays pinned over all of it.
 */
function GroupBody<TData>({
  groupSpan,
  group,
  entries,
  win,
  span,
  measure,
  getRowLabel,
  onSelect,
  onToggle,
}: {
  groupSpan: GroupSpan<TData>
  group: GroupOption | undefined
  entries: Entry<TData>[]
  win: GroupWindow
  span: number
  measure: (el: Element | null) => void
  getRowLabel?: (row: TData) => string
  onSelect: (rows: Row<TData>[], selected: boolean) => void
  onToggle: (value: string) => void
}) {
  const { value, rows, open, a, b } = groupSpan
  const from = Math.max(group ? a + 1 : a, win.rangeStart)
  const to = Math.min(b, win.rangeEnd)
  const groupTop = group ? win.endOf(a) : win.startOf(a)
  const hasRows = from <= to
  const innerTop = hasRows ? win.startOf(from) - groupTop : 0
  const innerBottom = hasRows
    ? win.endOf(b) - win.endOf(to)
    : win.endOf(b) - groupTop
  const shown = open ? entries.slice(from, to + 1) : []
  return (
    <tbody>
      {group && (
        <Band
          span={span}
          value={value}
          rows={rows}
          open={open}
          label={group.render?.(value) ?? (value || "No value")}
          index={a}
          measure={measure}
          onSelect={onSelect}
          onToggle={onToggle}
        />
      )}
      {open && innerTop > 0 && <SpacerRow height={innerTop} span={span} />}
      {shown.map((entry) =>
        entry.kind === "row" ? (
          <DataRow
            key={entry.row.id}
            row={entry.row}
            number={entry.number}
            index={entry.index}
            measure={measure}
            getRowLabel={getRowLabel}
          />
        ) : null
      )}
      {open && innerBottom > 0 && (
        <SpacerRow height={innerBottom} span={span} />
      )}
    </tbody>
  )
}

const NUMERIC_CALCS = new Set<Calc>(["sum", "avg", "min", "max"])

function formatResult(
  result: number,
  calc: Calc,
  meta: ColumnDef<unknown>["meta"]
) {
  if (meta?.numeric && NUMERIC_CALCS.has(calc))
    return meta.format?.(result) ?? Math.round(result).toLocaleString("en-US")
  return result.toLocaleString("en-US")
}

/** A footer cell: pick a calculation for the column and show its result. */
function CalcCell<TData>({
  column,
  rows,
  calc,
  onChange,
}: {
  column: Column<TData, unknown>
  rows: Row<TData>[]
  calc: Calc | undefined
  onChange: (calc: Calc | null) => void
}) {
  const meta = column.columnDef.meta
  const name = meta?.label ?? column.id
  const calcLabel = CALCS.find((c) => c.value === calc)?.label
  const shown = calc
    ? formatResult(
        calculate(
          rows.map((r) => r.getValue(column.id)),
          calc
        ),
        calc,
        meta
      )
    : null
  return (
    <td className={cn(FOOT, meta?.align === "end" && "text-end")}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="xs"
              className="-mx-1.5 text-muted-foreground"
              aria-label={
                shown == null
                  ? `Calculate ${name}`
                  : `${name}: ${calcLabel} ${shown}`
              }
            />
          }
        >
          {shown == null ? (
            <>
              <ChevronDownIcon data-icon="inline-start" />
              Calculate
            </>
          ) : (
            <>
              <span>{calcLabel}</span>
              <span className="font-medium text-foreground tabular-nums">
                {shown}
              </span>
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={meta?.align === "end" ? "end" : "start"}
          side="top"
        >
          <DropdownMenuRadioGroup
            value={calc ?? "none"}
            onValueChange={(v) => onChange(v === "none" ? null : (v as Calc))}
          >
            <DropdownMenuLabel>{name}</DropdownMenuLabel>
            <DropdownMenuRadioItem value="none" closeOnClick>
              None
            </DropdownMenuRadioItem>
            {CALCS.filter((c) => !c.numeric || meta?.numeric).map((c) => (
              <DropdownMenuRadioItem key={c.value} value={c.value} closeOnClick>
                {c.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  )
}

/** Floats over the table's bottom edge; fades and rises in, leaves faster. */
function FloatingBulkBar<TData>({
  selected,
  count,
  noun,
  bulkActions,
  onClear,
}: {
  selected: TData[]
  /** The last non-zero count, so the bar fades out without flashing "0". */
  count: number
  noun: Noun
  bulkActions: (rows: TData[], clear: () => void) => React.ReactNode
  onClear: () => void
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-14 z-30 flex justify-center px-3">
      <div
        role="region"
        aria-label="Bulk actions"
        data-open={selected.length > 0 || undefined}
        inert={selected.length === 0}
        className="pointer-events-auto flex max-w-full translate-y-2 items-center gap-1 overflow-x-auto [scrollbar-width:none] rounded-xl bg-popover p-1.5 text-sm opacity-0 shadow-popover transition-[opacity,translate] duration-150 ease-in motion-reduce:translate-y-0 data-open:translate-y-0 data-open:opacity-100 data-open:duration-200 data-open:ease-out"
      >
        <span className="ps-2 pe-1 font-medium whitespace-nowrap tabular-nums">
          {count === 1 ? `1 ${noun.one} selected` : `${count} ${noun.other} selected`}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Clear selection"
          onClick={onClear}
        >
          <XIcon />
        </Button>
        <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-border" />
        {bulkActions(selected, onClear)}
      </div>
    </div>
  )
}

/**
 * A spreadsheet-style table split into groups. The column header, each group's
 * band and the calculation footer stay pinned while the body scrolls; groups
 * collapse; row numbers run across groups. Group and sort live in the URL
 * (`?group=`, `?sort=`). Give it a height (`className="h-[600px]"`, or
 * `flex-1 min-h-0` inside `AppShellContent fill`) so the body scrolls inside it.
 */
function GroupedTable<TData>({
  columns: userColumns,
  data,
  getRowId,
  getRowLabel,
  groupOptions,
  defaultGroup = groupOptions[0]?.id,
  noun = { one: "item", other: "items" },
  bulkActions,
  className,
}: {
  columns: ColumnDef<TData>[]
  data: TData[]
  getRowId: (row: TData) => string
  /** Names the row for its checkbox ("Select Acme"). Defaults to its number. */
  getRowLabel?: (row: TData) => string
  groupOptions: GroupOption[]
  defaultGroup?: string
  noun?: Noun
  /** Actions for the floating bar shown while rows are selected. */
  bulkActions?: (rows: TData[], clear: () => void) => React.ReactNode
  className?: string
}) {
  const params = useSearchParams()
  const group =
    groupOptions.find((g) => g.id === params.get("group")) ??
    groupOptions.find((g) => g.id === defaultGroup)
  const sortParam = params.get("sort") ?? ""
  // Memoized by value: TanStack Table treats a new array as a state change.
  const sorting = React.useMemo(() => sortingFrom(sortParam), [sortParam])

  const [rowSelection, setRowSelection] = React.useState<
    Record<string, boolean>
  >({})
  // Collapsed bands, keyed by "group:value" so each grouping remembers its own.
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set())
  const [calcs, setCalcs] = React.useState<Record<string, Calc>>({})

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions by design
  const table = useReactTable({
    data,
    columns: userColumns,
    getRowId,
    state: { sorting, rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const rows = table.getRowModel().rows
  const groups = React.useMemo(() => groupRows(rows, group), [rows, group])
  const { entries, spans } = React.useMemo(
    () => flatten(groups, group, collapsed),
    [groups, group, collapsed]
  )
  const view = useGroupWindow(entries, spans)

  const selected = table.getSelectedRowModel().rows.map((r) => r.original)
  const clearSelection = () => setRowSelection({})
  // The bar fades out with its last count instead of flashing "0 selected".
  const [shownCount, setShownCount] = React.useState(0)
  if (selected.length > 0 && selected.length !== shownCount)
    setShownCount(selected.length)

  const keyOf = (value: string) => `${group?.id}:${value}`
  const allCollapsed =
    groups.length > 0 && groups.every((g) => collapsed.has(keyOf(g.value)))
  const toggleGroup = (value: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(keyOf(value))) next.delete(keyOf(value))
      else next.add(keyOf(value))
      return next
    })
  const toggleAll = () =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      for (const g of groups)
        if (allCollapsed) next.delete(keyOf(g.value))
        else next.add(keyOf(g.value))
      return next
    })
  const selectRows = (list: Row<TData>[], on: boolean) =>
    setRowSelection((prev) => {
      const next = { ...prev }
      for (const r of list)
        if (on) next[r.id] = true
        else delete next[r.id]
      return next
    })
  const setCalc = (id: string, calc: Calc | null) =>
    setCalcs((prev) => {
      const next = { ...prev }
      if (calc) next[id] = calc
      else delete next[id]
      return next
    })
  const toggleSort = (id: string) => {
    const next =
      sortParam === id ? `-${id}` : sortParam === `-${id}` ? null : id
    setSearchParams({ sort: next })
  }

  const leafColumns = table.getVisibleLeafColumns()
  const span = leafColumns.length + 2 // select + row number
  const allSelected = table.getIsAllRowsSelected()

  return (
    <div
      data-slot="grouped-table"
      className={cn("relative flex min-h-80 flex-col gap-3", className)}
    >
      <Toolbar
        groupOptions={groupOptions}
        group={group}
        allCollapsed={allCollapsed}
        onToggleAll={toggleAll}
        total={data.length}
        groupCount={groups.length}
        noun={noun}
      />

      <div
        ref={view.scroller}
        className="relative min-h-0 flex-1 overflow-auto overscroll-contain rounded-lg bg-card shadow-border"
      >
        {/* border-separate: sticky cells keep their borders while scrolling. */}
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className={cn(HEAD, "w-10 ps-3 pe-1")}>
                <Checkbox
                  aria-label={`Select all ${noun.other}`}
                  checked={allSelected}
                  indeterminate={!allSelected && table.getIsSomeRowsSelected()}
                  onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
                />
              </th>
              <th className={cn(HEAD, "w-10 px-1 text-end")}>
                <span className="sr-only">Row</span>
              </th>
              {table.getHeaderGroups()[0].headers.map((header) => (
                <HeadCell key={header.id} header={header} onSort={toggleSort} />
              ))}
            </tr>
          </thead>

          {view.topGap > 0 && <SpacerBody height={view.topGap} span={span} />}
          {view.visibleSpans.map((groupSpan) => (
            <GroupBody
              key={groupSpan.value}
              groupSpan={groupSpan}
              group={group}
              entries={entries}
              win={view.window}
              span={span}
              measure={view.measure}
              getRowLabel={getRowLabel}
              onSelect={selectRows}
              onToggle={toggleGroup}
            />
          ))}
          {view.bottomGap > 0 && (
            <SpacerBody height={view.bottomGap} span={span} />
          )}

          <tfoot>
            <tr>
              <td className={FOOT} colSpan={2} />
              {leafColumns.map((column) => (
                <CalcCell
                  key={column.id}
                  column={column}
                  rows={rows}
                  calc={calcs[column.id]}
                  onChange={(calc) => setCalc(column.id, calc)}
                />
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {bulkActions && (
        <FloatingBulkBar
          selected={selected}
          count={shownCount}
          noun={noun}
          bulkActions={bulkActions}
          onClear={clearSelection}
        />
      )}
    </div>
  )
}

type Entry<TData> =
  | { kind: "band"; index: number }
  | { kind: "row"; index: number; row: Row<TData>; number: number }

type GroupSpan<TData> = {
  value: string
  rows: Row<TData>[]
  open: boolean
  /** First and last entry index (band, then rows). */
  a: number
  b: number
}

/** Match `h-10` header/rows and `h-9` bands; rendered rows are measured. */
const HEAD_HEIGHT = 40
const BAND_HEIGHT = 36
const ROW_HEIGHT = 40

function SpacerRow({ height, span }: { height: number; span: number }) {
  return (
    <tr aria-hidden>
      <td colSpan={span} style={{ height }} className="p-0" />
    </tr>
  )
}

function SpacerBody(props: { height: number; span: number }) {
  return (
    <tbody aria-hidden>
      <SpacerRow {...props} />
    </tbody>
  )
}

const STICKY = "sticky bg-clip-padding"
// Pinned header: above the bands (z-20), 1px bottom rule as an inset shadow
// so it survives scrolling.
const HEAD = cn(
  STICKY,
  "top-0 z-20 h-10 bg-card px-2 text-start align-middle text-xs font-medium whitespace-nowrap text-muted-foreground shadow-[inset_0_-1px_var(--border)]"
)
// Group bands pin under the 40px header while their rows scroll past.
const BAND = cn(
  STICKY,
  "top-10 z-10 h-9 bg-muted px-2 text-start align-middle font-normal whitespace-nowrap shadow-[inset_0_-1px_var(--border)]"
)
const CELL = "h-10 px-2 align-middle whitespace-nowrap border-b"
const FOOT = cn(
  STICKY,
  "bottom-0 z-20 h-10 bg-card px-2 align-middle whitespace-nowrap shadow-[inset_0_1px_var(--border)]"
)

export { GroupedTable }
