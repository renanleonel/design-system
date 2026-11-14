"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "cn"
import {
  CalendarIcon,
  CopyIcon,
  FlagIcon,
  GripVerticalIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import {
  boardAnnouncements,
  collisionDetection,
  columnAwareCoordinates,
  columnKey,
  isColumnKey,
} from "./board-dnd"
import {
  type CardMove,
  type KanbanCard,
  type KanbanColumn,
  type KanbanLabel,
  type KanbanPerson,
  type Priority,
} from "./board-model"
import { AvatarStack } from "@/components/ui/avatar-group"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useBoardDrag } from "./use-board-drag"
import { useBoardOperations } from "./use-board-operations"

/** Cards a column renders before "Show N more" (keeps a 200-card column fast). */
const PAGE = 50

const PRIORITY: Record<
  Priority,
  { label: string; tone: "red" | "orange" | "amber" | "gray" }
> = {
  urgent: { label: "Urgent", tone: "red" },
  high: { label: "High", tone: "orange" },
  medium: { label: "Medium", tone: "amber" },
  low: { label: "Low", tone: "gray" },
}


const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})
const formatDue = (due: string) => dateFormat.format(new Date(`${due}T00:00:00Z`))

// Today's date exists only in the browser: the server snapshot is empty, so
// hydration matches and "overdue" appears right after.
const noopSubscribe = () => () => {}
const getToday = () => new Date().toISOString().slice(0, 10)
const getServerToday = () => ""
function useToday() {
  return React.useSyncExternalStore(noopSubscribe, getToday, getServerToday)
}

type Lookups = {
  labels: Map<string, KanbanLabel>
  people: Map<string, KanbanPerson>
  columns: Map<string, KanbanColumn>
}

/* -------------------------------------------------------------------------- */
/*  Card                                                                      */
/* -------------------------------------------------------------------------- */

