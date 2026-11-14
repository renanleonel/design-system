"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useHotkey } from "@tanstack/react-hotkeys"
import { MenuIcon, SearchIcon } from "lucide-react"

import { GitHubIcon } from "@/components/docs/github-icon"
import { LogoMark } from "@/components/docs/logo-mark"
import { Button } from "@/components/ui/button"
import { Hotkey } from "@/components/ui/hotkey"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import type { NavGroup } from "@/lib/docs"

// The palette (cmdk) and the phone sheet stay closed on load, so they load on
// first open; hovering, focusing or touching their buttons warms the chunk.
const SiteSearch = dynamic(() => import("@/components/docs/site-search"), {
  ssr: false,
})
const MobileMenu = dynamic(() => import("@/components/docs/mobile-menu"), {
  ssr: false,
})
const warmSearch = () => void import("@/components/docs/site-search")
const warmMenu = () => void import("@/components/docs/mobile-menu")

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
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  // Mounted after the first open and kept, so closing still animates out.
  const [searchUsed, setSearchUsed] = React.useState(false)
  const [menuUsed, setMenuUsed] = React.useState(false)
  const openSearch = (open: boolean) => {
    if (open) setSearchUsed(true)
    setSearchOpen(open)
  }
  useHotkey("Mod+K", () => {
    setSearchUsed(true)
    setSearchOpen((open) => !open)
  })

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-2 px-4 md:gap-6 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          className="-ms-2 md:hidden"
          onPointerEnter={warmMenu}
          onFocus={warmMenu}
          onTouchStart={warmMenu}
          onClick={() => {
            setMenuUsed(true)
            setMenuOpen(true)
          }}
        >
          <MenuIcon />
        </Button>
        {menuUsed && (
          <MobileMenu nav={nav} open={menuOpen} onOpenChange={setMenuOpen} />
        )}

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
            onClick={() => openSearch(true)}
            onPointerEnter={warmSearch}
            onFocus={warmSearch}
            onTouchStart={warmSearch}
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

      {searchUsed && (
        <SiteSearch nav={nav} open={searchOpen} onOpenChange={setSearchOpen} />
      )}
    </header>
  )
}
