"use client"

import * as React from "react"
import { useHotkey, type RegisterableHotkey } from "@tanstack/react-hotkeys"
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Hotkey } from "@/components/ui/hotkey"
import { IconTile, type iconTileVariants } from "@/components/ui/icon-tile"
import { Kbd } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"
import { useControllableState } from "@/hooks/use-controllable-state"
import { useDebouncedState } from "@/hooks/use-debounce"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useRemoteSearch } from "./use-remote-search"
import type { VariantProps } from "class-variance-authority"

export type PaletteCommand = {
  /** Unique across every page of the palette. */
  id: string
  label: string
  /** A second, quieter line. */
  description?: string
  /** Group heading, in order of first appearance. Defaults to "Actions". */
  group?: string
  icon?: React.ReactNode
  tone?: VariantProps<typeof iconTileVariants>["tone"]
  /** Extra words that find the command. */
  keywords?: string[]
  /** Shown beside the label; register it yourself (the palette only displays it). */
  shortcut?: RegisterableHotkey
  /** Selecting opens these as a nested page instead of running the command. */
  children?: PaletteCommand[]
  onSelect?: () => void
}

const DEFAULT_GROUP = "Actions"
/** Rendered rows are capped so 500 commands stay as fast as 20. */
const MAX_ROWS = 80

const fold = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()

type Flat = { command: PaletteCommand; trail: string[]; haystack: string }

function flatten(
  commands: PaletteCommand[],
  trail: string[] = [],
  out: Flat[] = []
) {
  for (const command of commands) {
    out.push({
      command,
      trail,
      haystack: fold(
        [command.label, command.description, ...(command.keywords ?? [])]
          .filter(Boolean)
          .join(" ")
      ),
    })
    if (command.children)
      flatten(command.children, [...trail, command.label], out)
  }
  return out
}

/**
 * ⌘K command palette on `Command`: grouped commands, nested pages ("Change
 * theme" opens its own list; Backspace on an empty input goes back), optional
 * async search with loading, empty and error states, and recent commands kept
 * in `localStorage`. Filtering is accent- and case-insensitive. At most 80 rows
 * render, so a long list stays fast; typing narrows it.
 */
