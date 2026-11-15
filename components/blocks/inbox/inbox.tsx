"use client"

import * as React from "react"
import { cn } from "cn"
import { useHotkey, type RegisterableHotkey } from "@tanstack/react-hotkeys"
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CheckCheckIcon,
  ChevronDownIcon,
  InboxIcon,
  MailIcon,
  MailOpenIcon,
  SearchXIcon,
  SendIcon,
  TagIcon,
  XIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { Hotkey } from "@/components/ui/hotkey"
import { Input } from "@/components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { toastUndo } from "@/components/ui/sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toolbar, ToolbarButton } from "@/components/ui/toolbar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { VirtualList } from "@/components/ui/virtual-list"
import { useDebouncedCallback } from "@/hooks/use-debounce"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  setSearchParams,
  useSearchParams,
  useUrlState,
} from "@/hooks/use-url-state"
import { initials } from "@/lib/utils"

export type MailFolder = "inbox" | "sent" | "archive"
export type MailPerson = { name: string; email: string }
export type MailMessage = {
  id: string
  from: MailPerson
  at: string
  body: string
}
export type MailLabel = {
  id: string
  name: string
  tone: "gray" | "blue" | "green" | "amber" | "orange" | "red" | "purple"
}
export type MailThread = {
  id: string
  folder: MailFolder
  subject: string
  participant: MailPerson
  labels: string[]
  unread: boolean
  /** Oldest first; the last one drives the row's time and snippet. */
  messages: MailMessage[]
}

const FOLDERS: { id: MailFolder; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "sent", label: "Sent" },
  { id: "archive", label: "Archive" },
]

const EMPTY_COPY: Record<MailFolder, { title: string; description: string }> = {
  inbox: {
    title: "You're all caught up",
    description: "New conversations land here. Archive what you have handled.",
  },
  sent: {
    title: "Nothing sent yet",
    description: "Replies you send show up here.",
  },
  archive: {
    title: "Nothing archived",
    description: "Press E on a conversation to move it here.",
  },
}

const timeFmt = new Intl.DateTimeFormat("en", {
  hour: "numeric",
  minute: "2-digit",
})
const dayFmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" })
const yearFmt = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
})
const fullFmt = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
})

function listTime(iso: string, now: Date) {
  const d = new Date(iso)
  if (d.toDateString() === now.toDateString()) return timeFmt.format(d)
  return (d.getFullYear() === now.getFullYear() ? dayFmt : yearFmt).format(d)
}

const lastOf = (t: MailThread) => t.messages[t.messages.length - 1]
const snippetOf = (t: MailThread) =>
  (lastOf(t)?.body ?? "").replace(/\s+/g, " ").slice(0, 160)

export function useMailbox(initial: MailThread[]) {
  const [threads, setThreads] = React.useState(initial)

  const patch = React.useCallback(
    (ids: Iterable<string>, fn: (t: MailThread) => MailThread) => {
      const set = new Set(ids)
      setThreads((list) => list.map((t) => (set.has(t.id) ? fn(t) : t)))
    },
    []
  )
  const setRead = React.useCallback(
    (ids: string[], read: boolean) =>
      patch(ids, (t) => (t.unread === !read ? t : { ...t, unread: !read })),
    [patch]
  )
  const moveTo = React.useCallback(
    (ids: string[], folder: MailFolder) => {
      const set = new Set(ids)
      const previous = new Map(
        threads.filter((t) => set.has(t.id)).map((t) => [t.id, t.folder])
      )
      patch(ids, (t) => ({ ...t, folder }))
      return () =>
        setThreads((list) =>
          list.map((t) =>
            previous.has(t.id) ? { ...t, folder: previous.get(t.id)! } : t
          )
        )
    },
    [patch, threads]
  )
  const setLabel = React.useCallback(
    (ids: string[], label: string, on: boolean) =>
      patch(ids, (t) => {
        const has = t.labels.includes(label)
        if (on === has) return t
        return {
          ...t,
          labels: on
            ? [...t.labels, label]
            : t.labels.filter((l) => l !== label),
        }
      }),
    [patch]
  )
  const reply = React.useCallback(
    (id: string, from: MailPerson, body: string) =>
      patch([id], (t) => ({
        ...t,
        messages: [
          ...t.messages,
          {
            id: `${t.id}-r${t.messages.length}`,
            from,
            at: new Date().toISOString(),
            body,
          },
        ],
      })),
    [patch]
  )
  return { threads, setRead, moveTo, setLabel, reply }
}

