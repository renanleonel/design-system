"use client"

import * as React from "react"
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core"

import { columnOfKey, isColumnKey } from "./board-dnd"
import {
  nextInColumn,
  placeCard,
  type CardMove,
  type KanbanCard,
  type KanbanColumn,
} from "./board-model"

export function useBoardDrag({
  columns,
  cards,
  applyMove,
  reorderColumns,
}: {
  columns: KanbanColumn[]
  cards: KanbanCard[]
  applyMove: (move: CardMove) => Promise<void>
  reorderColumns: (from: number, to: number) => Promise<void>
}) {
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null)
  const [draft, setDraft] = React.useState<KanbanCard[] | null>(null)
  const [overColumn, setOverColumn] = React.useState<string | null>(null)

  const reset = (id?: UniqueIdentifier | null) => {
    // The card remounts in its new column, which drops focus: put it back.
    if (id && !isColumnKey(id))
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>(
            `[data-card-id="${window.CSS.escape(String(id))}"]`
          )
          ?.focus({ preventScroll: true })
      )
    setActiveId(null)
    setDraft(null)
    setOverColumn(null)
  }

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id)
    if (!isColumnKey(active.id)) setDraft(cards)
  }

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || isColumnKey(active.id) || !draft) return
    const overColumnId = isColumnKey(over.id)
      ? columnOfKey(over.id)
      : draft.find((c) => c.id === over.id)?.columnId
    if (!overColumnId) return
    setOverColumn(overColumnId)
    const activeCard = draft.find((c) => c.id === active.id)
    if (!activeCard || activeCard.columnId === overColumnId) return
    if (isColumnKey(over.id)) {
      setDraft(placeCard(draft, activeCard.id, overColumnId, null))
      return
    }
    const rect = active.rect.current.translated
    const below = !!rect && rect.top > over.rect.top + over.rect.height / 2
    setDraft(
      placeCard(
        draft,
        activeCard.id,
        overColumnId,
        below ? nextInColumn(draft, String(over.id)) : String(over.id)
      )
    )
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const working = draft
    reset(active.id)
    if (!over) return
    if (isColumnKey(active.id)) {
      const from = columns.findIndex((c) => c.id === columnOfKey(active.id))
      const to = columns.findIndex((c) => c.id === columnOfKey(over.id))
      if (from >= 0 && to >= 0 && from !== to) void reorderColumns(from, to)
      return
    }
    if (!working) return
    const id = String(active.id)
    let after = working
    const activeCard = working.find((c) => c.id === id)
    const overCard = isColumnKey(over.id)
      ? undefined
      : working.find((c) => c.id === over.id)
    if (
      activeCard &&
      overCard &&
      overCard.id !== id &&
      overCard.columnId === activeCard.columnId
    ) {
      const ai = working.indexOf(activeCard)
      const oi = working.indexOf(overCard)
      after = placeCard(
        working,
        id,
        activeCard.columnId,
        ai < oi ? nextInColumn(working, overCard.id) : overCard.id
      )
    }
    const original = cards.find((c) => c.id === id)
    const landed = after.find((c) => c.id === id)
    if (!original || !landed) return
    const fromBeforeId = nextInColumn(cards, id)
    const beforeId = nextInColumn(after, id)
    if (original.columnId === landed.columnId && fromBeforeId === beforeId)
      return
    void applyMove({
      cardId: id,
      fromColumnId: original.columnId,
      fromBeforeId,
      toColumnId: landed.columnId,
      beforeId,
    })
  }

  return {
    activeId,
    draft,
    overColumn,
    reset,
    onDragStart,
    onDragOver,
    onDragEnd,
  }
}
