"use client"

import { CopyButton } from "@/components/docs/copy-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const RUNNERS = [
  { id: "pnpm", run: "pnpm dlx" },
  { id: "npm", run: "npx" },
  { id: "bun", run: "bunx --bun" },
]

/** `shadcn add <url>` for each package manager. */
export function InstallCommand({ command }: { command: string }) {
  return (
    <Tabs
      defaultValue="pnpm"
      className="gap-0 overflow-hidden rounded-xl bg-muted/40 shadow-border"
    >
      <div className="flex items-center justify-between border-b px-2 py-1">
        <TabsList variant="line" className="h-8">
          {RUNNERS.map((r) => (
            <TabsTrigger key={r.id} value={r.id} className="px-2">
              {r.id}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {RUNNERS.map((r) => {
        const full = `${r.run} ${command}`
        return (
          <TabsContent
            key={r.id}
            value={r.id}
            className="flex items-center gap-1 pe-1.5"
          >
            <pre className="min-w-0 flex-1 overflow-x-auto py-3 ps-4 [scrollbar-width:none] font-mono text-[0.8125rem]">
              <code>{full}</code>
            </pre>
            <CopyButton value={full} className="shrink-0" />
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
