"use client"

import * as React from "react"
import { cn } from "cn"
import { ArrowRightIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ThemeSwitcher } from "@/components/ui/theme-toggle"

// Only translated sites show the picker, so single-language sites don't ship
// Select and its positioning code. Server rendering resolves it inline.
const LanguageSelect = React.lazy(() =>
  import("@/components/ui/language-select").then((m) => ({
    default: m.LanguageSelect,
  }))
)

export type FooterColumn = {
  title: string
  links: { label: string; href: string; badge?: string }[]
}

export type SocialLink = { label: string; href: string; icon: React.ReactNode }

/**
 * A marketing site footer: brand and tagline, link columns, an optional
 * newsletter field, then a bottom row with the copyright, status, language
 * (when `onLanguageChange` is set, i.e. the site is translated) and theme. Columns reflow from 2 to 4 with the container; links are plain `<a>`
 * (pass `linkComponent` for your router).
 */
export function SiteFooter({
  brand,
  tagline,
  columns,
  social = [],
  onSubscribe,
  copyright,
  status,
  language,
  onLanguageChange,
  linkComponent: Link = "a" as unknown as React.ComponentType<
    React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
  >,
  className,
}: {
  brand: React.ReactNode
  tagline?: React.ReactNode
  columns: FooterColumn[]
  social?: SocialLink[]
  /** Shows the newsletter field; reject to show the error. */
  onSubscribe?: (email: string) => Promise<void> | void
  copyright: React.ReactNode
  /** e.g. { label: "All systems normal", href: "https://status…" } */
  status?: { label: string; href: string; tone?: "green" | "amber" | "red" }
  language?: string
  /** Shows the language picker. Leave it out on a single-language site. */
  onLanguageChange?: (value: string) => void
  linkComponent?: React.ComponentType<
    React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
  >
  className?: string
}) {
  const [busy, setBusy] = React.useState(false)
  const link =
    "rounded-sm text-sm text-muted-foreground focus-ring transition-colors hover:text-foreground"
  return (
    <footer
      data-slot="site-footer"
      className={cn("@container border-t bg-background", className)}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 @3xl:py-16">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 @3xl:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          <div className="flex max-w-sm flex-col gap-4">
            <div className="font-heading text-base font-semibold">{brand}</div>
            {tagline && (
              <p className="text-sm text-muted-foreground">{tagline}</p>
            )}
            {onSubscribe && (
              <form
                className="mt-2 flex flex-col gap-2"
                onSubmit={async (event) => {
                  event.preventDefault()
                  const form = event.currentTarget
                  const email = new FormData(form).get("email") as string
                  setBusy(true)
                  try {
                    await onSubscribe(email)
                    form.reset()
                    toast.success("You're subscribed. Check your inbox.")
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Couldn't subscribe. Try again."
                    )
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                <label htmlFor="footer-email" className="text-sm font-medium">
                  Product updates, once a month
                </label>
                <InputGroup>
                  <InputGroupInput
                    id="footer-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@company.com"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="submit"
                      size="icon-xs"
                      aria-label="Subscribe"
                      disabled={busy}
                    >
                      <ArrowRightIcon />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </form>
            )}
          </div>
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 @xl:grid-cols-4"
          >
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-3">
                <h2 className="text-sm font-medium">{column.title}</h2>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((item) => (
                    <li key={item.href} className="flex items-center gap-2">
                      <Link href={item.href} className={link}>
                        {item.label}
                      </Link>
                      {item.badge && (
                        <span className="rounded-full bg-tone-blue/12 px-1.5 py-0.5 text-[0.6875rem] font-medium text-tone-blue">
                          {item.badge}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-6 border-t pt-6 @3xl:flex-row @3xl:items-center @3xl:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span>{copyright}</span>
            {status && (
              <a
                href={status.href}
                className={cn(link, "inline-flex items-center gap-2")}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-2 rounded-full",
                    status.tone === "red"
                      ? "bg-tone-red"
                      : status.tone === "amber"
                        ? "bg-tone-amber"
                        : "bg-tone-green"
                  )}
                />
                {status.label}
              </a>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {social.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="icon-sm"
                aria-label={item.label}
                render={<a href={item.href} target="_blank" rel="noreferrer" />}
                nativeButton={false}
              >
                {item.icon}
              </Button>
            ))}
            {onLanguageChange && (
              <React.Suspense fallback={null}>
                <LanguageSelect
                  value={language}
                  onValueChange={onLanguageChange}
                  compact
                />
              </React.Suspense>
            )}
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </footer>
  )
}
