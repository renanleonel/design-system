"use client"

import { PlusIcon } from "lucide-react"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import { ProjectsTable } from "@/components/blocks/data-table/projects-table"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "@/hooks/use-url-state"

export default function ProjectsPage() {
  // ?demo=loading | error | empty shows each state of the table.
  const demo = useSearchParams().get("demo") as
    "loading" | "error" | "empty" | null
  return (
    <>
      <AppShellHeader
        title="Projects"
        description="Everything your team is building"
        actions={
          <Button hotkey="Shift+N">
            <PlusIcon data-icon="inline-start" />
            New project
          </Button>
        }
      />
      <AppShellContent>
        <ProjectsTable key={demo ?? "ready"} state={demo ?? "ready"} />
      </AppShellContent>
    </>
  )
}
