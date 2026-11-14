import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import * as AlertDemos from "@/components/demos/alert"
import * as BadgeDemos from "@/components/demos/badge"
import * as ButtonDemos from "@/components/demos/button"
import * as CalendarDemos from "@/components/demos/calendar"
import * as ChartDemos from "@/components/demos/chart"
import * as DataListDemos from "@/components/demos/data-list"
import * as FileDropzoneDemos from "@/components/demos/file-dropzone"
import * as FormDemos from "@/components/demos/form"
import * as MultiSelectDemos from "@/components/demos/multi-select"
import * as RatingDemos from "@/components/demos/rating"
import * as SortableDemos from "@/components/demos/sortable"
import * as SwitchDemos from "@/components/demos/switch"
import * as TabsDemos from "@/components/demos/tabs"
import * as TimelineDemos from "@/components/demos/timeline"
import * as TreeDemos from "@/components/demos/tree"
import * as TreeSelectDemos from "@/components/demos/tree-select"
import { InstallCommand } from "@/components/docs/install-command"
import { ReleasesPanel } from "@/components/examples/releases-panel"
import { RuleDialog } from "@/components/examples/rule-dialog"
import { SearchPalette } from "@/components/examples/search-palette"
import { Button } from "@/components/ui/button"
import { getBlocks, getComponents, installCommand } from "@/lib/docs"

function Tile({
  title,
  href,
  children,
}: {
  title: string
  href: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-4 flex break-inside-avoid flex-col gap-4 rounded-2xl bg-card p-5 shadow-border">
      <Link
        href={href}
        className="group/tile flex w-fit items-center gap-1 rounded-md text-sm font-medium text-muted-foreground focus-ring hover:text-foreground"
      >
        {title}
        <ArrowRightIcon className="size-3.5 transition-transform duration-150 ease-out group-hover/tile:translate-x-0.5" />
      </Link>
      <div className="flex justify-center">{children}</div>
    </section>
  )
}

export default function Home() {
  const components = getComponents()
  const blocks = new Set(getBlocks().map((b) => b.registry))
  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-16 px-4 py-12 md:px-6 md:py-20">
      <section className="flex max-w-3xl flex-col gap-6">
        <p className="text-sm font-medium text-muted-foreground">
          Base UI · Tailwind v4 · shadcn registry
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          Components and blocks for shipping SaaS fast.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {components.length} components and {blocks.size} blocks with every
          state covered, keyboard hotkeys, touch-sized controls and motion that
          respects reduced motion. Install a piece or everything, then theme it
          with any tweakcn theme.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="lg"
            render={<Link href="/components" />}
            nativeButton={false}
          >
            Browse components
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/blocks" />}
            nativeButton={false}
          >
            See blocks
          </Button>
        </div>
        <div className="max-w-2xl">
          <InstallCommand command={installCommand("base")} />
        </div>
      </section>

      <div className="flex flex-col gap-4">
        <section
          aria-label="Compositions"
          className="grid grid-cols-[minmax(0,1fr)] gap-4 *:mb-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
        >
          <Tile title="Panel" href="/components/panel">
            <ReleasesPanel />
          </Tile>
          <div className="flex flex-col gap-4 *:mb-0 *:flex-1 [&>section>div]:flex-1 [&>section>div]:items-center">
            <Tile title="Command" href="/components/command">
              <SearchPalette />
            </Tile>
            <Tile title="Dialog" href="/components/dialog">
              <RuleDialog />
            </Tile>
          </div>
        </section>

        <section
          aria-label="Live previews"
          className="columns-1 gap-4 md:columns-2 xl:columns-3"
        >
          <Tile title="Form" href="/components/form">
            <FormDemos.Default />
          </Tile>
          <Tile title="Chart" href="/components/chart">
            <ChartDemos.Revenue />
          </Tile>
          <Tile title="Tree Select" href="/components/tree-select">
            <TreeSelectDemos.Multiple />
          </Tile>
          <Tile title="Badge" href="/components/badge">
            <BadgeDemos.Tones />
          </Tile>
          <Tile title="Calendar" href="/components/calendar">
            <CalendarDemos.Default />
          </Tile>
          <Tile title="Tabs" href="/components/tabs">
            <TabsDemos.Segmented />
          </Tile>
          <Tile title="Sortable" href="/components/sortable">
            <SortableDemos.Default />
          </Tile>
          <Tile title="Multi Select" href="/components/multi-select">
            <MultiSelectDemos.Default />
          </Tile>
          <Tile title="Tree" href="/components/tree">
            <TreeDemos.Default />
          </Tile>
          <Tile title="Timeline" href="/components/timeline">
            <TimelineDemos.Default />
          </Tile>
          <Tile title="Button" href="/components/button">
            <ButtonDemos.Loading />
          </Tile>
          <Tile title="Alert" href="/components/alert">
            <AlertDemos.Tones />
          </Tile>
          <Tile title="File Dropzone" href="/components/file-dropzone">
            <FileDropzoneDemos.Default />
          </Tile>
          <Tile title="Switch" href="/components/switch">
            <SwitchDemos.SettingRow />
          </Tile>
          <Tile title="Rating" href="/components/rating">
            <RatingDemos.Default />
          </Tile>
          <Tile title="Data List" href="/components/data-list">
            <DataListDemos.Stack />
          </Tile>
        </section>
      </div>
    </div>
  )
}
