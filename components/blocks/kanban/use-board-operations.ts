"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  moveItem,
  nextInColumn,
  placeCard,
  type CardMove,
  type KanbanCard,
  type KanbanColumn,
} from "./board-model"
import { toastUndo } from "@/components/ui/sonner"

export type BoardCallbacks = {
  onMoveCard?: (move: CardMove) => Promise<void>
  onMoveColumns?: (columnIds: string[]) => Promise<void>
  onCreateCard?: (card: KanbanCard) => Promise<void>
  onDeleteCard?: (card: KanbanCard) => Promise<void>
}

export function useBoardOperations(
  initialColumns: KanbanColumn[],
  initialCards: KanbanCard[],
  { onMoveCard, onMoveColumns, onCreateCard, onDeleteCard }: BoardCallbacks
) {
  const [columns, setColumns] = React.useState(initialColumns)
  const [cards, setCards] = React.useState(initialCards)
  const [pending, setPending] = React.useState<ReadonlySet<string>>(new Set())

  const withPending = (id: string, on: boolean) =>
    setPending((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  async function applyMove(move: CardMove) {
    const card = cards.find((c) => c.id === move.cardId)
    setCards((prev) =>
      placeCard(prev, move.cardId, move.toColumnId, move.beforeId)
    )
    if (!onMoveCard) return
    withPending(move.cardId, true)
    try {
      await onMoveCard(move)
    } catch (error) {
      setCards((prev) =>
        placeCard(prev, move.cardId, move.fromColumnId, move.fromBeforeId)
      )
      toast.error(`Couldn't move ${card?.title ?? "the card"}`, {
        description:
          error instanceof Error ? error.message : "It went back where it was.",
        action: { label: "Retry", onClick: () => void applyMove(move) },
      })
    } finally {
      withPending(move.cardId, false)
    }
  }

  function moveTo(card: KanbanCard, columnId: string) {
    if (card.columnId === columnId) return
    void applyMove({
      cardId: card.id,
      fromColumnId: card.columnId,
      fromBeforeId: nextInColumn(cards, card.id),
      toColumnId: columnId,
      beforeId: null,
    })
  }

  async function createCard(card: KanbanCard, after?: string) {
    setCards((prev) => {
      const at = after ? prev.findIndex((c) => c.id === after) : -1
      return at < 0
        ? placeCard([...prev, card], card.id, card.columnId, null)
        : placeCard(
            [...prev, card],
            card.id,
            card.columnId,
            nextInColumn(prev, after!)
          )
    })
    if (!onCreateCard) return
    withPending(card.id, true)
    try {
      await onCreateCard(card)
    } catch (error) {
      setCards((prev) => prev.filter((c) => c.id !== card.id))
      toast.error(`Couldn't add ${card.title}`, {
        description: error instanceof Error ? error.message : undefined,
        action: { label: "Retry", onClick: () => void createCard(card, after) },
      })
    } finally {
      withPending(card.id, false)
    }
  }

  function addCard(columnId: string, title: string) {
    void createCard({
      id: `card-${crypto.randomUUID()}`,
      columnId,
      title,
      labelIds: [],
      assigneeIds: [],
      priority: "medium",
    })
  }

  function duplicate(card: KanbanCard) {
    void createCard(
      {
        ...card,
        id: `card-${crypto.randomUUID()}`,
        title: `${card.title} (copy)`,
      },
      card.id
    )
  }

  async function remove(card: KanbanCard) {
    const beforeId = nextInColumn(cards, card.id)
    const restore = () => {
      setCards((prev) =>
        prev.some((c) => c.id === card.id)
          ? prev
          : placeCard([...prev, card], card.id, card.columnId, beforeId)
      )
    }
    setCards((prev) => prev.filter((c) => c.id !== card.id))
    try {
      await onDeleteCard?.(card)
    } catch (error) {
      restore()
      toast.error(`Couldn't delete ${card.title}`, {
        description: error instanceof Error ? error.message : undefined,
      })
      return
    }
    toastUndo(`Deleted ${card.title}`, {
      onUndo: () => {
        restore()
        void onCreateCard?.(card)
      },
    })
  }

  async function reorderColumns(from: number, to: number) {
    const previous = columns
    const next = moveItem(columns, from, to)
    setColumns(next)
    try {
      await onMoveColumns?.(next.map((c) => c.id))
    } catch (error) {
      setColumns(previous)
      toast.error("Couldn't reorder the columns", {
        description: error instanceof Error ? error.message : "They went back.",
        action: {
          label: "Retry",
          onClick: () => void reorderColumns(from, to),
        },
      })
    }
  }

  return {
    columns,
    cards,
    pending,
    applyMove,
    moveTo,
    addCard,
    duplicate,
    remove,
    reorderColumns,
  }
}