function CommandPalette({
  commands,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  hotkey = "Mod+K",
  search,
  searchGroup = "Search results",
  recentKey = "ds-command-palette-recent",
  maxRecent = 5,
  placeholder = "Type a command or search…",
  title = "Command palette",
}: {
  commands: PaletteCommand[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Toggles the palette from anywhere. `null` leaves registering it to you. */
  hotkey?: RegisterableHotkey | null
  /** Looks up results beyond `commands` as the user types (debounced). */
  search?: (query: string, signal: AbortSignal) => Promise<PaletteCommand[]>
  searchGroup?: string
  recentKey?: string
  maxRecent?: number
  placeholder?: string
  title?: string
}) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const [query, debounced, setQuery] = useDebouncedState("")
  const [trail, setTrail] = React.useState<PaletteCommand[]>([])
  const [recent, setRecent] = useLocalStorage<string[]>(recentKey, EMPTY)

  useHotkey(hotkey ?? "Mod+K", () => changeOpen(!open), { enabled: !!hotkey })

  const flat = React.useMemo(() => flatten(commands), [commands])
  const byId = React.useMemo(
    () => new Map(flat.map((f) => [f.command.id, f.command])),
    [flat]
  )

  const page = trail.at(-1)
  const q = fold(query.trim())

  const remote = useRemoteSearch(search, query, debounced, !page)
  const remoteItems = remote.items

  function changeOpen(next: boolean) {
    if (!next) {
      setQuery("")
      setTrail([])
      remote.reset()
    }
    setOpen(next)
  }

  // What the list shows.
  const local = visibleCommands(flat, page, q)
  const ranked = q ? [...local].sort((a, b) => rank(a, q) - rank(b, q)) : local
  const shown = ranked.slice(0, MAX_ROWS)

  const groups = groupByHeading(shown)
  const recents =
    !page && !q ? recentCommands(recent, byId, maxRecent) : []

  const run = (command: PaletteCommand) => {
    if (command.children) {
      setTrail((t) => [...t, command])
      setQuery("")
      return
    }
    if (byId.has(command.id))
      setRecent((prev) =>
        [command.id, ...prev.filter((id) => id !== command.id)].slice(
          0,
          maxRecent
        )
      )
    changeOpen(false)
    command.onSelect?.()
  }

  const back = () => {
    setTrail((t) => t.slice(0, -1))
    setQuery("")
  }

  const total = page
    ? (page.children?.length ?? 0)
    : q
      ? local.length
      : flat.length
  const hasOptions = shown.length + remoteItems.length + recents.length > 0
  const status = (
    <PaletteStatus
      loading={remote.loading}
      failed={remote.failed}
      hasOptions={hasOptions}
      query={query.trim()}
      searching={!!q}
    />
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={changeOpen}
      title={title}
      description="Search commands, jump to a page or run an action"
      className="sm:max-w-xl"
    >
      <Command shouldFilter={false} loop>
        {page && <Breadcrumb trail={trail} onBack={back} />}
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={page ? `Search ${page.label}…` : placeholder}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !query && page) {
              e.preventDefault()
              back()
            }
          }}
        />
        {hasOptions ? (
          <CommandList className="max-h-[min(60dvh,24rem)] p-1">
            {recents.length > 0 && (
              <CommandGroup heading="Recent">
                {recents.map((c) => (
                  <Row
                    key={c.id}
                    command={c}
                    value={`recent-${c.id}`}
                    onRun={run}
                  />
                ))}
              </CommandGroup>
            )}
            {[...groups].map(([heading, rows]) => (
              <CommandGroup key={heading} heading={heading}>
                {rows.map(({ command, trail: path }) => (
                  <Row
                    key={command.id}
                    command={command}
                    path={q ? path : undefined}
                    onRun={run}
                  />
                ))}
              </CommandGroup>
            ))}
            {remoteItems.length > 0 && (
              <CommandGroup heading={searchGroup}>
                {remoteItems.map((c) => (
                  <Row
                    key={c.id}
                    command={c}
                    value={`remote-${c.id}`}
                    onRun={run}
                  />
                ))}
              </CommandGroup>
            )}
            {status}
            {total > shown.length && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                Showing {shown.length} of {total}. Keep typing to narrow it
                down.
              </p>
            )}
          </CommandList>
        ) : (
          // No options: the status rides in a disabled option so the listbox
          // (the input's aria-controls target) is never empty.
          <CommandList className="max-h-[min(60dvh,24rem)] p-1">
            <CommandItem
              disabled
              value="__status"
              className="justify-center opacity-100! data-[disabled=true]:opacity-100"
            >
              {status}
            </CommandItem>
          </CommandList>
        )}
        <Hints page={!!page} hotkey={hotkey} />
      </Command>
    </CommandDialog>
  )
}

const EMPTY: string[] = []

/** The page's own children, matches of the query, or the top level. */
function visibleCommands(
  flat: Flat[],
  page: PaletteCommand | undefined,
  q: string
) {
  if (page) {
    const children = new Set(page.children)
    return flat.filter((f) => children.has(f.command))
  }
  return q
    ? flat.filter((f) => f.haystack.includes(q))
    : flat.filter((f) => f.trail.length === 0)
}

function groupByHeading(rows: Flat[]) {
  const groups = new Map<string, Flat[]>()
  for (const f of rows) {
    const g = f.command.group ?? DEFAULT_GROUP
    groups.set(g, [...(groups.get(g) ?? []), f])
  }
  return groups
}

function recentCommands(
  recent: string[],
  byId: Map<string, PaletteCommand>,
  max: number
) {
  return recent
    .map((id) => byId.get(id))
    .filter((c): c is PaletteCommand => !!c && !c.children)
    .slice(0, max)
}

