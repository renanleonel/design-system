import type { Metadata } from "next"
import {
  CreditCardIcon,
  FolderKanbanIcon,
  KeyRoundIcon,
  LayoutPanelLeftIcon,
  SettingsIcon,
  UserPlusIcon,
} from "lucide-react"

import { IconTile } from "@/components/ui/icon-tile"

export const metadata: Metadata = { title: "Blocks · renan/ui" }

const BLOCKS = [
  {
    href: "/blocks/projects",
    title: "App shell + data table",
    meta: "Sidebar, Mod+K, G then P · filters, sort and pages in the URL",
    icon: <LayoutPanelLeftIcon />,
    tone: "blue",
  },
  {
    href: "/blocks/projects?demo=loading",
    title: "Table states",
    meta: "?demo=loading · error · empty",
    icon: <FolderKanbanIcon />,
    tone: "purple",
  },
  {
    href: "/blocks/settings",
    title: "Settings",
    meta: "Profile form, members and roles, typed delete confirmation",
    icon: <SettingsIcon />,
    tone: "gray",
  },
  {
    href: "/blocks/billing",
    title: "Pricing and billing",
    meta: "Monthly/yearly, usage meters, invoices",
    icon: <CreditCardIcon />,
    tone: "green",
  },
  {
    href: "/blocks/sign-in",
    title: "Sign in",
    meta: "SSO, email and password, server error banner",
    icon: <KeyRoundIcon />,
    tone: "amber",
  },
  {
    href: "/blocks/sign-up",
    title: "Sign up and reset",
    meta: "Live password rules · reset with inbox state",
    icon: <UserPlusIcon />,
    tone: "orange",
  },
] as const

export default function BlocksIndex() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Blocks
        </h1>
        <p className="text-sm text-muted-foreground">
          Full screens built from renan/ui. Install one with{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            shadcn add …/r/app-shell.json
          </code>
          .
        </p>
      </header>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
        {BLOCKS.map((b) => (
          <li key={b.href}>
            <a
              href={b.href}
              className="flex h-full items-start gap-3 rounded-xl bg-card p-4 shadow-border focus-ring transition-shadow hover:shadow-border-hover"
            >
              <IconTile tone={b.tone}>{b.icon}</IconTile>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{b.title}</span>
                <span className="block text-sm text-muted-foreground">
                  {b.meta}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