const ThreadRow = React.memo(function ThreadRow({
  thread,
  labels,
  now,
  selected,
  active,
  open,
  onToggle,
  onOpen,
}: {
  thread: MailThread
  labels: Map<string, MailLabel>
  now: Date
  selected: boolean
  active: boolean
  open: boolean
  onToggle: (id: string) => void
  onOpen: (id: string) => void
}) {
  const last = lastOf(thread)
  const rowLabels = thread.labels
    .map((id) => labels.get(id))
    .filter((l): l is MailLabel => !!l)
  return (
    <div
      data-thread-id={thread.id}
      data-unread={thread.unread || undefined}
      data-selected={selected || undefined}
      className={cn(
        "group/row relative flex items-start gap-3 border-b px-3 py-2.5 transition-colors hover:bg-muted/50",
        (open || selected) && "bg-muted",
        active &&
          "before:absolute before:inset-y-0 before:start-0 before:w-0.5 before:bg-primary"
      )}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggle(thread.id)}
        aria-label={`Select conversation from ${thread.participant.name}: ${thread.subject}`}
        className="relative z-10 mt-2.5"
      />
      <button
        type="button"
        onClick={() => onOpen(thread.id)}
        aria-current={open || undefined}
        className="flex min-w-0 flex-1 items-start gap-3 text-start outline-none after:absolute after:inset-0 focus-visible:after:shadow-[inset_0_0_0_2px_var(--ds-focus-ring)]"
      >
        <Avatar className="mt-0.5">
          <AvatarFallback>{initials(thread.participant.name)}</AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-2">
            {thread.unread && (
              <>
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full bg-primary"
                />
                <span className="sr-only">Unread: </span>
              </>
            )}
            <span
              dir="auto"
              className={cn(
                "min-w-0 flex-1 truncate text-sm",
                thread.unread ? "font-semibold" : "font-medium"
              )}
            >
              {thread.participant.name}
            </span>
            <time
              dateTime={last.at}
              suppressHydrationWarning
              className="shrink-0 text-xs text-muted-foreground tabular-nums"
            >
              {listTime(last.at, now)}
            </time>
          </span>
          <span
            dir="auto"
            className={cn(
              "truncate text-sm",
              thread.unread ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {thread.subject}
          </span>
          <span dir="auto" className="truncate text-xs text-muted-foreground">
            {snippetOf(thread)}
          </span>
          {rowLabels.length > 0 && (
            <span className="mt-1 flex min-w-0 flex-wrap gap-1">
              {rowLabels.slice(0, 2).map((l) => (
                <Badge key={l.id} tone={l.tone} className="max-w-36">
                  <span className="truncate">{l.name}</span>
                </Badge>
              ))}
              {rowLabels.length > 2 && (
                <Badge tone="gray">+{rowLabels.length - 2}</Badge>
              )}
            </span>
          )}
        </span>
      </button>
    </div>
  )
})

function LabelMenu({
  labels,
  threads,
  onChange,
  trigger,
}: {
  labels: MailLabel[]
  /** The threads the menu acts on: a label is checked when all have it. */
  threads: MailThread[]
  onChange: (label: string, on: boolean) => void
  trigger: React.ReactElement
}) {
  if (labels.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent align="end" className="w-48">
        {labels.map((l) => (
          <DropdownMenuCheckboxItem
            key={l.id}
            checked={
              threads.length > 0 &&
              threads.every((t) => t.labels.includes(l.id))
            }
            onCheckedChange={(on) => onChange(l.id, on)}
          >
            <span className="truncate">{l.name}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ActionTooltip({
  label,
  hotkey,
  children,
}: {
  label: string
  hotkey?: RegisterableHotkey
  children: React.ReactElement
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent hotkey={hotkey}>{label}</TooltipContent>
    </Tooltip>
  )
}

function MessageView({
  message,
  me,
  expanded,
  onToggle,
}: {
  message: MailMessage
  me: MailPerson
  expanded: boolean
  onToggle: () => void
}) {
  const mine = message.from.email === me.email
  return (
    <li className="rounded-xl shadow-border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full min-w-0 items-center gap-3 rounded-xl p-3 text-start focus-ring-inset"
      >
        <Avatar>
          <AvatarFallback>{initials(message.from.name)}</AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-baseline gap-2">
            <span dir="auto" className="min-w-0 truncate text-sm font-medium">
              {mine ? "You" : message.from.name}
            </span>
            <time
              dateTime={message.at}
              suppressHydrationWarning
              className="ms-auto shrink-0 text-xs text-muted-foreground tabular-nums"
            >
              {fullFmt.format(new Date(message.at))}
            </time>
          </span>
          <span dir="auto" className="truncate text-xs text-muted-foreground">
            {expanded ? message.from.email : message.body.replace(/\s+/g, " ")}
          </span>
        </span>
        <ChevronDownIcon
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>
      {expanded && (
        <p
          dir="auto"
          className="px-3 pb-4 text-sm leading-relaxed [overflow-wrap:anywhere] whitespace-pre-wrap"
        >
          {message.body}
        </p>
      )}
    </li>
  )
}

function ThreadDetail({
  thread,
  labels,
  me,
  composerRef,
  onBack,
  onMove,
  onSetRead,
  onLabel,
  onReply,
}: {
  thread: MailThread
  labels: MailLabel[]
  me: MailPerson
  composerRef: React.RefObject<HTMLTextAreaElement | null>
  onBack?: () => void
  onMove: () => void
  onSetRead: (read: boolean) => void
  onLabel: (label: string, on: boolean) => void
  onReply: (body: string) => void
}) {
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set([lastOf(thread).id])
  )
  const [draft, setDraft] = React.useState("")
  const labelMap = React.useMemo(
    () => new Map(labels.map((l) => [l.id, l])),
    [labels]
  )
  const send = () => {
    const body = draft.trim()
    if (!body) return
    onReply(body)
    setDraft("")
    setExpanded((s) =>
      new Set(s).add(`${thread.id}-r${thread.messages.length}`)
    )
  }
  const archived = thread.folder === "archive"
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start gap-2 border-b p-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Back to conversations"
            onClick={onBack}
          >
            <ArrowLeftIcon className="rtl:rotate-180" />
          </Button>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
          <h2
            dir="auto"
            className="text-base font-semibold [overflow-wrap:anywhere]"
          >
            {thread.subject}
          </h2>
          {thread.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {thread.labels.map((id) => {
                const l = labelMap.get(id)
                return l ? (
                  <Badge key={id} tone={l.tone} className="max-w-48">
                    <span className="truncate">{l.name}</span>
                  </Badge>
                ) : null
              })}
            </div>
          )}
        </div>
        <Toolbar
          aria-label="Conversation actions"
          className="shrink-0 p-0 shadow-none"
        >
          <ActionTooltip
            label={archived ? "Move to inbox" : "Archive"}
            hotkey={archived ? undefined : "E"}
          >
            <ToolbarButton
              size="icon-sm"
              aria-label={archived ? "Move to inbox" : "Archive"}
              onClick={onMove}
            >
              {archived ? <InboxIcon /> : <ArchiveIcon />}
            </ToolbarButton>
          </ActionTooltip>
          <ActionTooltip label="Mark as unread">
            <ToolbarButton
              size="icon-sm"
              aria-label="Mark as unread"
              onClick={() => onSetRead(false)}
            >
              <MailIcon />
            </ToolbarButton>
          </ActionTooltip>
          <LabelMenu
            labels={labels}
            threads={[thread]}
            onChange={onLabel}
            trigger={
              <ToolbarButton size="icon-sm" aria-label="Labels">
                <TagIcon />
              </ToolbarButton>
            }
          />
        </Toolbar>
      </div>
      <div
        tabIndex={0}
        role="region"
        aria-label="Conversation"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain focus-ring-inset"
      >
        <ol className="flex flex-col gap-3 p-3">
          {thread.messages.map((m) => (
            <MessageView
              key={m.id}
              message={m}
              me={me}
              expanded={expanded.has(m.id)}
              onToggle={() =>
                setExpanded((s) => {
                  const next = new Set(s)
                  if (!next.delete(m.id)) next.add(m.id)
                  return next
                })
              }
            />
          ))}
        </ol>
      </div>
      <form
        className="flex flex-col gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <Textarea
          ref={composerRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              send()
            }
          }}
          rows={3}
          dir="auto"
          aria-label={`Reply to ${thread.participant.name}`}
          placeholder="Write a reply"
          className="min-h-20 resize-none"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
            <Hotkey hotkey="R" />
            to reply
          </span>
          <Button
            type="submit"
            size="sm"
            className="ms-auto"
            disabled={!draft.trim()}
          >
            <SendIcon data-icon="inline-start" />
            Send
            <Hotkey hotkey="Mod+Enter" className="ms-1 opacity-70" />
          </Button>
        </div>
      </form>
    </div>
  )
}

function SelectionBar({
  folder,
  total,
  selectedIds,
  selectedThreads,
  labels,
  onSelectAll,
  onClearSelection,
  onMove,
  onSetRead,
  onSetLabel,
}: {
  folder: MailFolder
  total: number
  selectedIds: string[]
  selectedThreads: MailThread[]
  labels: MailLabel[]
  onSelectAll: () => void
  onClearSelection: () => void
  onMove: (ids: string[]) => void
  onSetRead: (ids: string[]) => void
  onSetLabel: (ids: string[], label: string, on: boolean) => void
}) {
  const allSelected = total > 0 && selectedIds.length === total
  return (
    <div className="flex h-11 shrink-0 items-center gap-3 border-b px-3">
      <Checkbox
        checked={allSelected}
        indeterminate={selectedIds.length > 0 && !allSelected}
        disabled={total === 0}
        onCheckedChange={(on) => (on ? onSelectAll() : onClearSelection())}
        aria-label="Select all conversations"
      />
      {selectedIds.length > 0 ? (
        <>
          <span className="min-w-0 flex-1 truncate text-sm tabular-nums">
            {selectedIds.length.toLocaleString("en")} selected
          </span>
          <Toolbar
            aria-label="Bulk actions"
            className="shrink-0 p-0 shadow-none"
          >
            <ActionTooltip
              label={folder === "archive" ? "Move to inbox" : "Archive"}
              hotkey={folder === "archive" ? undefined : "E"}
            >
              <ToolbarButton
                size="icon-sm"
                aria-label={folder === "archive" ? "Move to inbox" : "Archive"}
                onClick={() => onMove(selectedIds)}
              >
                {folder === "archive" ? <InboxIcon /> : <ArchiveIcon />}
              </ToolbarButton>
            </ActionTooltip>
            <ActionTooltip label="Mark as read" hotkey="Shift+I">
              <ToolbarButton
                size="icon-sm"
                aria-label="Mark as read"
                onClick={() => onSetRead(selectedIds)}
              >
                <MailOpenIcon />
              </ToolbarButton>
            </ActionTooltip>
            <LabelMenu
              labels={labels}
              threads={selectedThreads}
              onChange={(label, on) => onSetLabel(selectedIds, label, on)}
              trigger={
                <ToolbarButton size="icon-sm" aria-label="Label selected">
                  <TagIcon />
                </ToolbarButton>
              }
            />
            <ActionTooltip label="Clear selection" hotkey="Escape">
              <ToolbarButton
                size="icon-sm"
                aria-label="Clear selection"
                onClick={onClearSelection}
              >
                <XIcon />
              </ToolbarButton>
            </ActionTooltip>
          </Toolbar>
        </>
      ) : (
        <span
          className="min-w-0 flex-1 truncate text-sm text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          {total.toLocaleString("en")}{" "}
          {total === 1 ? "conversation" : "conversations"}
        </span>
      )}
    </div>
  )
}

function EmptyThreads({
  q,
  folder,
  onClearSearch,
}: {
  q: string
  folder: MailFolder
  onClearSearch: () => void
}) {
  return (
    <Empty className="flex-1 justify-center">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {q ? (
            <SearchXIcon />
          ) : folder === "inbox" ? (
            <CheckCheckIcon />
          ) : (
            <InboxIcon />
          )}
        </EmptyMedia>
        <EmptyTitle>
          {q ? "No matching conversations" : EMPTY_COPY[folder].title}
        </EmptyTitle>
        <EmptyDescription className="[overflow-wrap:anywhere]">
          {q
            ? `Nothing in ${folder} matches “${q}”.`
            : EMPTY_COPY[folder].description}
        </EmptyDescription>
      </EmptyHeader>
      {q && (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onClearSearch}>
            Clear search
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}

function ThreadListPane({
  query,
  q,
  searchRef,
  listRef,
  folder,
  inboxCount,
  visible,
  selection,
  selectedIds,
  selectedThreads,
  labels,
  labelMap,
  now,
  activeId,
  openId,
  onQueryChange,
  onQueryClear,
  onQuerySubmit,
  onClearSearch,
  onFolderChange,
  onSelectAll,
  onClearSelection,
  onToggle,
  onOpen,
  onMove,
  onSetRead,
  onSetLabel,
}: {
  /** What the search box shows (ahead of the URL while debouncing). */
  query: string
  q: string
  searchRef: React.RefObject<HTMLInputElement | null>
  listRef: React.RefObject<HTMLDivElement | null>
  folder: MailFolder
  inboxCount: number
  visible: MailThread[]
  selection: ReadonlySet<string>
  selectedIds: string[]
  selectedThreads: MailThread[]
  labels: MailLabel[]
  labelMap: Map<string, MailLabel>
  now: Date
  activeId: string | null
  openId: string | null
  onQueryChange: (value: string) => void
  onQueryClear: () => void
  onQuerySubmit: () => void
  onClearSearch: () => void
  onFolderChange: (folder: string) => void
  onSelectAll: () => void
  onClearSelection: () => void
  onToggle: (id: string) => void
  onOpen: (id: string) => void
  onMove: (ids: string[]) => void
  onSetRead: (ids: string[]) => void
  onSetLabel: (ids: string[], label: string, on: boolean) => void
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-2 border-b p-3">
        <Input
          ref={searchRef}
          type="text"
          inputMode="search"
          clearable
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onClear={onQueryClear}
          onKeyDown={(e) => {
            if (e.key === "Enter") onQuerySubmit()
          }}
          aria-label="Search mail"
          placeholder="Search mail"
          autoComplete="off"
        />
        <Tabs value={folder} onValueChange={(v) => onFolderChange(String(v))}>
          <TabsList variant="line" aria-label="Folder" className="w-full">
            {FOLDERS.map((f) => (
              <TabsTrigger key={f.id} value={f.id}>
                {f.label}
                {f.id === "inbox" && inboxCount > 0 && (
                  <span className="text-muted-foreground tabular-nums">
                    {inboxCount.toLocaleString("en")}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <SelectionBar
        folder={folder}
        total={visible.length}
        selectedIds={selectedIds}
        selectedThreads={selectedThreads}
        labels={labels}
        onSelectAll={onSelectAll}
        onClearSelection={onClearSelection}
        onMove={onMove}
        onSetRead={onSetRead}
        onSetLabel={onSetLabel}
      />
      {visible.length === 0 ? (
        <EmptyThreads q={q} folder={folder} onClearSearch={onClearSearch} />
      ) : (
        <div ref={listRef} className="flex min-h-0 flex-1 flex-col">
          <VirtualList
            items={visible}
            getKey={(t) => t.id}
            estimateSize={96}
            aria-label={`${FOLDERS.find((f) => f.id === folder)?.label} conversations`}
            className="max-h-none min-h-0 flex-1 rounded-none"
            renderItem={(t) => (
              <ThreadRow
                thread={t}
                labels={labelMap}
                now={now}
                selected={selection.has(t.id)}
                active={t.id === activeId}
                open={t.id === openId}
                onToggle={onToggle}
                onOpen={onOpen}
              />
            )}
          />
        </div>
      )}
      <div className="hidden items-center gap-3 border-t px-3 py-2 text-xs text-muted-foreground md:flex">
        <span className="flex items-center gap-1">
          <Hotkey hotkey="J" />
          <Hotkey hotkey="K" /> move
        </span>
        <span className="flex items-center gap-1">
          <Hotkey hotkey="X" /> select
        </span>
        <span className="flex items-center gap-1">
          <Hotkey hotkey="E" /> archive
        </span>
      </div>
    </div>
  )
}

const NO_LABELS: MailLabel[] = []
const SPLIT_QUERY = "(min-width: 900px)"

/** The open thread is in the URL, so Back returns to the list. */
export function Inbox({
  threads: initial,
  labels = NO_LABELS,
  me,
  now: nowProp,
  className,
}: {
  threads: MailThread[]
  labels?: MailLabel[]
  /** The signed-in user: replies are sent as them. */
  me: MailPerson
  /** Reference for "today" in row times. Defaults to the current time. */
  now?: Date | string
  className?: string
}) {
  const { threads, setRead, moveTo, setLabel, reply } = useMailbox(initial)
  const [now] = React.useState(() => (nowProp ? new Date(nowProp) : new Date()))
  const split = useMediaQuery(SPLIT_QUERY)

  const [folderParam] = useUrlState("folder", "inbox", "push")
  const folder: MailFolder = FOLDERS.some((f) => f.id === folderParam)
    ? (folderParam as MailFolder)
    : "inbox"
  const [q, setQ] = useUrlState("q", "")
  const openId = useSearchParams().get("thread")
  const [query, setQuery] = React.useState(q)
  const writeQ = useDebouncedCallback((value: string) => setQ(value || null))

  const [selection, setSelection] = React.useState<Set<string>>(new Set())
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const composerRef = React.useRef<HTMLTextAreaElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const labelMap = React.useMemo(
    () => new Map(labels.map((l) => [l.id, l])),
    [labels]
  )
  const sorted = React.useMemo(
    () =>
      threads
        .map((t) => [Date.parse(lastOf(t).at), t] as const)
        .sort((a, b) => b[0] - a[0])
        .map(([, t]) => t),
    [threads]
  )
  const byId = React.useMemo(
    () => new Map(threads.map((t) => [t.id, t])),
    [threads]
  )
  const visible = React.useMemo(() => {
    const needle = q.trim().toLowerCase()
    return sorted.filter(
      (t) =>
        t.folder === folder &&
        (!needle ||
          t.subject.toLowerCase().includes(needle) ||
          t.participant.name.toLowerCase().includes(needle) ||
          t.participant.email.toLowerCase().includes(needle) ||
          snippetOf(t).toLowerCase().includes(needle))
    )
  }, [sorted, folder, q])
  const counts = React.useMemo(() => {
    let inbox = 0
    for (const t of threads) if (t.folder === "inbox" && t.unread) inbox++
    return { inbox }
  }, [threads])

  const visibleIds = React.useMemo(
    () => new Set(visible.map((t) => t.id)),
    [visible]
  )
  // A selection only counts rows still in this view.
  const selectedIds = React.useMemo(
    () => [...selection].filter((id) => visibleIds.has(id)),
    [selection, visibleIds]
  )
  const selectedThreads = selectedIds.flatMap((id) => byId.get(id) ?? [])
  const openThread = openId ? byId.get(openId) : undefined

  const open = React.useCallback(
    (id: string) => {
      setActiveId(id)
      setSearchParams({ thread: id }, "push")
      setRead([id], true)
    },
    [setRead]
  )
  const close = React.useCallback(
    () => setSearchParams({ thread: null }, "push"),
    []
  )
  const toggle = React.useCallback((id: string) => {
    setSelection((s) => {
      const next = new Set(s)
      if (!next.delete(id)) next.add(id)
      return next
    })
  }, [])

  const targetIds = () =>
    selectedIds.length
      ? selectedIds
      : activeId && visibleIds.has(activeId)
        ? [activeId]
        : openId
          ? [openId]
          : []

  const move = (ids: string[]) => {
    if (!ids.length) return
    const set = new Set(ids)
    const to: MailFolder = folder === "archive" ? "inbox" : "archive"
    const index = visible.findIndex((t) => set.has(t.id))
    const next =
      visible.slice(index + 1).find((t) => !set.has(t.id)) ??
      visible
        .slice(0, Math.max(index, 0))
        .reverse()
        .find((t) => !set.has(t.id))
    const undo = moveTo(ids, to)
    setSelection(new Set())
    if (activeId && set.has(activeId)) setActiveId(next?.id ?? null)
    if (openId && set.has(openId)) {
      if (split && next) open(next.id)
      else close()
    }
    const noun =
      ids.length === 1 ? "Conversation" : `${ids.length} conversations`
    toastUndo(`${noun} ${to === "archive" ? "archived" : "moved to inbox"}`, {
      onUndo: undo,
    })
  }

  const step = (delta: 1 | -1) => {
    if (!visible.length) return
    const at = visible.findIndex((t) => t.id === (activeId ?? openId))
    const next =
      visible[
        Math.min(
          visible.length - 1,
          Math.max(
            0,
            at < 0 ? (delta > 0 ? 0 : visible.length - 1) : at + delta
          )
        )
      ]
    setActiveId(next.id)
    if (split && openId) open(next.id)
  }

  React.useEffect(() => {
    if (!activeId) return
    listRef.current
      ?.querySelector(`[data-thread-id="${CSS.escape(activeId)}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [activeId])

  const typing = () => {
    const el = document.activeElement
    return (
      el instanceof HTMLElement &&
      (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
    )
  }
  useHotkey("J", () => step(1))
  useHotkey("K", () => step(-1))
  useHotkey("O", () => activeId && open(activeId), { enabled: !!activeId })
  useHotkey("X", () => activeId && toggle(activeId), { enabled: !!activeId })
  useHotkey("E", () => move(targetIds()))
  useHotkey("Shift+I", () => {
    const ids = targetIds()
    setRead(ids, true)
  })
  useHotkey("R", () => composerRef.current?.focus(), {
    enabled: !!openThread,
  })
  useHotkey("/", () => searchRef.current?.focus(), { preventDefault: true })
  useHotkey(
    "Escape",
    () => {
      if (typing()) return
      if (selection.size) setSelection(new Set())
      else if (openId && !split) close()
    },
    { enabled: selection.size > 0 || (!!openId && !split) }
  )

  const changeFolder = (value: string) => {
    setSelection(new Set())
    setActiveId(null)
    setSearchParams(
      { folder: value === "inbox" ? null : value, thread: null },
      "push"
    )
  }
  const clearSearch = () => {
    setQuery("")
    writeQ.cancel()
    setQ(null)
  }

  const showDetail = !!openThread

  const list = (
    <ThreadListPane
      query={query}
      q={q}
      searchRef={searchRef}
      listRef={listRef}
      folder={folder}
      inboxCount={counts.inbox}
      visible={visible}
      selection={selection}
      selectedIds={selectedIds}
      selectedThreads={selectedThreads}
      labels={labels}
      labelMap={labelMap}
      now={now}
      activeId={activeId}
      openId={openId}
      onQueryChange={(value) => {
        setQuery(value)
        writeQ(value)
      }}
      onQueryClear={() => {
        writeQ.cancel()
        setQ(null)
      }}
      onQuerySubmit={writeQ.flush}
      onClearSearch={clearSearch}
      onFolderChange={changeFolder}
      onSelectAll={() => setSelection(new Set(visible.map((t) => t.id)))}
      onClearSelection={() => setSelection(new Set())}
      onToggle={toggle}
      onOpen={open}
      onMove={move}
      onSetRead={(ids) => setRead(ids, true)}
      onSetLabel={setLabel}
    />
  )

  const detail = openThread ? (
    <ThreadDetail
      key={openThread.id}
      thread={openThread}
      labels={labels}
      me={me}
      composerRef={composerRef}
      onBack={split ? undefined : close}
      onMove={() => move([openThread.id])}
      onSetRead={(read) => setRead([openThread.id], read)}
      onLabel={(label, on) => setLabel([openThread.id], label, on)}
      onReply={(body) => reply(openThread.id, me, body)}
    />
  ) : (
    <Empty className="h-full justify-center">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MailOpenIcon />
        </EmptyMedia>
        <EmptyTitle>Select a conversation</EmptyTitle>
        <EmptyDescription>
          Pick one from the list, or press J and O to open the next.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )

  return (
    <div
      data-slot="inbox"
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl bg-card shadow-border",
        className
      )}
    >
      {split ? (
        <ResizablePanelGroup>
          <ResizablePanel defaultSize="38%" minSize="28%" maxSize="55%">
            {list}
          </ResizablePanel>
          <ResizableHandle withHandle aria-label="Resize conversation list" />
          <ResizablePanel minSize="35%">{detail}</ResizablePanel>
        </ResizablePanelGroup>
      ) : showDetail ? (
        detail
      ) : (
        list
      )}
    </div>
  )
}
