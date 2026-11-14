"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  BellIcon,
  CreditCardIcon,
  FilePlusIcon,
  FolderKanbanIcon,
  HandshakeIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LinkIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  CommandPalette,
  type PaletteCommand,
} from "@/components/blocks/command-palette/command-palette"
import { Button } from "@/components/ui/button"
import { Hotkey } from "@/components/ui/hotkey"
import { DemoBackLink } from "@/components/playground/demo-back-link"
import { useSearchParams } from "@/hooks/use-url-state"

// Demo-only fixtures for `?data=worst|empty|one|many` (docs/WORKFLOWS.md → Stress-test).
const LONG_LABELS = [
  "Atualizar a configuração de notificações da organização para todos os projetos arquivados",
  "Superdesenvolvimentocomplicadíssimo_relatório_trimestral_final_v2_revisado_definitivo",
  "Maria Eduarda dos Santos Albuquerque Cavalcanti — convidar para o espaço de trabalho",
  "导出所有客户的季度报告并发送给财务团队审阅",
  "تصدير تقرير الفواتير المتأخرة لكل العملاء إلى فريق المالية",
  "Exportar relatório de inadimplência por cliente, região, vendedor e faixa de atraso",
]

function makeMany(long: boolean): PaletteCommand[] {
  return Array.from({ length: 500 }, (_, i) => ({
    id: `gen-${i}`,
    label: long
      ? `${i + 1}. ${LONG_LABELS[i % LONG_LABELS.length]}`
      : `Command ${i + 1}`,
    description: long
      ? "Uma descrição igualmente longa para testar o truncamento da segunda linha da lista"
      : undefined,
    group: i % 3 === 0 ? "Navigation" : "Actions",
    icon: i % 3 === 0 ? <LayoutDashboardIcon /> : <FilePlusIcon />,
    onSelect: () => toast(`Ran command ${i + 1}`),
  }))
}

const DOCS = [
  {
    id: "d1",
    label: "Getting started with invoices",
    description: "Docs · Billing",
  },
  {
    id: "d2",
    label: "Inviting teammates and roles",
    description: "Docs · Members",
  },
  {
    id: "d3",
    label: "Configuração de notificações",
    description: "Docs · Conta",
  },
  {
    id: "d4",
    label: "Importar clientes de uma planilha",
    description: "Docs · Clientes",
  },
  {
    id: "d5",
    label: "Webhook retries and signing secrets",
    description: "Docs · API",
  },
]

export default function Page() {
  const data = useSearchParams().get("data")
  const router = useRouter()
  const { setTheme } = useTheme()
  const [open, setOpen] = React.useState(true)

  const commands = React.useMemo<PaletteCommand[]>(() => {
    if (data === "empty") return []
    if (data === "worst") return makeMany(true)
    if (data === "many") return makeMany(false)
    const go = (href: string) => () => router.push(href)
    const all: PaletteCommand[] = [
      {
        id: "nav-dashboard",
        label: "Dashboard",
        group: "Navigation",
        icon: <LayoutDashboardIcon />,
        shortcut: ["G", "D"],
        onSelect: go("/blocks/dashboard"),
      },
      {
        id: "nav-inbox",
        label: "Inbox",
        group: "Navigation",
        icon: <InboxIcon />,
        shortcut: ["G", "I"],
        keywords: ["mail", "mensagens"],
        onSelect: go("/blocks/inbox"),
      },
      {
        id: "nav-projects",
        label: "Projects",
        group: "Navigation",
        icon: <FolderKanbanIcon />,
        shortcut: ["G", "P"],
        onSelect: go("/blocks/projects"),
      },
      {
        id: "nav-deals",
        label: "Deals",
        group: "Navigation",
        icon: <HandshakeIcon />,
        onSelect: go("/blocks/deals"),
      },
      {
        id: "nav-customers",
        label: "Customers",
        group: "Navigation",
        icon: <UsersIcon />,
        keywords: ["clientes"],
        shortcut: ["G", "C"],
        onSelect: go("/blocks/customers"),
      },
      {
        id: "nav-billing",
        label: "Billing",
        group: "Navigation",
        icon: <CreditCardIcon />,
        onSelect: go("/blocks/billing"),
      },
      {
        id: "nav-settings",
        label: "Settings",
        group: "Navigation",
        icon: <SettingsIcon />,
        shortcut: ["G", "S"],
        onSelect: go("/blocks/settings"),
      },
      {
        id: "act-project",
        label: "Create project",
        description: "Start from a blank board",
        icon: <FilePlusIcon />,
        tone: "blue",
        shortcut: "Shift+N",
        onSelect: () => toast("Create project"),
      },
      {
        id: "act-invite",
        label: "Invite teammate",
        description: "Send an email invite",
        icon: <UserPlusIcon />,
        tone: "green",
        onSelect: () => toast("Invite sent"),
      },
      {
        id: "act-link",
        label: "Copy workspace link",
        icon: <LinkIcon />,
        tone: "purple",
        onSelect: () => toast("Link copied"),
      },
      {
        id: "act-notify",
        label: "Mute notifications for 1 hour",
        icon: <BellIcon />,
        tone: "orange",
        onSelect: () => toast("Muted for 1 hour"),
      },
      {
        id: "act-theme",
        label: "Change theme…",
        description: "Light, dark or system",
        icon: <PaletteIcon />,
        tone: "amber",
        keywords: ["appearance", "tema"],
        children: [
          {
            id: "theme-light",
            label: "Light",
            icon: <SunIcon />,
            group: "Theme",
            onSelect: () => setTheme("light"),
          },
          {
            id: "theme-dark",
            label: "Dark",
            icon: <MoonIcon />,
            group: "Theme",
            onSelect: () => setTheme("dark"),
          },
          {
            id: "theme-system",
            label: "System",
            icon: <MonitorIcon />,
            group: "Theme",
            onSelect: () => setTheme("system"),
          },
        ],
      },
    ]
    return data === "one" ? all.slice(0, 1) : all
  }, [data, router, setTheme])

  // Fake API: 700ms, filters the fixtures; "erro" fails, to show the error row.
  const search = React.useCallback(
    (query: string, signal: AbortSignal) =>
      new Promise<PaletteCommand[]>((resolve, reject) => {
        const timer = setTimeout(() => {
          if (/^erro/i.test(query)) return reject(new Error("offline"))
          const q = query.toLowerCase()
          resolve(
            data === "empty"
              ? []
              : DOCS.filter((d) => d.label.toLowerCase().includes(q)).map(
                  (d) => ({
                    ...d,
                    icon: <SearchIcon />,
                    onSelect: () => toast(`Opened “${d.label}”`),
                  })
                )
          )
        }, 700)
        signal.addEventListener("abort", () => clearTimeout(timer))
      }),
    [data]
  )

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 px-4 py-16">
      <DemoBackLink />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-balance">
          Everything is one shortcut away
        </h1>
        <p className="text-muted-foreground">
          Jump to a page, run an action or search the docs without leaving the
          keyboard. The palette starts open here; close it and press{" "}
          <Hotkey hotkey="Mod+K" /> to bring it back.
        </p>
      </div>
      <div>
        <Button onClick={() => setOpen(true)}>
          <SearchIcon data-icon="inline-start" />
          Open command palette
        </Button>
      </div>
      <CommandPalette
        key={data}
        commands={commands}
        open={open}
        onOpenChange={setOpen}
        search={search}
      />
    </main>
  )
}
