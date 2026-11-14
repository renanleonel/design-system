"use client"

import * as React from "react"

import {
  type KanbanCard,
  type KanbanColumn,
  type KanbanLabel,
  type KanbanPerson,
} from "./board-model"
import { KanbanBoard } from "./kanban-board"
import { Field, FieldLabel } from "@/components/ui/field"
import { MultiSelect } from "@/components/ui/multi-select"
import { Switch } from "@/components/ui/switch"
import { useUrlState } from "@/hooks/use-url-state"

export const SAMPLE_PEOPLE: KanbanPerson[] = [
  { id: "renan", name: "Renan Leonel" },
  { id: "ana", name: "Ana Souza" },
  { id: "joao", name: "João Pedro de Oliveira Neto" },
  { id: "maria", name: "Maria Eduarda Albuquerque" },
  { id: "lucas", name: "Lucas Ferreira" },
]

export const SAMPLE_LABELS: KanbanLabel[] = [
  { id: "bug", name: "Bug", tone: "red" },
  { id: "feature", name: "Feature", tone: "blue" },
  { id: "design", name: "Design", tone: "purple" },
  { id: "docs", name: "Docs", tone: "gray" },
  { id: "infra", name: "Infra", tone: "orange" },
  { id: "research", name: "Research", tone: "green" },
]

export const SAMPLE_COLUMNS: KanbanColumn[] = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "To do", wipLimit: 5 },
  { id: "doing", title: "In progress", wipLimit: 3 },
  { id: "review", title: "Review", wipLimit: 4 },
  { id: "done", title: "Done" },
]

const card = (
  id: string,
  columnId: string,
  title: string,
  priority: KanbanCard["priority"],
  labelIds: string[],
  assigneeIds: string[],
  due?: string,
  description?: string
): KanbanCard => ({
  id,
  columnId,
  title,
  priority,
  labelIds,
  assigneeIds,
  due,
  description,
})

export const SAMPLE_CARDS: KanbanCard[] = [
  card("c1", "backlog", "Audit colour contrast in dark mode", "medium", ["design", "research"], ["maria"], "2026-12-02"),
  card("c2", "backlog", "Document the sidebar resize handle", "low", ["docs"], []),
  card("c3", "backlog", "Export invoices as CSV", "medium", ["feature"], ["lucas"], "2026-12-15", "Finance asked for a monthly export with one row per invoice."),
  card("c4", "todo", "Fix focus loss after closing the dialog", "urgent", ["bug"], ["ana", "renan"], "2026-11-12", "Focus lands on the body instead of the trigger after Escape."),
  card("c5", "todo", "Migrate uploads to signed URLs", "high", ["infra"], ["joao"], "2026-11-28"),
  card("c6", "todo", "Empty state for the team page", "low", ["design"], ["maria"]),
  card("c7", "doing", "Board: keyboard drag between columns", "high", ["feature"], ["renan"], "2026-11-20", "Space lifts, arrows move, Space drops."),
  card("c8", "doing", "Rate limit the public API", "high", ["infra", "feature"], ["joao", "lucas"], "2026-11-25"),
  card("c9", "review", "Tooltip delay on touch", "medium", ["bug"], ["ana"], "2026-11-18"),
  card("c10", "review", "Onboarding checklist copy", "low", ["docs", "design"], ["maria", "renan"]),
  card("c11", "done", "Ship the editable table", "medium", ["feature"], ["renan", "ana", "lucas"], "2026-11-10"),
  card("c12", "done", "Lighthouse pass on the docs site", "medium", ["infra"], ["lucas"], "2026-11-08"),
]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Stand-in for your API. Closing an unassigned card is refused, like a
 * server-side rule the client doesn't know about; `failAll` refuses everything.
 */
async function saveMove(
  toColumnId: string,
  card: KanbanCard | undefined,
  failAll: boolean
) {
  await wait(500 + Math.random() * 500)
  if (failAll) throw new Error("The server is unavailable. Try again.")
  if (toColumnId === "done" && card && card.assigneeIds.length === 0)
    throw new Error("Assign someone before closing a card.")
}

const toList = (value: string) => (value ? value.split(",") : [])

/**
 * Task board: filter by assignee and label (kept in the URL), drag cards and
 * columns, open a card in a sheet. Every change is optimistic and rolls back
 * when the stand-in API refuses it.
 */
export function TasksBoard({
  columns = SAMPLE_COLUMNS,
  cards = SAMPLE_CARDS,
  labels = SAMPLE_LABELS,
  people = SAMPLE_PEOPLE,
}: {
  columns?: KanbanColumn[]
  cards?: KanbanCard[]
  labels?: KanbanLabel[]
  people?: KanbanPerson[]
}) {
  const [assignee, setAssignee] = useUrlState("assignee")
  const [label, setLabel] = useUrlState("label")
  const [failAll, setFailAll] = React.useState(false)

  const assignees = toList(assignee)
  const labelIds = toList(label)
  const visible = React.useMemo(() => {
    if (!assignees.length && !labelIds.length) return undefined
    const wantedAssignees = new Set(assignees)
    const wantedLabels = new Set(labelIds)
    return (c: KanbanCard) =>
      (!wantedAssignees.size || c.assigneeIds.some((a) => wantedAssignees.has(a))) &&
      (!wantedLabels.size || c.labelIds.some((l) => wantedLabels.has(l)))
    // The URL strings are the stable identity of both lists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignee, label])

  const byId = React.useMemo(
    () => new Map(cards.map((c) => [c.id, c])),
    [cards]
  )
  const personOptions = React.useMemo(
    () => people.map((p) => ({ value: p.id, label: p.name })),
    [people]
  )
  const labelOptions = React.useMemo(
    () => labels.map((l) => ({ value: l.id, label: l.name })),
    [labels]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <MultiSelect
          id="board-assignee"
          aria-label="Filter by assignee"
          options={personOptions}
          value={assignees}
          onValueChange={(v) => setAssignee(v.join(",") || null)}
          placeholder="Assignee"
          maxVisible={1}
          className="w-full sm:w-64"
        />
        <MultiSelect
          id="board-label"
          aria-label="Filter by label"
          options={labelOptions}
          value={labelIds}
          onValueChange={(v) => setLabel(v.join(",") || null)}
          placeholder="Label"
          maxVisible={1}
          className="w-full sm:w-64"
        />
        <Field orientation="horizontal" className="w-auto sm:ms-auto">
          <Switch
            id="simulate-board-errors"
            checked={failAll}
            onCheckedChange={setFailAll}
          />
          <FieldLabel htmlFor="simulate-board-errors">
            Simulate server errors
          </FieldLabel>
        </Field>
      </div>
      <KanbanBoard
        aria-label="Tasks"
        columns={columns}
        cards={cards}
        labels={labels}
        people={people}
        visible={visible}
        onMoveCard={(move) =>
          saveMove(move.toColumnId, byId.get(move.cardId), failAll)
        }
        onMoveColumns={() => saveMove("", undefined, failAll)}
        onCreateCard={() => saveMove("", undefined, failAll)}
        onDeleteCard={() => saveMove("", undefined, failAll)}
      />
    </div>
  )
}