function Breadcrumb({
  trail,
  onBack,
}: {
  trail: PaletteCommand[]
  onBack: () => void
}) {
  const path = trail.map((t) => t.label).join(" › ")
  return (
    <div className="flex items-center gap-2 px-2 pt-1">
      <Button
        variant="ghost"
        size="xs"
        onClick={onBack}
        aria-label={`Back from ${trail.at(-1)?.label}`}
      >
        <ArrowLeftIcon data-icon="inline-start" className="rtl:rotate-180" />
        Back
      </Button>
      <span title={path} className="min-w-0 truncate text-xs text-muted-foreground">
        {path}
      </span>
    </div>
  )
}

function Hints({
  page,
  hotkey,
}: {
  page: boolean
  hotkey: RegisterableHotkey | null
}) {
  return (
    <div className="flex items-center gap-4 border-t px-3 py-2 text-xs text-muted-foreground pointer-coarse:hidden">
      <Hint keys={["↑", "↓"]}>Navigate</Hint>
      <Hint keys={["↵"]}>Select</Hint>
      {page && <Hint keys={["⌫"]}>Back</Hint>}
      <Hint keys={["Esc"]} className="ms-auto">
        Close
      </Hint>
      {hotkey && (
        <span className="hidden items-center gap-1.5 sm:flex">
          Toggle <Hotkey hotkey={hotkey} />
        </span>
      )}
    </div>
  )
}

/** Label starts with the query, then label contains it, then keywords only. */
function rank(f: Flat, q: string) {
  const label = fold(f.command.label)
  return label.startsWith(q) ? 0 : label.includes(q) ? 1 : 2
}

function PaletteStatus({
  loading,
  failed,
  hasOptions,
  query,
  searching,
}: {
  loading: boolean
  failed: boolean
  hasOptions: boolean
  query: string
  searching: boolean
}) {
  if (loading)
    return (
      <div
        role="status"
        className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground"
      >
        <Spinner className="size-3.5" aria-hidden role="presentation" />
        Searching for “{query}”…
      </div>
    )
  if (failed)
    return (
      <p role="alert" className="px-3 py-3 text-sm text-destructive">
        Couldn’t search right now. Local commands still work.
      </p>
    )
  if (hasOptions) return null
  return (
    <p
      role="status"
      className="px-4 py-8 text-center text-sm text-muted-foreground"
    >
      {searching
        ? `Nothing matches “${query}”. Check the spelling or try another word.`
        : "No commands yet."}
    </p>
  )
}

function Hint({
  keys,
  children,
  className,
}: {
  keys: string[]
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={`flex items-center gap-1.5 ${className ?? ""}`}>
      {keys.map((k) => (
        <Kbd key={k} aria-hidden>
          {k}
        </Kbd>
      ))}
      {children}
    </span>
  )
}

function Row({
  command,
  value,
  path,
  onRun,
}: {
  command: PaletteCommand
  value?: string
  /** Parent pages, shown when a search finds a command inside a nested page. */
  path?: string[]
  onRun: (command: PaletteCommand) => void
}) {
  const description = path?.length ? path.join(" › ") : command.description
  return (
    <CommandItem
      value={value ?? command.id}
      onSelect={() => onRun(command)}
      className="gap-3 py-2"
    >
      <IconTile size="sm" tone={command.tone}>
        {command.icon}
      </IconTile>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-foreground" title={command.label}>
          {command.label}
        </span>
        {description && (
          <span className="block truncate text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      {command.shortcut && (
        <Hotkey hotkey={command.shortcut} className="shrink-0" />
      )}
      {command.children && (
        <ChevronRightIcon
          aria-hidden
          className="ms-auto size-4 shrink-0 text-muted-foreground rtl:rotate-180"
        />
      )}
    </CommandItem>
  )
}

export { CommandPalette }
