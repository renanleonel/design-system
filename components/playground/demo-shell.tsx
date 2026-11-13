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
  XIcon,
} from "lucide-react"

import {
  AppShell,
  type SidebarMotion,
} from "@/components/blocks/app-shell/app-shell"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { setSearchParams, useSearchParams } from "@/hooks/use-url-state"

const MOTIONS: { value: SidebarMotion; label: string; hint: string }[] = [
  {
    value: "ease-out",
    label: "Ease out",
    hint: "Drag the edge: under 160px it snaps to icons. Labels fade in 0.16s while the width glides over 0.4s.",
  },
  {
    value: "cascade",
    label: "Cascade",
    hint: "Follows your drag. Past 160px the labels drift left and fade from the top down; it settles to icons when you let go.",
  },
  {
    value: "scrub",
    label: "Scrub",
    hint: "Follows your drag. Labels fade as you narrow the sidebar, and it settles to icons when you let go.",
  },
]

/** Wires the router-agnostic AppShell to Next.js (Link, pathname, push). */
export function DemoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useSearchParams()
  // ?sidebar=classic shows the old rail (labels unmount, icons center).
  const variant = params.get("sidebar") === "classic" ? "classic" : "fade"
  const motion = (
    MOTIONS.some((m) => m.value === params.get("motion"))
      ? params.get("motion")
      : "cascade"
  ) as SidebarMotion
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
        motion={motion}
      >
        {children}
      </AppShell>
      {variant === "fade" && params.get("chrome") !== "0" && (
        <div
          role="region"
          aria-label="Demo control"
          className="fixed bottom-4 left-1/2 z-40 hidden -translate-x-1/2 flex-col items-center gap-2 rounded-2xl bg-popover p-2 shadow-popover md:flex"
        >
          {/* Not part of the block: picks the AppShell `motion` prop for this demo. */}
          <div className="flex w-full items-center justify-between gap-2 ps-2">
            <span className="text-xs font-medium">
              Demo · sidebar motion{" "}
              <span className="font-normal text-muted-foreground">
                (drag the sidebar edge)
              </span>
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Hide demo control"
              onClick={() => setSearchParams({ chrome: "0" })}
            >
              <XIcon />
            </Button>
          </div>
          <p className="max-w-80 px-2 text-center text-xs text-muted-foreground">
            {MOTIONS.find((m) => m.value === motion)?.hint}
          </p>
          <Tabs
            value={motion}
            onValueChange={(v) =>
              setSearchParams({ motion: v === "cascade" ? null : String(v) })
            }
          >
            <TabsList variant="segmented" aria-label="Sidebar motion">
              {MOTIONS.map((m) => (
                <TabsTrigger key={m.value} value={m.value}>
                  {m.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}
      <Toaster />
    </>
  )
}
