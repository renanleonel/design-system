"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Header,
  type Row,
  type SortingState,
} from "@tanstack/react-table"
import { cn } from "cn"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListFilterIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ErrorState } from "@/components/ui/error-state"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDebouncedCallback } from "@/hooks/use-debounce"
import { setSearchParams, useSearchParams } from "@/hooks/use-url-state"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Hidden below md, so phones keep the identity and status columns. */
    hideOnMobile?: boolean
    /**
     * Takes the leftover width and truncates its content, so the table always
     * fits its container (one per table, usually the identity column).
     */
    grow?: boolean
    /** Numbers align to the trailing edge (layout.md). */
    align?: "start" | "end"
    /** Label for the sort button and screen readers. */
    label?: string
  }
}

export type FacetFilter = {
  /** Column id; its URL param has the same name (comma-separated values). */
  id: string
  label: string
  options: { label: string; value: string }[]
}

const PAGE_SIZE = 10

type Noun = { one: string; other: string }
type Column<TData> = { id: string; columnDef: ColumnDef<TData> }

function cellClass<TData>(column: Column<TData>) {
  const meta = column.columnDef.meta
  return cn(
    // Follows the table's own width, not the viewport: beside a sidebar a
    // tablet-sized screen still has a phone-sized table.
    meta?.hideOnMobile && "hidden @2xl/table:table-cell",
    meta?.align === "end" && "text-end",
    // 24px clear around the 16px checkbox (WCAG 2.5.8): the next column's
    // sort button would otherwise sit 10px from its center.
    column.id === "select" && "pe-4!",
    // Takes the spare width and truncates, but never below 10rem; past that
    // the table scrolls sideways instead of overlapping cells.
    meta?.grow && "w-full max-w-0 min-w-40"
  )
}

/** View state from the URL: search, page, sort and one param per filter. */
function useUrlView(filters: FacetFilter[]) {
  const params = useSearchParams()
  const query = params.get("q") ?? ""
  const page = Math.max(1, Number(params.get("page")) || 1)
  const sortParam = params.get("sort") ?? ""
  // Derived from the URL, memoized by value: TanStack Table treats a new array as
  // a change, and a change on every render loops (filters -> page reset -> render).
  const sorting = React.useMemo<SortingState>(
    () =>
      sortParam
        ? [{ id: sortParam.replace(/^-/, ""), desc: sortParam.startsWith("-") }]
        : [],
    [sortParam]
  )
  const filterKey = filters
    .map((f) => `${f.id}=${params.get(f.id) ?? ""}`)
    .join("&")
  const columnFilters = React.useMemo(
    () =>
      filterKey
        .split("&")
        .map((pair) => {
          const [id, raw = ""] = pair.split("=")
          return { id, value: raw.split(",").filter(Boolean) }
        })
        .filter((f) => f.id && f.value.length),
    [filterKey]
  )
  return { params, query, page, sortParam, sorting, columnFilters }
}

/**
 * Search input state: local for instant typing, written to the URL (`q`) once
 * typing pauses (each URL write re-filters the table), and re-adopted when the
 * URL changes elsewhere (Back, clear filters).
 */
function useUrlSearch(query: string) {
  const [draft, setDraft] = React.useState(query)
  const [lastQuery, setLastQuery] = React.useState(query)
  if (query !== lastQuery) {
    setLastQuery(query)
    setDraft(query)
  }
  const commit = useDebouncedCallback((value: string) => {
    setLastQuery(value)
    setSearchParams({ q: value.trim() || null, page: null })
  })
  const onSearch = (value: string) => {
    setDraft(value)
    commit(value)
  }
  return { draft, onSearch, flush: () => commit.flush() }
}

function selectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all on this page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
      />
    ),
  }
}

