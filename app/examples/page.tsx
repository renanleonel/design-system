import type { Metadata } from "next"
import Link from "next/link"

import { ReleasesPanel } from "@/components/examples/releases-panel"
import { RuleDialog } from "@/components/examples/rule-dialog"
import { SearchPalette } from "@/components/examples/search-palette"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = { title: "Examples · renan/ui" }

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-base font-medium">{title}</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex min-h-40 items-center justify-center rounded-3xl bg-muted/40 px-4 py-12 sm:px-10">
        {children}
      </div>
    </section>
  )
}

export default function ExamplesPage() {
  return (
    <TooltipProvider>
      <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-16 px-4 py-12">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Examples
            </h1>
            <p className="text-sm text-muted-foreground">
              Compositions built only from renan/ui parts. See
              docs/COMPOSITION.md.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Playground
          </Link>
        </header>
        <Section
          title="Panel"
          description="A tray with concentric cards: featured item, a list with tonal status, one dark primary action."
        >
          <ReleasesPanel />
        </Section>
        <Section
          title="Dialog"
          description="Icon-tile header, an inset group for the editable part, a tinted callout and a quiet footer note."
        >
          <RuleDialog />
        </Section>
        <Section
          title="Command palette"
          description="Grouped results with counts, match highlighting, trailing metadata and keyboard hints. Press Mod+K."
        >
          <SearchPalette />
        </Section>
      </main>
      <Toaster />
    </TooltipProvider>
  )
}