/** The card's look; also what the drag overlay shows. */
function CardFace({
  card,
  lookups,
  today,
  pending,
  overlay,
  className,
}: {
  card: KanbanCard
  lookups: Lookups
  today: string
  pending?: boolean
  overlay?: boolean
  className?: string
}) {
  const labels = card.labelIds.flatMap((id) => lookups.labels.get(id) ?? [])
  const people = card.assigneeIds.flatMap((id) => lookups.people.get(id) ?? [])
  const priority = PRIORITY[card.priority]
  const overdue = !!card.due && !!today && card.due < today
  return (
    <div
      data-slot="kanban-card"
      className={cn(
        "flex flex-col gap-2 rounded-lg bg-card p-3 text-sm text-card-foreground shadow-border",
        // No rotate or scale: dnd-kit measures the overlay's box, and a
        // transformed box shifts which neighbour the arrow keys pick.
        overlay && "shadow-popover",
        className
      )}
    >
      {labels.length > 0 && (
        <ul className="flex flex-wrap gap-1" aria-label="Labels">
          {labels.map((label) => (
            <li key={label.id} className="min-w-0">
              <Badge tone={label.tone} title={label.name} className="truncate">
                {label.name}
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <p className="flex items-start gap-2 font-medium">
        <span className="line-clamp-3 min-w-0 flex-1">{card.title}</span>
        {pending && (
          <Spinner className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        )}
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <FlagIcon
            aria-hidden
            className={cn(
              "size-3.5",
              card.priority === "urgent" && "text-tone-red",
              card.priority === "high" && "text-tone-orange",
              card.priority === "medium" && "text-tone-amber"
            )}
          />
          <span className="sr-only">Priority: </span>
          {priority.label}
        </span>
        {card.due && (
          <span
            className={cn(
              "flex items-center gap-1 tabular-nums",
              overdue && "font-medium text-tone-red"
            )}
          >
            <CalendarIcon aria-hidden className="size-3.5" />
            <span className="sr-only">Due </span>
            {formatDue(card.due)}
            {overdue && <span className="sr-only"> (overdue)</span>}
          </span>
        )}
        {people.length > 0 && (
          // The card is one drag button, so no popover chip inside it: the
          // overflow is a plain count and the sheet lists everyone.
          <div className="ms-auto flex items-center gap-1">
            <AvatarStack
              people={people.slice(0, 3)}
              max={3}
              size="sm"
              label="Assignees"
            />
            {people.length > 3 && (
              <span className="tabular-nums" title={people.slice(3).map((p) => p.name).join(", ")}>
                +{people.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SortableCard({
  card,
  lookups,
  today,
  pending,
  columns,
  onOpen,
  onMoveTo,
  onDuplicate,
  onDelete,
}: {
  card: KanbanCard
  lookups: Lookups
  today: string
  pending: boolean
  columns: KanbanColumn[]
  onOpen: (id: string) => void
  onMoveTo: (card: KanbanCard, columnId: string) => void
  onDuplicate: (card: KanbanCard) => void
  onDelete: (card: KanbanCard) => void
}) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)")
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", columnId: card.columnId },
    transition: reduced
      ? null
      : { duration: 200, easing: "cubic-bezier(0.77, 0, 0.175, 1)" },
  })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      data-dragging={isDragging || undefined}
      className="list-none"
    >
      <ContextMenu>
        {/* The menu is a sibling of the drag button, not inside it: portal
            events bubble through React, and a click on a menu item would
            otherwise open the card or start a drag. */}
        <ContextMenuTrigger
          {...attributes}
          {...listeners}
          aria-roledescription="draggable card"
          data-card-id={card.id}
          aria-busy={pending || undefined}
          className="block cursor-grab rounded-lg focus-ring select-none active:cursor-grabbing"
          onClick={() => onOpen(card.id)}
          onKeyDown={(event) => {
            listeners?.onKeyDown?.(event)
            if (event.key === "Enter" && event.target === event.currentTarget)
              onOpen(card.id)
          }}
        >
          <CardFace
            card={card}
            lookups={lookups}
            today={today}
            pending={pending}
            className={cn(
              "transition-[opacity,box-shadow] duration-(--ds-duration-press) motion-reduce:transition-none",
              isDragging &&
                "opacity-40 shadow-none outline-2 -outline-offset-2 outline-border outline-dashed"
            )}
          />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onOpen(card.id)}>
            Open details
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {columns
                .filter((c) => c.id !== card.columnId)
                .map((c) => (
                  <ContextMenuItem
                    key={c.id}
                    onClick={() => onMoveTo(card, c.id)}
                  >
                    <span className="max-w-56 truncate">{c.title}</span>
                  </ContextMenuItem>
                ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem onClick={() => onDuplicate(card)}>
            <CopyIcon />
            Duplicate
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive" onClick={() => onDelete(card)}>
            <Trash2Icon />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </li>
  )
}

/* -------------------------------------------------------------------------- */
/*  Column                                                                    */
/* -------------------------------------------------------------------------- */

function WipBadge({ count, limit }: { count: number; limit?: number }) {
  if (limit === undefined)
    return (
      <Badge tone="gray" aria-label={`${count} cards`}>
        {count}
      </Badge>
    )
  const over = count > limit
  const at = count === limit
  return (
    <Badge
      tone={over ? "red" : at ? "amber" : "gray"}
      title={`Work in progress limit: ${limit}`}
      aria-label={`${count} of ${limit} cards${over ? ", over the limit" : at ? ", at the limit" : ""}`}
    >
      {count}/{limit}
    </Badge>
  )
}

function Column({
  column,
  cards,
  total,
  overHighlight,
  children,
  onAdd,
}: {
  column: KanbanColumn
  /** Visible cards (after the filter). */
  cards: KanbanCard[]
  /** All cards in the column, for the count and the limit. */
  total: number
  overHighlight: boolean
  children: (shown: KanbanCard[]) => React.ReactNode
  onAdd: (columnId: string, title: string) => void
}) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)")
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: columnKey(column.id),
    data: { type: "column" },
    transition: reduced
      ? null
      : { duration: 200, easing: "cubic-bezier(0.77, 0, 0.175, 1)" },
  })
  const [limit, setLimit] = React.useState(PAGE)
  const [adding, setAdding] = React.useState(false)
  const shown = cards.slice(0, limit)
  const hidden = cards.length - shown.length
  const filtered = cards.length !== total

  return (
    <section
      ref={setNodeRef}
      aria-label={column.title}
      data-slot="kanban-column"
      data-over={overHighlight || undefined}
      data-dragging={isDragging || undefined}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className="relative flex h-full w-72 shrink-0 flex-col rounded-xl bg-muted/60 transition-[background-color,opacity] duration-(--ds-duration-press) data-dragging:z-10 data-dragging:opacity-70 data-over:bg-muted motion-reduce:transition-none"
    >
      <header className="flex items-center gap-1 p-2 pb-1">
        <button
          type="button"
          ref={setActivatorNodeRef}
          aria-label={`Reorder column ${column.title}`}
          className="hit-area flex h-control-sm w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-muted-foreground/60 focus-ring hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-4" />
        </button>
        <h3
          className="min-w-0 flex-1 truncate text-sm font-medium"
          title={column.title}
        >
          {column.title}
        </h3>
        <WipBadge count={total} limit={column.wipLimit} />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Add card to ${column.title}`}
          onClick={() => setAdding(true)}
        >
          <PlusIcon />
        </Button>
      </header>
      {adding && (
        <form
          className="px-2 pb-2"
          onSubmit={(event) => {
            event.preventDefault()
            const input = event.currentTarget.elements.namedItem(
              "title"
            ) as HTMLInputElement
            const title = input.value.trim()
            if (!title) return
            onAdd(column.id, title)
            input.value = ""
          }}
        >
          <Input
            name="title"
            autoFocus
            aria-label={`New card in ${column.title}`}
            placeholder="Card title, then Enter"
            autoComplete="off"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation()
                setAdding(false)
              }
            }}
            onBlur={(event) => {
              if (!event.currentTarget.value.trim()) setAdding(false)
            }}
          />
        </form>
      )}
      <ScrollArea
        className="min-h-0 flex-1"
        fade
        viewportProps={{ "aria-label": `${column.title} cards` }}
      >
        <SortableContext
          items={shown.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex min-h-16 flex-col gap-2 p-2 pt-1">
            {children(shown)}
            {cards.length === 0 && (
              <li
                className="list-none rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground"
              >
                {filtered ? "No cards match the filter" : "No cards yet"}
              </li>
            )}
          </ul>
        </SortableContext>
        {hidden > 0 && (
          <div className="px-2 pb-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setLimit(cards.length)}
            >
              Show {hidden} more
            </Button>
          </div>
        )}
      </ScrollArea>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Details sheet                                                             */
/* -------------------------------------------------------------------------- */

function CardSheet({
  card,
  columns,
  lookups,
  today,
  onClose,
  onMoveTo,
  onDuplicate,
  onDelete,
}: {
  card: KanbanCard | undefined
  columns: KanbanColumn[]
  lookups: Lookups
  today: string
  onClose: () => void
  onMoveTo: (card: KanbanCard, columnId: string) => void
  onDuplicate: (card: KanbanCard) => void
  onDelete: (card: KanbanCard) => void
}) {
  // Keep the last card while the sheet fades out.
  const [last, setLast] = React.useState(card)
  if (card && card !== last) setLast(card)
  const shown = card ?? last
  const items = columns.map((c) => ({ value: c.id, label: c.title }))
  const labels = shown?.labelIds.flatMap((id) => lookups.labels.get(id) ?? [])
  const people = shown?.assigneeIds.flatMap(
    (id) => lookups.people.get(id) ?? []
  )
  const overdue = !!shown?.due && !!today && shown.due < today
  return (
    <Sheet open={!!card} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="data-[side=right]:sm:max-w-md">
        {shown && (
          <>
            <SheetHeader className="pe-12">
              <SheetTitle className="text-lg leading-snug">
                {shown.title}
              </SheetTitle>
              <SheetDescription>
                {shown.description ?? "No description."}
              </SheetDescription>
            </SheetHeader>
            <dl className="grid grid-cols-[6rem_1fr] items-center gap-x-3 gap-y-4 px-4 text-sm">
              <dt className="text-muted-foreground">Column</dt>
              <dd className="min-w-0">
                <Select
                  items={items}
                  value={shown.columnId}
                  onValueChange={(value) => value && onMoveTo(shown, value)}
                >
                  <SelectTrigger aria-label="Column" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </dd>
              <dt className="text-muted-foreground">Priority</dt>
              <dd>
                <Badge tone={PRIORITY[shown.priority].tone} size="md">
                  <FlagIcon data-icon="inline-start" />
                  {PRIORITY[shown.priority].label}
                </Badge>
              </dd>
              <dt className="text-muted-foreground">Due</dt>
              <dd className={cn("tabular-nums", overdue && "text-tone-red")}>
                {shown.due
                  ? `${formatDue(shown.due)}${overdue ? " (overdue)" : ""}`
                  : "No due date"}
              </dd>
              <dt className="text-muted-foreground">Labels</dt>
              <dd className="flex min-w-0 flex-wrap gap-1">
                {labels?.length ? (
                  labels.map((l) => (
                    <Badge key={l.id} tone={l.tone} title={l.name}>
                      <span className="truncate">{l.name}</span>
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </dd>
              <dt className="self-start pt-1 text-muted-foreground">
                Assignees
              </dt>
              <dd className="min-w-0">
                {people?.length ? (
                  <ul className="flex flex-col gap-1.5">
                    {people.map((p) => (
                      <li key={p.id} className="truncate" title={p.name}>
                        {p.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </dd>
            </dl>
            <SheetFooter className="flex-row gap-2">
              <Button variant="outline" onClick={() => onDuplicate(shown)}>
                <CopyIcon data-icon="inline-start" />
                Duplicate
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(shown)
                  onClose()
                }}
              >
                <Trash2Icon data-icon="inline-start" />
                Delete
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

/* -------------------------------------------------------------------------- */
/*  Board                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A kanban board (dnd-kit).
 * - Drag cards within and across columns, and columns by their grip. Pointer
 *   drags start after 4px; touch drags after a short press, so the board still
 *   scrolls sideways under a finger.
 * - Keyboard: focus a card (or a column grip), Space to lift, arrows to move
 *   (left/right changes column), Space to drop, Escape to cancel. Enter opens
 *   the card. Moves are announced to screen readers.
 * - Moves are optimistic: the card lands at once while `onMoveCard` runs; if it
 *   rejects the card goes back and a toast offers Retry. Same for columns,
 *   new cards and duplicates.
 * - Right click (long press on touch) opens a menu: move, duplicate, delete.
 * - Columns render 50 cards, then "Show N more"; `visible` filters cards
 *   without losing their order.
 * - Give it a height (a `fill` page): the board scrolls sideways, each column
 *   scrolls on its own.
 */
function KanbanBoard({
  columns: initialColumns,
  cards: initialCards,
  labels,
  people,
  visible,
  onMoveCard,
  onMoveColumns,
  onCreateCard,
  onDeleteCard,
  "aria-label": ariaLabel = "Board",
  className,
}: {
  columns: KanbanColumn[]
  cards: KanbanCard[]
  labels: KanbanLabel[]
  people: KanbanPerson[]
  /** Which cards show; hidden cards keep their place. */
  visible?: (card: KanbanCard) => boolean
  /** Persist a move. Reject to roll it back. */
  onMoveCard?: (move: CardMove) => Promise<void>
  /** Persist the new column order. Reject to roll it back. */
  onMoveColumns?: (columnIds: string[]) => Promise<void>
  /** Persist a new card (added or duplicated). Reject to remove it again. */
  onCreateCard?: (card: KanbanCard) => Promise<void>
  /** Persist a delete. Reject to bring the card back. */
  onDeleteCard?: (card: KanbanCard) => Promise<void>
  "aria-label"?: string
  className?: string
}) {
  const { columns, cards, pending, ...ops } = useBoardOperations(
    initialColumns,
    initialCards,
    { onMoveCard, onMoveColumns, onCreateCard, onDeleteCard }
  )
  const { applyMove, moveTo, addCard, duplicate, remove, reorderColumns } = ops
  const [openId, setOpenId] = React.useState<string | null>(null)
  const drag = useBoardDrag({ columns, cards, applyMove, reorderColumns })
  const { activeId, draft, overColumn } = drag
  const today = useToday()
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)")
  const contextId = React.useId()

  const lookups = React.useMemo<Lookups>(
    () => ({
      labels: new Map(labels.map((l) => [l.id, l])),
      people: new Map(people.map((p) => [p.id, p])),
      columns: new Map(columns.map((c) => [c.id, c])),
    }),
    [labels, people, columns]
  )

  const shown = draft ?? cards
  const { byColumn, totals } = React.useMemo(() => {
    const byColumn = new Map<string, KanbanCard[]>()
    const totals = new Map<string, number>()
    for (const c of columns) {
      byColumn.set(c.id, [])
      totals.set(c.id, 0)
    }
    for (const card of shown) {
      totals.set(card.columnId, (totals.get(card.columnId) ?? 0) + 1)
      if (card.id === activeId || !visible || visible(card))
        byColumn.get(card.columnId)?.push(card)
    }
    return { byColumn, totals }
  }, [shown, columns, visible, activeId])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    // A press, not a swipe: a horizontal swipe still scrolls the board.
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: columnAwareCoordinates,
      // Enter opens the card, so only Space lifts and drops.
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space"] },
    })
  )

  const announcements = boardAnnouncements({
    columns,
    shown,
    byColumn,
    columnById: lookups.columns,
  })


  const activeCard =
    activeId && !isColumnKey(activeId)
      ? shown.find((c) => c.id === activeId)
      : undefined
  const openCard = openId ? cards.find((c) => c.id === openId) : undefined

  return (
    <DndContext
      id={contextId}
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={drag.onDragStart}
      onDragOver={drag.onDragOver}
      onDragEnd={drag.onDragEnd}
      onDragCancel={({ active }) => drag.reset(active.id)}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            "To move, press Space. Use the arrow keys to move, Space to drop, Escape to cancel. Press Enter to open.",
        },
      }}
    >
      <ScrollArea
        orientation="horizontal"
        className={cn("h-full min-h-0 flex-1", className)}
        viewportProps={{
          "aria-label": ariaLabel,
          className: "[&>div]:h-full",
          role: "region",
        }}
      >
        <SortableContext
          items={columns.map((c) => columnKey(c.id))}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex h-full gap-3 pb-3">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                cards={byColumn.get(column.id) ?? []}
                total={totals.get(column.id) ?? 0}
                overHighlight={!!activeCard && overColumn === column.id}
                onAdd={addCard}
              >
                {(list) =>
                  list.map((card) => (
                    <SortableCard
                      key={card.id}
                      card={card}
                      lookups={lookups}
                      today={today}
                      pending={pending.has(card.id)}
                      columns={columns}
                      onOpen={setOpenId}
                      onMoveTo={moveTo}
                      onDuplicate={duplicate}
                      onDelete={(c) => void remove(c)}
                    />
                  ))
                }
              </Column>
            ))}
          </div>
        </SortableContext>
      </ScrollArea>
      <DragOverlay dropAnimation={reduced ? null : undefined}>
        {activeCard && (
          <CardFace
            card={activeCard}
            lookups={lookups}
            today={today}
            overlay
            className="cursor-grabbing"
          />
        )}
      </DragOverlay>
      <CardSheet
        card={openCard}
        columns={columns}
        lookups={lookups}
        today={today}
        onClose={() => setOpenId(null)}
        onMoveTo={moveTo}
        onDuplicate={duplicate}
        onDelete={(c) => void remove(c)}
      />
    </DndContext>
  )
}

export { KanbanBoard }