function FacetFilterMenu({
  filter,
  active,
}: {
  filter: FacetFilter
  active: string[]
}) {
  const activeSet = new Set(active)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <ListFilterIcon data-icon="inline-start" />
        {filter.label}
        {active.length > 0 && (
          <Badge variant="secondary" className="tabular-nums">
            {active.length}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
        {filter.options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={activeSet.has(option.value)}
            closeOnClick={false}
            onCheckedChange={(checked) => {
              const next = checked
                ? [...active, option.value]
                : active.filter((v) => v !== option.value)
              setSearchParams({
                [filter.id]: next.join(",") || null,
                page: null,
              })
            }}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        {active.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={false}
              onCheckedChange={() =>
                setSearchParams({ [filter.id]: null, page: null })
              }
            >
              Clear {filter.label.toLowerCase()}
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function BulkBar<TData>({
  selected,
  bulkActions,
  onClear,
}: {
  selected: TData[]
  bulkActions: (rows: TData[], clear: () => void) => React.ReactNode
  onClear: () => void
}) {
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
    >
      <span className="me-auto font-medium tabular-nums">
        {selected.length} selected
      </span>
      {bulkActions(selected, onClear)}
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear
      </Button>
    </div>
  )
}

const ARIA_SORT = { asc: "ascending", desc: "descending" } as const

function SortIcon({ dir }: { dir: false | "asc" | "desc" }) {
  if (dir === "asc") return <ArrowUpIcon className="size-3.5" />
  if (dir === "desc") return <ArrowDownIcon className="size-3.5" />
  return <ArrowUpDownIcon className="size-3.5 opacity-40" />
}

function HeaderCell<TData>({
  header,
  sortable,
  onSort,
}: {
  header: Header<TData, unknown>
  sortable: boolean
  onSort: (id: string) => void
}) {
  const def = header.column.columnDef
  const dir = header.column.getIsSorted()
  const label = header.isPlaceholder
    ? null
    : flexRender(def.header, header.getContext())
  return (
    <TableHead
      className={cn(cellClass(header.column), header.id === "select" && "w-12")}
      aria-sort={dir ? ARIA_SORT[dir] : undefined}
    >
      {sortable && !header.isPlaceholder ? (
        <button
          type="button"
          onClick={() => onSort(header.column.id)}
          className={cn(
            "-mx-1.5 inline-flex h-7 items-center gap-1 rounded-md px-1.5 focus-ring hover:text-foreground",
            def.meta?.align === "end" && "flex-row-reverse"
          )}
        >
          {label}
          <SortIcon dir={dir} />
        </button>
      ) : (
        label
      )}
    </TableHead>
  )
}

function LoadingRows({ colSpan, noun }: { colSpan: number; noun: Noun }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="p-0">
        <SkeletonGroup label={`Loading ${noun.other}`} className="divide-y">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              // Identical placeholder rows that never reorder.
              // react-doctor-disable-next-line react-doctor/no-array-index-as-key
              key={i}
              className="flex items-center gap-4 px-2 py-3"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="ms-auto hidden h-4 w-24 md:block" />
            </div>
          ))}
        </SkeletonGroup>
      </TableCell>
    </TableRow>
  )
}

function NoMatches({
  colSpan,
  noun,
  query,
  onClear,
}: {
  colSpan: number
  noun: Noun
  query: string
  onClear: () => void
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan}>
        <Empty className="py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon />
            </EmptyMedia>
            <EmptyTitle>
              {query
                ? `No ${noun.other} match “${query}”`
                : `No ${noun.other} match these filters`}
            </EmptyTitle>
            <EmptyDescription>
              Try a shorter search or clear the filters.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={onClear}>
              Clear filters
            </Button>
          </EmptyContent>
        </Empty>
      </TableCell>
    </TableRow>
  )
}

