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

// Only what the handle needs (no refs), so render never reads a ref.
type HandleContext = Pick<
  ReturnType<typeof useSortable>,
  "attributes" | "listeners" | "setActivatorNodeRef"
> | null
const SortableHandleContext = React.createContext<HandleContext>(null)

/**
 * A vertically reorderable list (dnd-kit).
 * - Pointer: drag by the handle; neighbours slide out of the way.
 * - Keyboard: focus the handle, Space to lift, arrows to move, Space to drop,
 *   Escape to cancel. Moves are announced to screen readers via `getLabel`.
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
  children,
}: {
  items: T[]
  getId: (item: T) => UniqueIdentifier
  onReorder: (items: T[]) => void
  /** Human name of an item, for screen reader announcements. */
  getLabel?: (item: T) => string
  children: React.ReactNode
}) {
  const sensors = useSensors(
    // A few pixels of travel before dragging, so a click on the handle stays a click.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(OverlaySafeKeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
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
        {children}
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
  className,
  children,
}: {
  id: UniqueIdentifier
  className?: string
  children: React.ReactNode
}) {
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
      value={{ attributes, listeners, setActivatorNodeRef }}
    >
      <div
        ref={setNodeRef}
        data-slot="sortable-item"
        data-dragging={isDragging || undefined}
        style={{
          transform: CSS.Translate.toString(transform),
          transition,
        }}
        className="relative data-dragging:z-10"
      >
        <div
          className={cn(
            "-m-1.5 rounded-xl p-1.5 transition-[scale,box-shadow,background-color] duration-150 ease-out motion-reduce:transition-none",
            "in-data-dragging:scale-[1.02] in-data-dragging:bg-background in-data-dragging:shadow-popover",
            className
          )}
        >
          {children}
        </div>
      </div>
    </SortableHandleContext>
  )
}

/** The grip that starts a drag (pointer or keyboard). Must be inside a SortableItem. */
function SortableHandle({
  label = "Reorder",
  className,
}: {
  label?: string
  className?: string
}) {
  const context = React.useContext(SortableHandleContext)
  if (!context) throw new Error("SortableHandle must be inside SortableItem")
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
