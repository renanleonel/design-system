"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "cn"
import { GripVerticalIcon } from "lucide-react"

import { useMediaQuery } from "@/hooks/use-media-query"

/**
 * dnd-kit's KeyboardSensor listens for arrow keys on `document` in the bubble
 * phase, and overlays (Base UI dialogs, popovers) stop arrow keys before that,
 * so keyboard sorting silently failed inside a dialog. This sensor listens on
 * `window` in the capture phase and keeps keys to itself while a keyboard drag
 * is active (Escape cancels the drag without also closing the dialog).
 */
type SensorInternals = {
  handleStart: () => void
  handleCancel: () => void
  handleKeyDown: (event: KeyboardEvent) => void
  windowListeners: {
    add: (
      name: string,
      handler: (event: KeyboardEvent) => void,
      options?: AddEventListenerOptions
    ) => void
  }
}
// @ts-expect-error -- overrides KeyboardSensor's private `attach`
class OverlaySafeKeyboardSensor extends KeyboardSensor {
  attach() {
    const self = this as unknown as SensorInternals
    self.handleStart()
    self.windowListeners.add("resize", self.handleCancel)
    self.windowListeners.add("visibilitychange", self.handleCancel)
    const onKeyDown = (event: KeyboardEvent) => {
      self.handleKeyDown(event)
      event.stopPropagation()
    }
    setTimeout(() =>
      self.windowListeners.add("keydown", onKeyDown, { capture: true })
    )
  }
}

// Only what the handle needs (no refs), so render never reads a ref. `null`
// means the whole row drags (the handle is decorative); `undefined` means the
// handle sits outside a SortableItem.
type HandleContext = Pick<
  ReturnType<typeof useSortable>,
  "attributes" | "listeners" | "setActivatorNodeRef"
> | null
const SortableHandleContext = React.createContext<HandleContext | undefined>(
  undefined
)

type DragFrom = "handle" | "item"
const SortableDragFromContext = React.createContext<DragFrom>("handle")

/**
 * A vertically reorderable list (dnd-kit).
 * - Pointer: drag by the handle (`dragFrom="handle"`, default) or anywhere on
 *   the row (`dragFrom="item"`); neighbours slide out of the way. Rows don't
 *   select text, so a drag never highlights it.
 * - Keyboard: focus the handle (or the row with `dragFrom="item"`), Space to
 *   lift, arrows to move, Space to drop, Escape to cancel. Moves are announced
 *   to screen readers via `getLabel`.
 * - `dragFrom="item"` turns the whole row into the drag button, so keep
 *   interactive controls (inputs, buttons, links) out of those rows; use the
 *   handle mode for rows that contain them.
 * - Reduced motion: items jump into place instead of sliding.
 *
 *   <Sortable items={rows} getId={(r) => r.id} onReorder={setRows} getLabel={(r) => r.name}>
 *     {rows.map((r) => (
 *       <SortableItem key={r.id} id={r.id}>
 *         <SortableHandle /> …row…
 *       </SortableItem>
 *     ))}
 *   </Sortable>
 */
