"use client"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import {
  SettingsPage,
  type Member,
} from "@/components/blocks/settings/settings-page"
import { useSearchParams } from "@/hooks/use-url-state"

// Demo-only fixtures for `?data=worst|one` (docs/WORKFLOWS.md → Stress-test).
const WORST: Member[] = [
  { id: "w1", name: "Renan Leonel", email: "renan@acme.dev", role: "owner" },
  {
    id: "w2",
    name: "Maria Eduarda dos Santos Albuquerque Cavalcanti",
    email: "maria.eduarda.cavalcanti@northwind-industries-holdings.example.com",
    role: "admin",
  },
  { id: "w3", name: "Jo", email: "jo@a.test", role: "member" },
  {
    id: "w4",
    name: "first.last+billing-notifications@example.com",
    email: "first.last+billing-notifications@example.com",
    role: "viewer",
    pending: true,
  },
  {
    id: "w5",
    name: "João Pedro de Oliveira Neto",
    email: "joao.pedro@acme.dev",
    role: "member",
  },
  {
    id: "w6",
    name: "王秀英",
    email: "wang.xiuying@example.com",
    role: "member",
  },
]
const ONE: Member[] = WORST.slice(0, 1)

export default function Page() {
  const data = useSearchParams().get("data")
  const members = data === "worst" ? WORST : data === "one" ? ONE : undefined
  return (
    <>
      <AppShellHeader
        title="Settings"
        description="Profile, members and workspace"
      />
      <AppShellContent className="max-w-4xl">
        <SettingsPage key={data} workspace="Acme" members={members} />
      </AppShellContent>
    </>
  )
}
