"use client"

import * as React from "react"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import { Inbox, type MailThread } from "@/components/blocks/inbox/inbox"
import {
  SAMPLE_LABELS,
  SAMPLE_ME,
  buildSampleThreads,
} from "@/components/blocks/inbox/sample-data"
import { useMounted } from "@/hooks/use-mounted"
import { useSearchParams } from "@/hooks/use-url-state"

// Demo-only fixtures for `?data=worst|empty|one|many` (docs/WORKFLOWS.md → Stress-test).
const LONG_NAME = "Maria Eduarda dos Santos Albuquerque Cavalcanti"
const LONG_EMAIL =
  "maria.eduarda.cavalcanti+faturamento-notificacoes@northwind-industries-holdings.example.com"

function worstThreads(now: Date): MailThread[] {
  const at = (minutes: number) =>
    new Date(now.getTime() - minutes * 60_000).toISOString()
  const base = buildSampleThreads(now, 4).map((t) => ({
    ...t,
    folder: "inbox" as const,
    unread: true,
  }))
  const special: MailThread[] = [
    {
      id: "w-long",
      folder: "inbox",
      subject:
        "Re: Re: Fwd: Atualização urgente sobre a renovação do contrato de prestação de serviços de infraestrutura em nuvem para o exercício fiscal de 2027, incluindo anexos, aditivos e a revisão das cláusulas de reajuste anual",
      participant: { name: LONG_NAME, email: LONG_EMAIL },
      labels: ["work", "billing", "design", "urgent"],
      unread: true,
      messages: [
        {
          id: "w-long-1",
          from: { name: LONG_NAME, email: LONG_EMAIL },
          at: at(5),
          body: `Prezado Renan,\n\nSegue o link para o documento: https://example.com/${"a-very-long-path-segment-".repeat(8)}index.html\n\nE o e-mail do responsável: ${LONG_EMAIL}\n\n${"Texto longo sem quebras ".repeat(30)}`,
        },
      ],
    },
    {
      id: "w-short",
      folder: "inbox",
      subject: "Ok",
      participant: { name: "Jo", email: "jo@a.test" },
      labels: [],
      unread: false,
      messages: [
        { id: "w-short-1", from: { name: "Jo", email: "jo@a.test" }, at: at(30), body: "👍" },
      ],
    },
    {
      id: "w-email",
      folder: "inbox",
      subject: "first.last+billing-notifications@example.com",
      participant: {
        name: "first.last+billing-notifications-and-more@a-very-long-company-domain-name.example.com",
        email: "first.last+billing-notifications-and-more@a-very-long-company-domain-name.example.com",
      },
      labels: ["billing"],
      unread: true,
      messages: [
        {
          id: "w-email-1",
          from: {
            name: "first.last+billing-notifications-and-more@a-very-long-company-domain-name.example.com",
            email: "first.last+billing-notifications-and-more@a-very-long-company-domain-name.example.com",
          },
          at: at(45),
          body: "Please confirm the address above.",
        },
      ],
    },
    {
      id: "w-cjk",
      folder: "inbox",
      subject: "关于第三季度路线图的更新：请在周五之前检查账单数字",
      participant: { name: "王秀英", email: "wang.xiuying@example.com" },
      labels: ["work"],
      unread: true,
      messages: [
        {
          id: "w-cjk-1",
          from: { name: "王秀英", email: "wang.xiuying@example.com" },
          at: at(70),
          body: "你好，请在周五之前确认账单数字。谢谢！\n\n東京オフィスの請求書もご確認ください。",
        },
      ],
    },
    {
      id: "w-ar",
      folder: "inbox",
      subject: "تحديث بشأن خارطة الطريق للربع الثالث وأرقام الفواتير",
      participant: { name: "فاطمة الزهراء", email: "fatima@example.com" },
      labels: ["design"],
      unread: false,
      messages: [
        {
          id: "w-ar-1",
          from: { name: "فاطمة الزهراء", email: "fatima@example.com" },
          at: at(95),
          body: "مرحبا رينان، هل يمكنك مراجعة الأرقام قبل يوم الجمعة؟ شكرا لك.",
        },
        {
          id: "w-ar-2",
          from: SAMPLE_ME,
          at: at(80),
          body: "Claro, vou revisar hoje.",
        },
      ],
    },
  ]
  return [...special, ...base]
}

export default function Page() {
  const data = useSearchParams().get("data")
  // Times are relative to "now", so wait for the client to keep markup equal.
  const mounted = useMounted()
  return (
    <>
      <AppShellHeader
        title="Mail"
        description="Conversations, search and bulk actions with the keyboard"
      />
      <AppShellContent fill className="min-h-0 flex-1">
        {mounted && <DemoInbox key={data ?? "default"} data={data} />}
      </AppShellContent>
    </>
  )
}

function DemoInbox({ data }: { data: string | null }) {
  const [now] = React.useState(() => new Date())
  const threads =
    data === "worst"
      ? worstThreads(now)
      : data === "empty"
        ? []
        : data === "one"
          ? buildSampleThreads(now, 1)
          : data === "many"
            ? buildSampleThreads(now, 10_000).map((t, i) => ({
                ...t,
                folder: i % 17 === 0 ? ("archive" as const) : ("inbox" as const),
              }))
            : buildSampleThreads(now)
  return (
    <Inbox
      className="min-h-0 flex-1"
      threads={threads}
      labels={SAMPLE_LABELS}
      me={SAMPLE_ME}
      now={now}
    />
  )
}