function Sortable<T>({
  items,
  getId,
  onReorder,
  getLabel,
  dragFrom = "handle",
  children,
}: {
  items: T[]
  getId: (item: T) => UniqueIdentifier
  onReorder: (items: T[]) => void
  /** Human name of an item, for screen reader announcements. */
  getLabel?: (item: T) => string
  /** Where a drag starts: the grip only, or anywhere on the row. */
  dragFrom?: DragFrom
  children: React.ReactNode
}) {
  const sensors = useSensors(
    // A few pixels of travel before dragging, so a click on the handle stays a click.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(OverlaySafeKeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  // A stable id: dnd-kit's own counter differs between server and client.
  const contextId = React.useId()
  const ids = items.map(getId)
  const label = (id: UniqueIdentifier) => {
    const item = items.find((i) => getId(i) === id)
    return item && getLabel ? getLabel(item) : String(id)
  }
  const position = (id: UniqueIdentifier | undefined) =>
    id === undefined ? 0 : ids.indexOf(id) + 1

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      `Picked up ${label(active.id)}, position ${position(active.id)} of ${ids.length}.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${label(active.id)} moved to position ${position(over.id)} of ${ids.length}.`
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `Dropped ${label(active.id)} at position ${position(over.id)} of ${ids.length}.`
        : undefined,
    onDragCancel: ({ active }) => `Moving ${label(active.id)} cancelled.`,
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    onReorder(arrayMove(items, ids.indexOf(active.id), ids.indexOf(over.id)))
  }

  return (
    <DndContext
      id={contextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={onDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            "To reorder, press Space. Use the arrow keys to move, Space to drop, Escape to cancel.",
        },
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <SortableDragFromContext value={dragFrom}>
          {children}
        </SortableDragFromContext>
      </SortableContext>
    </DndContext>
  )
}

/**
 * One row. Its position animates (on-screen movement: ease-in-out); the row
 * being dragged lifts with a shadow and a slight scale.
 */
function SortableItem({
  id,
  dragFrom: dragFromProp,
  className,
  children,
}: {
  id: UniqueIdentifier
  /** Overrides the list's `dragFrom` for this row. */
  dragFrom?: DragFrom
  className?: string
  children: React.ReactNode
}) {
  const listDragFrom = React.useContext(SortableDragFromContext)
  const dragFrom = dragFromProp ?? listDragFrom
  const whole = dragFrom === "item"
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)")
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id,
    transition: reduced
      ? null
      : { duration: 200, easing: "cubic-bezier(0.77, 0, 0.175, 1)" },
  })
  return (
    <SortableHandleContext
      value={whole ? null : { attributes, listeners, setActivatorNodeRef }}
    >
      <div
        ref={setNodeRef}
        data-slot="sortable-item"
        data-dragging={isDragging || undefined}
        data-drag-from={dragFrom}
        style={{
          transform: CSS.Translate.toString(transform),
          transition,
        }}
        className="relative select-none data-dragging:z-10"
      >
        <div
          ref={whole ? setActivatorNodeRef : undefined}
          {...(whole ? { ...attributes, ...listeners } : {})}
          className={cn(
            "-m-1.5 rounded-xl p-1.5 transition-[scale,box-shadow,background-color] duration-150 ease-out motion-reduce:transition-none",
            "in-data-dragging:scale-[1.02] in-data-dragging:bg-background in-data-dragging:shadow-popover",
            whole &&
              "cursor-grab touch-none focus-ring active:cursor-grabbing in-data-dragging:cursor-grabbing",
            className
          )}
        >
          {children}
        </div>
      </div>
    </SortableHandleContext>
  )
}

/**
 * The grip that starts a drag (pointer or keyboard). Must be inside a
 * SortableItem. With `dragFrom="item"` it is only a visual cue: the row is the
 * button, so the grip renders as a decorative icon.
 */
function SortableHandle({
  label = "Reorder",
  className,
}: {
  label?: string
  className?: string
}) {
  const context = React.useContext(SortableHandleContext)
  if (context === undefined)
    throw new Error("SortableHandle must be inside SortableItem")
  if (context === null)
    return (
      <span
        aria-hidden
        data-slot="sortable-handle"
        className={cn(
          "flex h-control w-4 shrink-0 items-center justify-center text-muted-foreground/60 in-data-dragging:text-foreground",
          className
        )}
      >
        <GripVerticalIcon className="size-4" />
      </span>
    )
  const { attributes, listeners, setActivatorNodeRef } = context
  return (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label={label}
      data-slot="sortable-handle"
      className={cn(
        "hit-area flex h-control w-4 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-muted-foreground/60 focus-ring transition-colors hover:text-foreground active:cursor-grabbing in-data-dragging:cursor-grabbing in-data-dragging:text-foreground",
        className
      )}
      {...attributes}
      {...listeners}
    >
      <GripVerticalIcon className="size-4" />
    </button>
  )
}

export { Sortable, SortableHandle, SortableItem }
