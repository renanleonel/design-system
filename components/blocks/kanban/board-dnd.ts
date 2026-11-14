import {
  closestCenter,
  closestCorners,
  type Announcements,
  type CollisionDetection,
  type KeyboardCoordinateGetter,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"

import type { KanbanCard, KanbanColumn } from "./board-model"

export const columnKey = (id: string) => `column:${id}`
export const isColumnKey = (id: UniqueIdentifier) =>
  String(id).startsWith("column:")
export const columnOfKey = (id: UniqueIdentifier) => String(id).slice(7)

/**
 * Arrow keys step through droppables beside the dragged item. A column's own
 * cards sit beside it too, so while dragging a column only columns count.
 */
export const columnAwareCoordinates: KeyboardCoordinateGetter = (
  event,
  args
) => {
  const { context } = args
  if (!context.active || !isColumnKey(context.active.id))
    return sortableKeyboardCoordinates(event, args)
  const all = context.droppableContainers
  const columnsOnly = {
    getEnabled: () => all.getEnabled().filter((c) => isColumnKey(c.id)),
    get: (id: UniqueIdentifier) => all.get(id),
  } as unknown as typeof all
  return sortableKeyboardCoordinates(event, {
    ...args,
    context: { ...context, droppableContainers: columnsOnly },
  })
}

export const collisionDetection: CollisionDetection = (args) => {
  if (isColumnKey(args.active.id))
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter((c) =>
        isColumnKey(c.id)
      ),
    })
  const hit = closestCorners(args)[0]
  if (!hit) return []
  if (!isColumnKey(hit.id)) return [hit]
  // Over a column: prefer its nearest card, else the (empty) column itself.
  const inside = args.droppableContainers.filter(
    (c) => c.data.current?.columnId === columnOfKey(hit.id)
  )
  return inside.length
    ? closestCorners({ ...args, droppableContainers: inside })
    : [hit]
}

/** Screen reader announcements for picking up, moving and dropping. */
export function boardAnnouncements({
  columns,
  shown,
  byColumn,
  columnById,
}: {
  columns: KanbanColumn[]
  shown: KanbanCard[]
  byColumn: Map<string, KanbanCard[]>
  columnById: Map<string, KanbanColumn>
}): Announcements {
  const cardColumn = (id: UniqueIdentifier) =>
    shown.find((c) => c.id === id)?.columnId
  const colTitle = (id: string | undefined) =>
    (id && columnById.get(id)?.title) || "column"
  const positionIn = (id: UniqueIdentifier) => {
    const column = cardColumn(id)
    const list = column ? (byColumn.get(column) ?? []) : []
    return { n: list.findIndex((c) => c.id === id) + 1, of: list.length }
  }
  const cardTitle = (id: UniqueIdentifier) =>
    shown.find((c) => c.id === id)?.title ?? String(id)

  return {
    onDragStart: ({ active }) => {
      if (isColumnKey(active.id)) {
        const i = columns.findIndex((c) => c.id === columnOfKey(active.id))
        return `Picked up column ${colTitle(columnOfKey(active.id))}, position ${i + 1} of ${columns.length}.`
      }
      const { n, of } = positionIn(active.id)
      return `Picked up ${cardTitle(active.id)} from ${colTitle(cardColumn(active.id))}, position ${n} of ${of}.`
    },
    onDragOver: ({ active, over }) => {
      if (!over) return undefined
      if (isColumnKey(active.id)) {
        const i = columns.findIndex((c) => c.id === columnOfKey(over.id))
        return `Column ${colTitle(columnOfKey(active.id))} is over position ${i + 1} of ${columns.length}.`
      }
      if (isColumnKey(over.id))
        return `${cardTitle(active.id)} is over ${colTitle(columnOfKey(over.id))}, which has no cards.`
      const { n, of } = positionIn(over.id)
      return `${cardTitle(active.id)} is over ${colTitle(cardColumn(over.id))}, position ${n} of ${of}.`
    },
    onDragEnd: ({ active, over }) => {
      if (!over)
        return `${isColumnKey(active.id) ? "Column" : cardTitle(active.id)} dropped, nothing changed.`
      if (isColumnKey(active.id)) {
        const i = columns.findIndex((c) => c.id === columnOfKey(over.id))
        return `Dropped column ${colTitle(columnOfKey(active.id))} at position ${i + 1} of ${columns.length}.`
      }
      const column = cardColumn(over.id) ?? columnOfKey(over.id)
      return `Dropped ${cardTitle(active.id)} in ${colTitle(column)}.`
    },
    onDragCancel: ({ active }) =>
      `Moving ${isColumnKey(active.id) ? "the column" : cardTitle(active.id)} cancelled.`,
  }
}
