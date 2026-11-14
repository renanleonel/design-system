"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useHotkey } from "@tanstack/react-hotkeys"
import { MenuIcon, SearchIcon } from "lucide-react"

import { DocsNav } from "@/components/docs/docs-nav"
import { GitHubIcon } from "@/components/docs/github-icon"
import { LogoMark } from "@/components/docs/logo-mark"
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
import { ThemeToggle } from "@/components/ui/theme-toggle"
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
  { title: "Themes", href: "/themes" },
]

export function SiteHeader({
  nav,
  githubUrl,
}: {
  nav: NavGroup[]
  githubUrl: string
}) {
  const pathname = usePathname()
  const router = useRouter()
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
          className="group/logo flex items-center gap-2 rounded-md font-heading text-sm font-semibold focus-ring"
        >
          <LogoMark className="size-5" />
          renanleonel/ui
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
            aria-keyshortcuts="Control+K Meta+K"
            // Not justify-between: Button's (empty) spinner slot is a flex item
            // too and would take a share of the space. Push the hotkey instead.
            className="w-9 justify-center bg-muted/40 px-0 text-muted-foreground sm:w-56 sm:justify-start sm:px-2.5"
          >
            <SearchIcon />
            <span className="sr-only sm:not-sr-only">Search docs…</span>
            <span aria-hidden className="ms-auto hidden sm:flex">
              <Hotkey hotkey="Mod+K" />
            </span>
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
          <ThemeToggle hotkey="Shift+D" />
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
