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
  noun?: { one: string; other: string }
}) {
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

  // Search input is local for instant typing; the URL catches up after 300ms.
  const [draft, setDraft] = React.useState(query)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const [lastQuery, setLastQuery] = React.useState(query)
  if (query !== lastQuery) {
    // URL changed elsewhere (Back, clear filters): adopt it.
    setLastQuery(query)
    setDraft(query)
  }
  const onSearch = (value: string) => {
    setDraft(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setLastQuery(value)
      setSearchParams({ q: value.trim() || null, page: null })
    }, 300)
  }

  const [rowSelection, setRowSelection] = React.useState<
    Record<string, boolean>
  >({})

  const columns = React.useMemo<ColumnDef<TData>[]>(() => {
    if (!bulkActions) return userColumns
    return [
      {
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
      },
      ...userColumns,
    ]
  }, [userColumns, bulkActions])

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
  const hasFilters = !!query || columnFilters.length > 0
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

  const cellClass = (row: {
    column: { id: string; columnDef: ColumnDef<TData> }
  }) =>
    cn(
      // Follows the table's own width, not the viewport: beside a sidebar a
      // tablet-sized screen still has a phone-sized table.
      row.column.columnDef.meta?.hideOnMobile && "hidden @2xl/table:table-cell",
      row.column.columnDef.meta?.align === "end" && "text-end",
      // 24px clear around the 16px checkbox (WCAG 2.5.8): the next column's
      // sort button would otherwise sit 10px from its center.
      row.column.id === "select" && "pe-4!",
      // Takes the spare width and truncates, but never below 10rem; past that
      // the table scrolls sideways instead of overlapping cells.
      row.column.columnDef.meta?.grow && "w-full max-w-0 min-w-40"
    )

  if (status === "ready" && data.length === 0 && emptyState)
    return <>{emptyState}</>

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
            value={draft}
            onChange={(e) => onSearch(e.target.value)}
          />
        </InputGroup>
        {filters.map((filter) => {
          const active = params.get(filter.id)?.split(",").filter(Boolean) ?? []
          return (
            <DropdownMenu key={filter.id}>
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
                    checked={active.includes(option.value)}
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
        })}
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <XIcon data-icon="inline-start" />
            Clear
          </Button>
        )}
      </div>

      {selected.length > 0 && bulkActions && (
        <div
          role="region"
          aria-label="Bulk actions"
          className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
        >
          <span className="me-auto font-medium tabular-nums">
            {selected.length} selected
          </span>
          {bulkActions(selected, () => setRowSelection({}))}
          <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}>
            Clear
          </Button>
        </div>
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
                  {group.headers.map((header) => {
                    const def = header.column.columnDef
                    const sortable =
                      header.column.getCanSort() && status === "ready"
                    const dir = header.column.getIsSorted()
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          cellClass(header),
                          header.id === "select" && "w-12"
                        )}
                        aria-sort={
                          dir === "asc"
                            ? "ascending"
                            : dir === "desc"
                              ? "descending"
                              : undefined
                        }
                      >
                        {header.isPlaceholder ? null : sortable ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(header.column.id)}
                            className={cn(
                              "-mx-1.5 inline-flex h-7 items-center gap-1 rounded-md px-1.5 focus-ring hover:text-foreground",
                              def.meta?.align === "end" && "flex-row-reverse"
                            )}
                          >
                            {flexRender(def.header, header.getContext())}
                            {dir === "asc" ? (
                              <ArrowUpIcon className="size-3.5" />
                            ) : dir === "desc" ? (
                              <ArrowDownIcon className="size-3.5" />
                            ) : (
                              <ArrowUpDownIcon className="size-3.5 opacity-40" />
                            )}
                          </button>
                        ) : (
                          flexRender(def.header, header.getContext())
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {status === "loading" ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="p-0">
                    <SkeletonGroup
                      label={`Loading ${noun.other}`}
                      className="divide-y"
                    >
                      {Array.from({ length: 6 }, (_, i) => (
                        <div
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
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length}>
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
                        <Button variant="outline" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      </EmptyContent>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row: Row<TData>) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cellClass(cell)}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {status === "ready" && filtered > 0 && (
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
      )}
    </div>
  )
}

export { DataTable }
