"use client"

import * as React from "react"
import { FolderIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton"
import { toastUndo } from "@/components/ui/sonner"

type Status = "idle" | "loading" | "ready" | "empty" | "error"

const PROJECTS = ["Q3 report", "Onboarding revamp", "Billing migration"]

function ProjectRows() {
  const [projects, setProjects] = React.useState(PROJECTS)
  const archive = (name: string) => {
    setProjects((list) => list.filter((p) => p !== name))
    toastUndo(`Archived “${name}”`, {
      onUndo: () =>
        setProjects((list) => (list.includes(name) ? list : [...list, name])),
    })
  }
  if (projects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Everything archived</EmptyTitle>
          <EmptyDescription>
            Archived projects can be restored from Settings.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }
  return (
    <ul className="divide-y">
      {projects.map((name) => (
        <li
          key={name}
          className="flex items-center justify-between gap-2 py-2 text-sm"
        >
          <span className="truncate">{name}</span>
          <Button variant="ghost" size="sm" onClick={() => archive(name)}>
            Archive
          </Button>
        </li>
      ))}
    </ul>
  )
}

export function StatesDemo() {
  const [status, setStatus] = React.useState<Status>("idle")
  const load = (outcome: Status, ms: number) => {
    setStatus("loading")
    setTimeout(() => setStatus(outcome), ms)
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Data states</CardTitle>
        <CardDescription>
          A fast load (100ms) never flashes the skeleton; a slow one shows it
          after 200ms.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => load("ready", 100)}
          >
            Fast load
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => load("ready", 1500)}
          >
            Slow load
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => load("empty", 800)}
          >
            No results
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => load("error", 800)}
          >
            Failure
          </Button>
        </div>

        <div className="min-h-48 rounded-lg border p-4">
          {status === "idle" && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderIcon />
                </EmptyMedia>
                <EmptyTitle>No projects yet</EmptyTitle>
                <EmptyDescription>
                  Projects keep your work and teammates in one place.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => load("ready", 600)}>
                  Create project
                </Button>
              </EmptyContent>
            </Empty>
          )}
          {status === "loading" && (
            <SkeletonGroup
              label="Loading your projects"
              className="flex flex-col gap-3"
            >
              {PROJECTS.map((p) => (
                <div key={p} className="flex items-center justify-between py-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-control-sm w-16" />
                </div>
              ))}
            </SkeletonGroup>
          )}
          {status === "ready" && <ProjectRows />}
          {status === "empty" && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchIcon />
                </EmptyMedia>
                <EmptyTitle>No projects match “billing 2019”</EmptyTitle>
                <EmptyDescription>
                  Try a shorter search or clear the filters.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={() => load("ready", 300)}>
                  Clear filters
                </Button>
              </EmptyContent>
            </Empty>
          )}
          {status === "error" && (
            <ErrorState
              title="Couldn't load projects"
              onRetry={() => load("ready", 800)}
              requestId="req_8f2a91c4"
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
