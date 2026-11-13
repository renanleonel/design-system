"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import {
  ArrowRightLeftIcon,
  ChartBarIcon,
  ReceiptIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Hotkey } from "@/components/ui/hotkey"
import { IconTile } from "@/components/ui/icon-tile"
import { Kbd } from "@/components/ui/kbd"

type Tone = "green" | "blue" | "orange" | "purple"
type Row = {
  id: string
  title: string
  meta: string
  section: "Pages" | "Invoices" | "Customers"
  icon?: React.ReactNode
  initials?: string
  tone?: Tone
  status?: { label: string; tone: "green" | "red" }
  amount?: string
}

const ROWS: Row[] = [
  {
    id: "p1",
    section: "Pages",
    title: "Overdue invoices · Northwind",
    meta: "Billing · 12 overdue, $18.4K outstanding",
    icon: <ReceiptIcon />,
  },
  {
    id: "p2",
    section: "Pages",
    title: "Revenue by plan · Northwind",
    meta: "Reports · last 90 days",
    icon: <ChartBarIcon />,
  },
  {
    id: "p3",
    section: "Pages",
    title: "Payment routing · Northwind cards",
    meta: "Settings · retries enabled",
    icon: <ArrowRightLeftIcon />,
  },
  {
    id: "i1",
    section: "Invoices",
    title: "INV-2041 · Northwind Traders",
    meta: "Due Oct 12 · Net 30",
    icon: <ReceiptIcon />,
    status: { label: "Overdue", tone: "red" },
    amount: "$4,200.00",
  },
  {
    id: "i2",
    section: "Invoices",
    title: "INV-2038 · Northwind Traders",
    meta: "Paid Oct 2 · Card ending 4402",
    icon: <ReceiptIcon />,
    status: { label: "Paid", tone: "green" },
    amount: "$860.40",
  },
  {
    id: "c1",
    section: "Customers",
    title: "Northwind Traders",
    meta: "Enterprise · 48 invoices · since 2021",
    initials: "NT",
    tone: "blue",
  },
  {
    id: "c2",
    section: "Customers",
    title: "Northwind Labs",
    meta: "Pro · 6 invoices · at risk",
    initials: "NL",
    tone: "orange",
  },
]

/** Bolds the part of `text` that matches `query` (case-insensitive). */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
  if (at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-transparent font-semibold text-foreground">
        {text.slice(at, at + q.length)}
      </mark>
      {text.slice(at + q.length)}
    </>
  )
}

function ResultRow({ row, query }: { row: Row; query: string }) {
  return (
    <CommandItem value={`${row.title} ${row.meta}`} className="gap-3 py-2">
      {row.initials ? (
        <IconTile
          size="md"
          tone={row.tone ?? "blue"}
          className="rounded-full text-xs font-semibold"
        >
          {row.initials}
        </IconTile>
      ) : (
        <IconTile size="md">{row.icon}</IconTile>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-foreground">
          <Highlight text={row.title} query={query} />
        </p>
        <p className="truncate text-xs text-muted-foreground">{row.meta}</p>
      </div>
      {row.status && (
        <Badge tone={row.status.tone} className="shrink-0">
          {row.status.label}
        </Badge>
      )}
      {row.amount ? (
        <span className="w-20 shrink-0 text-end font-medium tabular-nums">
          {row.amount}
        </span>
      ) : (
        <span className="shrink-0 text-xs text-muted-foreground">
          {row.section}
        </span>
      )}
    </CommandItem>
  )
}

export function SearchPalette() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("northwind")
  const sections = ["Pages", "Invoices", "Customers"] as const
  const visible = ROWS.filter((r) =>
    `${r.title} ${r.meta}`.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <>
      <Button
        variant="outline"
        className="w-64 justify-start text-muted-foreground"
        hotkey="Mod+K"
        showHotkey
        onClick={() => setOpen(true)}
      >
        <SearchIcon data-icon="inline-start" />
        <span className="flex-1 text-start">Search…</span>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search pages, invoices and customers"
        className="sm:max-w-xl"
      >
        <CommandPrimitive shouldFilter={false} className="flex flex-col">
          <div className="flex items-center gap-3 border-b px-4">
            <SearchIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            <CommandPrimitive.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search pages, invoices, customers…"
              className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
            />
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {visible.length} results
            </span>
            <Kbd>Esc</Kbd>
          </div>

          <CommandList className="max-h-[min(60dvh,26rem)] p-2">
            <CommandEmpty className="py-10 text-center text-sm text-muted-foreground">
              Nothing matches “{query}”. Try a customer or invoice number.
            </CommandEmpty>
            {query.trim() && (
              <CommandGroup heading="Ask the assistant">
                <CommandItem
                  value={`ask ${query}`}
                  className="gap-3 bg-muted/60 py-2"
                >
                  <IconTile size="md" tone="green">
                    <SparklesIcon />
                  </IconTile>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground">
                      Why are <span className="font-semibold">{query}</span>{" "}
                      invoices overdue?
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Checks payment history, retries and terms
                    </p>
                  </div>
                  <Kbd>Enter</Kbd>
                </CommandItem>
              </CommandGroup>
            )}
            {sections.map((section) => {
              const rows = visible.filter((r) => r.section === section)
              if (!rows.length) return null
              return (
                <CommandGroup
                  key={section}
                  heading={
                    <span className="flex justify-between">
                      {section}
                      <span className="tabular-nums">{rows.length}</span>
                    </span>
                  }
                >
                  {rows.map((row) => (
                    <ResultRow key={row.id} row={row} query={query} />
                  ))}
                </CommandGroup>
              )
            })}
          </CommandList>

          <div className="flex items-center gap-4 border-t bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>Enter</Kbd>
              Open
            </span>
            <span className="ms-auto hidden items-center gap-1.5 sm:flex">
              Open search anywhere
              <Hotkey hotkey="Mod+K" />
            </span>
          </div>
        </CommandPrimitive>
      </CommandDialog>
    </>
  )
}
