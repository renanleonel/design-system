export type Priority = "urgent" | "high" | "medium" | "low"

export type KanbanColumn = {
  id: string
  title: string
  /** Work-in-progress limit: the column warns at the limit and past it. */
  wipLimit?: number
}

export type KanbanLabel = {
  id: string
  name: string
  tone: "gray" | "blue" | "green" | "amber" | "orange" | "red" | "purple"
}

export type KanbanPerson = { id: string; name: string }

export type KanbanCard = {
  id: string
  columnId: string
  title: string
  description?: string
  labelIds: string[]
  assigneeIds: string[]
  /** `YYYY-MM-DD`. */
  due?: string
  priority: Priority
}

/** What a move changed: enough to persist it, or to undo it. */
export type CardMove = {
  cardId: string
  fromColumnId: string
  /** The card that followed it before the move (`null`: it was last). */
  fromBeforeId: string | null
  toColumnId: string
  /** The card now right after this one in the target column (`null`: last). */
  beforeId: string | null
}

/**
 * Cards live in one flat list; a column's order is the order of its cards in
 * it. Places `id` in `columnId`, right before `beforeId` (or last).
 */
export function placeCard(
  cards: KanbanCard[],
  id: string,
  columnId: string,
  beforeId: string | null
): KanbanCard[] {
  const card = cards.find((c) => c.id === id)
  if (!card) return cards
  const rest = cards.filter((c) => c.id !== id)
  const moved = { ...card, columnId }
  let index = beforeId ? rest.findIndex((c) => c.id === beforeId) : -1
  if (index < 0) {
    // Last in the column: right after its final card, else at the end.
    const last = rest.findLastIndex((c) => c.columnId === columnId)
    index = last < 0 ? rest.length : last + 1
  }
  return [...rest.slice(0, index), moved, ...rest.slice(index)]
}

/** The card after `id` within its own column, in the flat list. */
export function nextInColumn(cards: KanbanCard[], id: string): string | null {
  const index = cards.findIndex((c) => c.id === id)
  if (index < 0) return null
  const columnId = cards[index].columnId
  return cards.slice(index + 1).find((c) => c.columnId === columnId)?.id ?? null
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}
