"use client"

import { addDays, startOfDay } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import { Schedule } from "@/components/blocks/schedule/schedule"
import { createSampleEvents } from "@/components/blocks/schedule/schedule-sample"
import type { ScheduleEvent } from "@/components/blocks/schedule/schedule-utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { setSearchParams, useSearchParams } from "@/hooks/use-url-state"

// A fixed "now" keeps server and client markup equal and the audit deterministic.
const NOW = new Date(2026, 10, 12, 10, 24)

const at = (offset: number, h: number, m = 0) => {
  const d = addDays(startOfDay(NOW), offset)
  d.setHours(h, m)
  return d
}

const LONG_TITLES = [
  "Reunião de alinhamento sobre a reestruturação do departamento de infraestrutura e operações",
  "Maria Eduarda dos Santos Albuquerque Cavalcanti: apresentação trimestral",
  "João Pedro de Oliveira Neto / Beatriz Lima: revisão de contrato",
  "王秀英的季度评审会议",
  "اجتماع مراجعة الميزانية السنوية مع فريق المبيعات",
  "Supercalifragilisticexpialidocious-planning-session-with-an-unbreakable-title",
  "Jo",
]

// Demo-only fixtures for `?data=worst|many|one|empty` (docs/WORKFLOWS.md → Stress-test).
function worstEvents(): ScheduleEvent[] {
  const tones = [
    "blue",
    "green",
    "amber",
    "orange",
    "red",
    "purple",
    "gray",
  ] as const
  // 30 events inside one hour on Thursday: the cluster folds into "+N".
  const pile: ScheduleEvent[] = Array.from({ length: 30 }, (_, i) => ({
    id: `pile-${i}`,
    title: LONG_TITLES[i % LONG_TITLES.length],
    start: at(0, 14, (i * 2) % 40),
    end: at(0, 14 + (i % 3 === 0 ? 1 : 0), 20 + ((i * 7) % 40)),
    tone: tones[i % tones.length],
    location: "Sala de reuniões Av. Paulista, 1000, 12º andar",
  }))
  return [
    ...pile,
    {
      id: "multi-1",
      title:
        "Congresso Brasileiro de Engenharia de Software e Sistemas Distribuídos",
      start: at(-1, 0),
      end: at(3, 0),
      allDay: true,
      tone: "purple",
    },
    {
      id: "multi-2",
      title: "Viagem a São José dos Campos (Renan Leonel)",
      start: at(2, 18, 0),
      end: at(4, 9, 0),
      tone: "orange",
    },
    {
      id: "multi-3",
      title: "ThisIsAnUnbreakableFiftyCharacterWordWithoutAnySpaces",
      start: at(5, 0),
      end: at(12, 0),
      allDay: true,
      tone: "red",
    },
    ...LONG_TITLES.map((title, i) => ({
      id: `long-${i}`,
      title,
      start: at(-3 + i, 9, 0),
      end: at(-3 + i, 10, 0),
      tone: tones[(i + 2) % tones.length],
    })),
    ...LONG_TITLES.map((title, i) => ({
      id: `day-${i}`,
      title,
      start: at(7 + i, 0),
      end: at(7 + i, 0),
      allDay: true,
      tone: tones[i % tones.length],
    })),
    // Busy month cells: the "+N more" popover.
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `busy-${i}`,
      title: `Reunião ${i + 1}`,
      start: at(-6, 8 + i, 0),
      end: at(-6, 8 + i, 45),
      tone: tones[i % tones.length],
    })),
  ]
}

function manyEvents(): ScheduleEvent[] {
  const tones = [
    "blue",
    "green",
    "amber",
    "orange",
    "red",
    "purple",
    "gray",
  ] as const
  return [
    ...createSampleEvents(NOW),
    ...Array.from({ length: 160 }, (_, i) => ({
      id: `many-${i}`,
      title: `Compromisso ${i + 1}`,
      start: at((i % 28) - 10, 8 + ((i * 3) % 10), (i % 2) * 30),
      end: at((i % 28) - 10, 9 + ((i * 3) % 10), (i % 2) * 30),
      tone: tones[i % tones.length],
    })),
  ]
}

function eventsFor(data: string | null) {
  switch (data) {
    case "worst":
      return worstEvents()
    case "many":
      return manyEvents()
    case "one":
      return createSampleEvents(NOW).slice(1, 2)
    case "empty":
      return []
    default:
      return createSampleEvents(NOW)
  }
}

export default function Page() {
  const params = useSearchParams()
  const data = params.get("data")
  const lang = params.get("lang") === "pt-BR" ? "pt-BR" : "en-US"
  return (
    <>
      <AppShellHeader
        title={lang === "pt-BR" ? "Agenda" : "Schedule"}
        description={
          lang === "pt-BR"
            ? "Mês, semana e dia, com criação por clique"
            : "Month, week and day, with click-to-create"
        }
        actions={
          <Tabs
            value={lang}
            onValueChange={(v) =>
              setSearchParams({ lang: v === "en-US" ? null : String(v) })
            }
          >
            <TabsList variant="segmented" aria-label="Language">
              <TabsTrigger value="en-US">EN</TabsTrigger>
              <TabsTrigger value="pt-BR">PT</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />
      <AppShellContent fill>
        <Schedule
          key={`${data}-${lang}`}
          events={eventsFor(data)}
          locale={lang === "pt-BR" ? ptBR : enUS}
          now={NOW}
        />
      </AppShellContent>
    </>
  )
}
