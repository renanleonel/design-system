"use client"

import * as React from "react"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import {
  ActivityFeed,
  useActivityPages,
  type ActivityEvent,
} from "@/components/blocks/activity-feed/activity-feed"
import { buildSampleActivity } from "@/components/blocks/activity-feed/sample-data"
import { useMounted } from "@/hooks/use-mounted"
import { useSearchParams } from "@/hooks/use-url-state"

// Demo-only fixtures for `?data=worst|empty|one|many` (docs/WORKFLOWS.md → Stress-test).
const LONG_NAME = "Maria Eduarda dos Santos Albuquerque Cavalcanti"
const LONG_TARGET =
  "Atualização urgente sobre a renovação do contrato de prestação de serviços de infraestrutura em nuvem para o exercício fiscal de 2027, incluindo anexos e aditivos"

function worstEvents(now: Date): ActivityEvent[] {
  const at = (m: number) => new Date(now.getTime() - m * 60_000).toISOString()
  return [
    {
      id: "w1",
      type: "comment",
      actor: { name: LONG_NAME },
      at: at(2),
      target: LONG_TARGET,
      href: "#",
      body: `${"Texto longo sem quebras ".repeat(12)} https://example.com/${"a-very-long-path-segment-".repeat(6)}`,
    },
    {
      id: "w2",
      type: "upload",
      actor: { name: "Jo" },
      at: at(30),
      target: "first.last+billing-notifications@example.com",
      file: {
        name: "relatorio-trimestral-final-revisado-v12-assinado-digitalmente-por-todas-as-partes-interessadas.pdf",
        size: "12,4 MB",
      },
    },
    {
      id: "w3",
      type: "mention",
      actor: { name: "王秀英" },
      at: at(60),
      target: "关于第三季度路线图的更新：请在周五之前检查账单数字",
      body: "你好，请在周五之前确认账单数字。謝謝！",
    },
    {
      id: "w4",
      type: "comment",
      actor: { name: "فاطمة الزهراء" },
      at: at(90),
      target: "تحديث بشأن خارطة الطريق للربع الثالث",
      body: "مرحبا رينان، هل يمكنك مراجعة الأرقام قبل يوم الجمعة؟",
    },
    {
      id: "w5",
      type: "status",
      actor: { name: LONG_NAME },
      at: at(120),
      target: "Billing",
      from: "In review, waiting on the finance team's approval of the forecast",
      to: "Done, shipped to production behind a feature flag",
    },
    {
      id: "w6",
      type: "assignment",
      actor: { name: "Renan Leonel" },
      at: at(150),
      target: "Q3 roadmap",
      assignee: LONG_NAME,
    },
    ...Array.from({ length: 7 }, (_, i): ActivityEvent => ({
      id: `w-run-${i}`,
      type: "status",
      actor: { name: "Ana Souza" },
      at: at(200 + i * 3),
      target: `Task ${i + 1}`,
      from: "Todo",
      to: "In progress",
    })),
    ...buildSampleActivity(new Date(now.getTime() - 200 * 60_000), 30).map(
      (e) => ({
        ...e,
        id: `w-s-${e.id}`,
      })
    ),
  ]
}

export default function Page() {
  const data = useSearchParams().get("data")
  const mounted = useMounted()
  return (
    <>
      <AppShellHeader
        title="Activity"
        description="Comments, status changes and uploads by day"
      />
      <AppShellContent className="max-w-3xl">
        {mounted && <DemoFeed key={data ?? "default"} data={data} />}
      </AppShellContent>
    </>
  )
}

function DemoFeed({ data }: { data: string | null }) {
  const [now] = React.useState(() => new Date())
  const all = React.useMemo(
    () =>
      data === "worst"
        ? worstEvents(now)
        : data === "empty"
          ? []
          : data === "one"
            ? buildSampleActivity(now, 1)
            : buildSampleActivity(now, data === "many" ? 5_000 : 120),
    [data, now]
  )
  const pages = useActivityPages(all, { pageSize: data === "many" ? 50 : 20 })
  return (
    <ActivityFeed
      events={pages.events}
      hasMore={pages.hasMore}
      loading={pages.loading}
      error={pages.error}
      onLoadMore={pages.loadMore}
      now={now}
    />
  )
}
