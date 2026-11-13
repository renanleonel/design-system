"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useHotkey } from "@tanstack/react-hotkeys"
import { useTheme } from "next-themes"
import { MenuIcon, MoonIcon, SearchIcon, SunIcon } from "lucide-react"

import { DocsNav } from "@/components/docs/docs-nav"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Hotkey } from "@/components/ui/hotkey"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { NavGroup } from "@/lib/docs"

const LINKS = [
  { title: "Components", href: "/components" },
  { title: "Blocks", href: "/blocks" },
  { title: "Examples", href: "/examples" },
  { title: "Themes", href: "/themes" },
]

function GitHubIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.2.9 2.3v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
  )
}

export function SiteHeader({
  nav,
  githubUrl,
}: {
  nav: NavGroup[]
  githubUrl: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  useHotkey("Mod+K", () => setSearchOpen((open) => !open))

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-2 px-4 md:gap-6 md:px-6">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu"
                className="-ms-2 md:hidden"
              />
            }
          >
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 overflow-y-auto p-4">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <DocsNav
              groups={[
                {
                  label: "Site",
                  items: [{ title: "Blocks", href: "/blocks" }],
                },
                ...nav,
              ]}
              onNavigate={() => setMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-heading text-sm font-semibold focus-ring"
        >
          <span
            aria-hidden
            className="grid size-6 place-items-center rounded-md bg-foreground text-[0.6875rem] font-bold text-background"
          >
            r/
          </span>
          renan/ui
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className="rounded-md px-2 py-1 text-sm text-muted-foreground focus-ring transition-colors hover:text-foreground aria-[current=page]:text-foreground"
              >
                {link.title}
              </Link>
            )
          })}
        </nav>

        <div className="ms-auto flex items-center gap-1">
          <Button
            variant="outline"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="w-9 justify-center bg-muted/40 px-0 text-muted-foreground sm:w-56 sm:justify-between sm:px-2.5"
          >
            <span className="flex items-center gap-2">
              <SearchIcon />
              <span className="hidden sm:inline">Search docs…</span>
            </span>
            <Hotkey hotkey="Mod+K" className="hidden sm:flex" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="GitHub"
            render={<a href={githubUrl} target="_blank" rel="noreferrer" />}
            nativeButton={false}
          >
            <GitHubIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            {/* CSS picks the icon: resolvedTheme is unknown during SSR. */}
            <SunIcon className="hidden dark:block" />
            <MoonIcon className="dark:hidden" />
          </Button>
        </div>
      </div>

      <CommandDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Search docs"
      >
        <Command>
          <CommandInput placeholder="Search components, blocks and pages…" />
          <CommandList>
            <CommandEmpty>Nothing matches.</CommandEmpty>
            {nav.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${group.label} ${item.title}`}
                    onSelect={() => {
                      setSearchOpen(false)
                      router.push(item.href)
                    }}
                  >
                    {item.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </header>
  )
}
