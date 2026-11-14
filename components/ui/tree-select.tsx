"use client"

import * as React from "react"
import { cn } from "cn"
import { ChevronDownIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { indexTree, Tree, type TreeNode } from "@/components/ui/tree"
import { useDebouncedState } from "@/hooks/use-debounce"

type SingleProps = {
  multiple?: false
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (id: string | null) => void
}
type MultipleProps = {
  /** Checkbox rows; the popup stays open while picking. */
  multiple: true
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (ids: string[]) => void
}

const toIds = (v: string | string[] | null | undefined) =>
  v == null ? [] : Array.isArray(v) ? v : [v]

/** Ids of every ancestor of `ids`, so the tree opens on the current pick. */
function ancestorsOf(nodes: TreeNode[], ids: string[]) {
  const parent = new Map<string, string>()
  const walk = (list: TreeNode[], up: string | null) => {
    for (const node of list) {
      if (up) parent.set(node.id, up)
      if (node.children) walk(node.children, node.id)
    }
  }
  walk(nodes, null)
  const out = new Set<string>()
  for (const id of ids) {
    let up = parent.get(id)
    while (up && !out.has(up)) {
      out.add(up)
      up = parent.get(up)
    }
  }
  return [...out]
}

/**
 * A select whose options are a tree: a trigger like `Select` that opens a
 * searchable `Tree` in a popover (a bottom sheet below 640px). Pick one node
 * (closes on pick) or, with `multiple`, check several (shown as tags, past
 * `maxVisible` folded into "+N"). Typing filters; ArrowDown moves from the
 * search box into the tree; Escape closes. The tree opens on the ancestors of
 * the current value. `name` posts the ids with a form.
 */
function TreeSelect({
  nodes,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No matches.",
  maxVisible = 2,
  clearable,
  defaultExpanded = [],
  id,
  name,
  disabled,
  className,
  ref,
  onBlur,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
  ...selection
}: (SingleProps | MultipleProps) & {
  nodes: TreeNode[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: React.ReactNode
  /** Tags shown in the trigger before the rest fold into "+N" (multiple). */
  maxVisible?: number
  /** Shows a Clear action in the popup (always on with `multiple`). */
  clearable?: boolean
  /** Folders open the first time the popup opens, besides the value's ancestors. */
  defaultExpanded?: string[]
  id?: string
  name?: string
  disabled?: boolean
  className?: string
  /** The trigger button, so a form can focus it on error. */
  ref?: React.Ref<HTMLButtonElement>
  onBlur?: React.FocusEventHandler<HTMLButtonElement>
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-invalid"?: boolean | "true" | "false"
  "aria-describedby"?: string
}) {
  const multiple = selection.multiple === true
  const [open, setOpen] = React.useState(false)
  const [state, setState] = React.useState<string[]>(() =>
    toIds(selection.defaultValue)
  )
  const ids = selection.value !== undefined ? toIds(selection.value) : state
  const index = React.useMemo(() => indexTree(nodes), [nodes])
  const selected = ids.flatMap((v) => index.get(v) ?? [])

  const [query, debouncedQuery, setQuery] = useDebouncedState("")
  const search = React.useRef<HTMLInputElement>(null)
  const tree = React.useRef<HTMLDivElement>(null)

  const commit = (next: string[]) => {
    setState(next)
    if (selection.multiple) selection.onValueChange?.(next)
    else selection.onValueChange?.(next[0] ?? null)
  }

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setQuery("", { immediate: true })
  }

  const hidden = selected.slice(maxVisible)

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        ref={ref}
        id={id}
        disabled={disabled}
        onBlur={onBlur}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        data-slot="tree-select-trigger"
        data-placeholder={selected.length === 0 || undefined}
        className={cn(
          "group/tree-select flex h-auto min-h-control w-full min-w-0 items-center gap-1.5 rounded-control border border-input bg-transparent py-1 pr-2 pl-2.5 text-start text-sm focus-ring transition-colors outline-none select-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          multiple && selected.length > 0 && "pl-1",
          className
        )}
      >
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {selected.length === 0 ? (
            <span className="truncate">{placeholder}</span>
          ) : multiple ? (
            <>
              {selected.slice(0, maxVisible).map((node) => (
                <span
                  key={node.id}
                  title={node.label}
                  className="flex h-[calc(--spacing(5.25))] max-w-full min-w-0 items-center rounded-sm bg-muted px-1.5 text-xs font-medium text-foreground"
                >
                  <span className="truncate">{node.label}</span>
                </span>
              ))}
              {hidden.length > 0 && (
                <span
                  title={hidden.map((node) => node.label).join(", ")}
                  className="flex h-[calc(--spacing(5.25))] items-center rounded-sm bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums"
                >
                  +{hidden.length}
                  <span className="sr-only">
                    {" "}
                    more: {hidden.map((node) => node.label).join(", ")}
                  </span>
                </span>
              )}
            </>
          ) : (
            <span className="flex min-w-0 items-center gap-1.5">
              {selected[0].icon && (
                <span aria-hidden className="flex text-muted-foreground">
                  {selected[0].icon}
                </span>
              )}
              <span className="truncate" title={selected[0].label}>
                {selected[0].label}
              </span>
            </span>
          )}
        </span>
        <ChevronDownIcon className="text-muted-foreground transition-transform duration-200 ease-out group-data-popup-open/tree-select:rotate-180 motion-reduce:transition-none" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        initialFocus={search}
        className="w-(--anchor-width) min-w-72 gap-1.5 p-1.5"
      >
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            ref={search}
            type="search"
            aria-label={searchPlaceholder.replace(/…$/, "")}
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault()
                tree.current?.focus()
              }
            }}
          />
        </InputGroup>
        {multiple ? (
          <Tree
            ref={tree}
            multiple
            nodes={nodes}
            value={ids}
            onValueChange={commit}
            filter={debouncedQuery}
            defaultExpanded={[...defaultExpanded, ...ancestorsOf(nodes, ids)]}
            empty={emptyMessage}
            aria-label={ariaLabel ?? placeholder}
            className="max-h-72 max-sm:max-h-[50dvh]"
          />
        ) : (
          <Tree
            ref={tree}
            nodes={nodes}
            value={ids[0] ?? null}
            onValueChange={(next) => {
              commit([next])
              onOpenChange(false)
            }}
            filter={debouncedQuery}
            defaultExpanded={[...defaultExpanded, ...ancestorsOf(nodes, ids)]}
            empty={emptyMessage}
            aria-label={ariaLabel ?? placeholder}
            className="max-h-72 max-sm:max-h-[50dvh]"
          />
        )}
        {(multiple || clearable) && (
          <div className="flex items-center justify-between gap-2 border-t px-1 pt-1.5">
            <span
              aria-live="polite"
              className="text-xs text-muted-foreground tabular-nums"
            >
              {selected.length === 0
                ? "Nothing selected"
                : `${selected.length} selected`}
            </span>
            <Button
              variant="ghost"
              size="xs"
              disabled={selected.length === 0}
              onClick={() => commit([])}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
      {name &&
        ids.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
    </Popover>
  )
}

export { TreeSelect }
