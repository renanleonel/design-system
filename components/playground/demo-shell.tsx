"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BookOpenIcon,
  CreditCardIcon,
  FolderKanbanIcon,
  HexagonIcon,
  InboxIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UserCogIcon,
} from "lucide-react"

import { AppShell } from "@/components/blocks/app-shell/app-shell"
import { Toaster } from "@/components/ui/sonner"
import { useSearchParams } from "@/hooks/use-url-state"

/** Wires the router-agnostic AppShell to Next.js (Link, pathname, push). */
export function DemoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  // ?sidebar=default shows the original rail (labels unmount, icons center).
  const variant =
    useSearchParams().get("sidebar") === "default" ? "default" : "fade"
  return (
    <>
      <AppShell
        workspace={{ name: "Acme", plan: "Pro plan", logo: <HexagonIcon /> }}
        user={{ name: "Ana Kowalski", email: "ana@acme.dev", initials: "AK" }}
        currentPath={pathname}
        linkComponent={Link}
        onNavigate={(href) => router.push(href)}
        settingsHref="/blocks/settings"
        onSignOut={() => router.push("/blocks/sign-in")}
        sections={[
          {
            items: [
              {
                label: "Dashboard",
                href: "/blocks/dashboard",
                icon: <LayoutDashboardIcon />,
                hotkey: ["G", "D"],
              },
              {
                label: "Inbox",
                href: "/blocks/inbox",
                icon: <InboxIcon />,
                badge: 3,
                hotkey: ["G", "I"],
              },
              {
                label: "Projects",
                href: "/blocks/projects",
                icon: <FolderKanbanIcon />,
                hotkey: ["G", "P"],
              },
            ],
          },
          {
            label: "Workspace",
            items: [
              {
                label: "Account",
                href: "/blocks/settings",
                icon: <UserCogIcon />,
                items: [
                  {
                    label: "Settings",
                    href: "/blocks/settings",
                    icon: <SettingsIcon />,
                    hotkey: ["G", "S"],
                  },
                  {
                    label: "Billing",
                    href: "/blocks/billing",
                    icon: <CreditCardIcon />,
                    hotkey: ["G", "B"],
                  },
                ],
              },
            ],
          },
        ]}
        footerItems={[
          { label: "Docs", href: "/blocks", icon: <BookOpenIcon /> },
        ]}
        variant={variant}
      >
        {children}
      </AppShell>
      <Toaster />
    </>
  )
}
