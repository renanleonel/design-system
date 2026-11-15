"use client"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import type {
  KanbanCard,
  KanbanColumn,
  KanbanPerson,
} from "@/components/blocks/kanban/board-model"
import {
  SAMPLE_COLUMNS,
  SAMPLE_LABELS,
  SAMPLE_PEOPLE,
  TasksBoard,
} from "@/components/blocks/kanban/tasks-board"
import { useSearchParams } from "@/hooks/use-url-state"

// Demo-only fixtures for `?data=worst|many|empty|one` (docs/WORKFLOWS.md → Stress-test).
const WORST_PEOPLE: KanbanPerson[] = [
  ...SAMPLE_PEOPLE,
  {
    id: "w1",
    name: "Maria Eduarda dos Santos Albuquerque Cavalcanti",
  },
  { id: "w2", name: "Jo" },
  { id: "w3", name: "王秀英" },
  { id: "w4", name: "محمد بن عبد الله الفاسي" },
]
const PERSON_IDS = WORST_PEOPLE.map((p) => p.id)
const LABEL_IDS = SAMPLE_LABELS.map((l) => l.id)
const TITLES = [
  "Reconciliar lançamentos da Transportadora Nordeste Logística e Distribuição Ltda com o extrato do Banco Aurora",
  "修复登录页面在小屏幕上的布局问题并更新相关文档说明",
  "إصلاح مشكلة عرض لوحة التحكم على الشاشات الصغيرة وتحديث الوثائق",
  "Fix",
  "supercalifragilisticexpialidocious_unbreakable_identifier_that_never_wraps_anywhere_at_all",
  "Revisar contrato com a Construtora Horizonte Empreendimentos e Participações S.A.",
  "Add CSV export",
]
const PRIORITIES = ["urgent", "high", "medium", "low"] as const

function generate(
  columns: KanbanColumn[],
  counts: (index: number) => number
): KanbanCard[] {
  const cards: KanbanCard[] = []
  columns.forEach((column, ci) => {
    for (let i = 0; i < counts(ci); i++) {
      const n = ci * 1000 + i
      cards.push({
        id: `g${n}`,
        columnId: column.id,
        title: TITLES[n % TITLES.length],
        description: "Generated for the stress test.",
        priority: PRIORITIES[n % 4],
        labelIds: LABEL_IDS.slice(0, n % 4),
        assigneeIds: PERSON_IDS.slice(n % 3, (n % 3) + (n % 6)),
        due: n % 3 === 0 ? `2026-1${(n % 2) + 1}-${10 + (n % 18)}` : undefined,
      })
    }
  })
  return cards
}

const WORST_COLUMNS: KanbanColumn[] = [
  {
    id: "k0",
    title:
      "Em andamento: integração com o Banco Aurora e Transportes Rápido Sul",
    wipLimit: 3,
  },
  { id: "k1", title: "Backlog" },
  { id: "k2", title: "待办事项", wipLimit: 5 },
  { id: "k3", title: "قيد المراجعة", wipLimit: 2 },
  { id: "k4", title: "Empty" },
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `k${i + 5}`,
    title: `Column ${i + 6}`,
    wipLimit: i % 2 ? 4 : undefined,
  })),
]

export default function BoardPage() {
  const data = useSearchParams().get("data")
  let props: Parameters<typeof TasksBoard>[0] = {}
  if (data === "worst") {
    // 12 columns, 200 cards in the first, empty ones, long and non-Latin text.
    props = {
      columns: WORST_COLUMNS,
      people: WORST_PEOPLE,
      cards: generate(WORST_COLUMNS, (ci) =>
        ci === 0 ? 200 : ci === 1 ? 3 : ci === 4 ? 0 : ci % 3 === 0 ? 0 : ci
      ),
    }
  } else if (data === "many") {
    props = {
      columns: WORST_COLUMNS,
      people: WORST_PEOPLE,
      cards: generate(WORST_COLUMNS, () => 40),
    }
  } else if (data === "empty") {
    props = { columns: SAMPLE_COLUMNS, cards: [] }
  } else if (data === "one") {
    const column = SAMPLE_COLUMNS[0]
    props = { columns: [column], cards: generate([column], () => 1) }
  }
  return (
    <>
      <AppShellHeader
        title="Board"
        description="Drag cards between columns; every move saves on its own"
      />
      <AppShellContent fill>
        <TasksBoard key={data} {...props} />
      </AppShellContent>
    </>
  )
}
