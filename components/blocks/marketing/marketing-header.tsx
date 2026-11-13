"use client"

import * as React from "react"
import { cn } from "cn"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LanguageSelect } from "@/components/ui/language-select"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/ui/theme-toggle"

type LinkComponent = React.ComponentType<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>

export type MarketingLink = { label: string; href: string }

/**
 * The marketing site's top bar: brand, links, theme and language, sign-in and
 * the primary call to action. Sticky with a translucent blur; below `md` the
 * links move into a sheet that also carries both actions, so the bar keeps
 * just the brand, the primary action and the menu button.
 */
export function MarketingHeader({
  brand,
  links,
  currentPath,
  signInHref,
  cta,
  showLanguage = true,
  linkComponent: Link = "a" as unknown as LinkComponent,
  className,
}: {
  brand: React.ReactNode
  links: MarketingLink[]
  currentPath?: string
  signInHref?: string
  /** The primary action, e.g. { label: "Start for free", href: "/sign-up" }. */
  cta?: { label: string; href: string }
  showLanguage?: boolean
  linkComponent?: LinkComponent
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const isCurrent = (href: string) =>
    currentPath === href || (href !== "/" && !!currentPath?.startsWith(href))
  return (
    <header
      data-slot="marketing-header"
      className={cn(
        "sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md font-heading text-sm font-semibold focus-ring"
        >
          {brand}
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent(link.href) ? "page" : undefined}
              className="rounded-md px-2 py-1 text-sm text-muted-foreground focus-ring transition-colors hover:text-foreground aria-[current=page]:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-1">
          <div className="hidden items-center gap-1 md:flex">
            {showLanguage && <LanguageSelect compact />}
            <ThemeToggle />
            {signInHref && (
              <Button
                variant="ghost"
                render={<Link href={signInHref} />}
                nativeButton={false}
              >
                Sign in
              </Button>
            )}
          </div>
          {cta && (
            <Button
              className="ms-1 [--ds-radius-control:9999px]"
              render={<Link href={cta.href} />}
              nativeButton={false}
            >
              {cta.label}
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Menu"
                  className="-me-2 md:hidden"
                />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 gap-6 p-6">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav aria-label="Main" className="flex flex-col gap-1 pt-6">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isCurrent(link.href) ? "page" : undefined}
                    className="flex h-11 items-center rounded-md px-2 text-base focus-ring hover:bg-muted aria-[current=page]:font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2">
                {signInHref && (
                  <Button
                    variant="outline"
                    size="lg"
                    render={<Link href={signInHref} />}
                    nativeButton={false}
                  >
                    Sign in
                  </Button>
                )}
                {cta && (
                  <Button
                    size="lg"
                    render={<Link href={cta.href} />}
                    nativeButton={false}
                  >
                    {cta.label}
                  </Button>
                )}
                <div className="flex items-center justify-between pt-2">
                  {showLanguage && <LanguageSelect compact />}
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