function Pager({
  filtered,
  page,
  pageCount,
  noun,
}: {
  filtered: number
  page: number
  pageCount: number
  noun: Noun
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
      <p className="tabular-nums">
        {filtered === 1 ? `1 ${noun.one}` : `${filtered} ${noun.other}`}
        {pageCount > 1 &&
          ` · page ${Math.min(page, pageCount)} of ${pageCount}`}
      </p>
      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() =>
              setSearchParams({ page: page - 1 > 1 ? page - 1 : null })
            }
          >
            <ChevronLeftIcon className="rtl:-scale-x-100" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next page"
            disabled={page >= pageCount}
            onClick={() => setSearchParams({ page: page + 1 })}
          >
            <ChevronRightIcon className="rtl:-scale-x-100" />
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * A table whose view state lives in the URL (q, sort, page and one param per
 * filter), so any view can be shared and Back works. Client-side model for
 * up to a few thousand rows; for server data, feed `data` from a query keyed
 * on the same params.
 */
function DataTable<TData>({
  columns: userColumns,
  data,
  status = "ready",
  onRetry,
  getRowId,
  searchPlaceholder = "Search…",
  filters = [],
  bulkActions,
  emptyState,
  noun = { one: "item", other: "items" },
}: {
  columns: ColumnDef<TData>[]
  data: TData[]
  status?: "loading" | "error" | "ready"
  onRetry?: () => void
  getRowId: (row: TData) => string
  searchPlaceholder?: string
  filters?: FacetFilter[]
  /** Shown in a bar while rows are selected. */
  bulkActions?: (rows: TData[], clear: () => void) => React.ReactNode
  /** First-use empty state, when there is no data at all. */
  emptyState?: React.ReactNode
  noun?: Noun
}) {
  const { params, query, page, sortParam, sorting, columnFilters } =
    useUrlView(filters)
  const search = useUrlSearch(query)
  const [rowSelection, setRowSelection] = React.useState<
    Record<string, boolean>
  >({})

  const columns = React.useMemo<ColumnDef<TData>[]>(
    () => (bulkActions ? [selectColumn<TData>(), ...userColumns] : userColumns),
    [userColumns, bulkActions]
  )

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions by design
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      globalFilter: query,
      sorting,
      columnFilters,
      rowSelection,
      pagination: { pageIndex: page - 1, pageSize: PAGE_SIZE },
    },
    onRowSelectionChange: setRowSelection,
    filterFns: {},
    defaultColumn: {
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
    },
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // The page lives in the URL; filter/sort handlers reset it explicitly.
    autoResetPageIndex: false,
  })

  const filtered = table.getFilteredRowModel().rows.length
  const pageCount = Math.max(1, Math.ceil(filtered / PAGE_SIZE))
  const selected = table.getSelectedRowModel().rows.map((r) => r.original)
  const rows = table.getRowModel().rows
  const clearSelection = () => setRowSelection({})
  const clearFilters = () =>
    setSearchParams({
      q: null,
      page: null,
      ...Object.fromEntries(filters.map((f) => [f.id, null])),
    })
  const toggleSort = (id: string) => {
    const next =
      sortParam === id ? `-${id}` : sortParam === `-${id}` ? null : id
    setSearchParams({ sort: next, page: null })
  }

  if (status === "ready" && data.length === 0 && emptyState)
    return <>{emptyState}</>

  let body: React.ReactNode
  if (status === "loading") {
    body = <LoadingRows colSpan={columns.length} noun={noun} />
  } else if (rows.length === 0) {
    body = (
      <NoMatches
        colSpan={columns.length}
        noun={noun}
        query={query}
        onClear={clearFilters}
      />
    )
  } else {
    body = rows.map((row: Row<TData>) => (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() ? "selected" : undefined}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className={cellClass(cell.column)}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))
  }

  return (
    <div data-slot="data-table" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={search.draft}
            onChange={(e) => search.onSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search.flush()}
          />
        </InputGroup>
        {filters.map((filter) => (
          <FacetFilterMenu
            key={filter.id}
            filter={filter}
            active={params.get(filter.id)?.split(",").filter(Boolean) ?? []}
          />
        ))}
        {(!!query || columnFilters.length > 0) && (
          <Button variant="ghost" onClick={clearFilters}>
            <XIcon data-icon="inline-start" />
            Clear
          </Button>
        )}
      </div>

      {selected.length > 0 && bulkActions && (
        <BulkBar
          selected={selected}
          bulkActions={bulkActions}
          onClear={clearSelection}
        />
      )}

      <div className="@container/table overflow-hidden rounded-lg shadow-border">
        {status === "error" ? (
          <ErrorState
            title={`Couldn't load ${noun.other}`}
            onRetry={onRetry}
            className="py-12"
          />
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow
                  key={group.id}
                  className="bg-muted/40 hover:bg-muted/40"
                >
                  {group.headers.map((header) => (
                    <HeaderCell
                      key={header.id}
                      header={header}
                      sortable={
                        header.column.getCanSort() && status === "ready"
                      }
                      onSort={toggleSort}
                    />
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>{body}</TableBody>
          </Table>
        )}
      </div>

      {status === "ready" && filtered > 0 && (
        <Pager
          filtered={filtered}
          page={page}
          pageCount={pageCount}
          noun={noun}
        />
      )}
    </div>
  )
}

export { DataTable }
