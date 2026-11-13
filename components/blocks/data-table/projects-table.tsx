"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import {
  ArchiveIcon,
  DownloadIcon,
  FolderPlusIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { toastUndo } from "@/components/ui/sonner"
import { DataTable } from "./data-table"

export type Project = {
  id: string
  name: string
  key: string
  status: "active" | "paused" | "draft" | "failed"
  owner: { name: string; initials: string }
  updatedAt: string
  budget: number
}

const STATUS = {
  active: { label: "Active", tone: "green" },
  paused: { label: "Paused", tone: "gray" },
  draft: { label: "Draft", tone: "orange" },
  failed: { label: "Failed", tone: "red" },
} as const

const OWNERS = [
  { name: "Ana Kowalski", initials: "AK" },
  { name: "Marco Lima", initials: "ML" },
  { name: "Rui Santos", initials: "RS" },
  { name: "Jia Tan", initials: "JT" },
]
const NAMES = [
  "Checkout redesign",
  "Search relevance",
  "Billing migration",
  "Onboarding emails",
  "Mobile navigation",
  "Usage-based pricing",
  "SSO for enterprise",
  "Audit log export",
  "Status page",
  "Dark mode",
  "Partner API",
  "Data retention",
  "Invoice templates",
  "Team permissions",
  "Webhooks v2",
  "Help center",
  "Referral program",
  "Slack integration",
  "Cost dashboard",
  "Accessibility audit",
  "Localization (pt-BR)",
  "Rate limiting",
  "Feature flags",
  "Session replay",
]

// Deterministic sample data (same on server and client).
export const SAMPLE_PROJECTS: Project[] = NAMES.map((name, i) => {
  const status = (
    ["active", "active", "paused", "draft", "active", "failed"] as const
  )[i % 6]
  const day = 28 - ((i * 7) % 27)
  return {
    id: `prj_${(i + 1).toString().padStart(3, "0")}`,
    name,
    key: `PRJ-${100 + i * 7}`,
    status,
    owner: OWNERS[i % OWNERS.length],
    updatedAt: `2026-10-${day.toString().padStart(2, "0")}`,
    budget: 1200 + ((i * 3761) % 48000),
  }
})

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})
const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})

const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: "Project",
    meta: { label: "Project", grow: true },
    cell: ({ row }) => (
      <a
        href={`#${row.original.id}`}
        className="group/name flex min-w-0 flex-col rounded-sm focus-ring"
      >
        <span className="truncate font-medium group-hover/name:underline">
          {row.original.name}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {row.original.key}
        </span>
      </a>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = STATUS[row.original.status]
      return <Badge tone={s.tone}>{s.label}</Badge>
    },
  },
  {
    id: "owner",
    accessorFn: (p) => p.owner.name,
    header: "Owner",
    meta: { hideOnMobile: true },
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarFallback className="bg-tone-blue-soft font-medium text-tone-blue">
            {row.original.owner.initials}
          </AvatarFallback>
        </Avatar>
        <span className="truncate">{row.original.owner.name}</span>
      </span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    meta: { hideOnMobile: true },
    cell: ({ row }) => (
      <time
        dateTime={row.original.updatedAt}
        className="text-muted-foreground tabular-nums"
      >
        {date.format(new Date(row.original.updatedAt))}
      </time>
    ),
  },
  {
    accessorKey: "budget",
    header: "Budget",
    meta: { align: "end", hideOnMobile: true },
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {money.format(row.original.budget)}
      </span>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${row.original.name}`}
              />
            }
          >
            <MoreHorizontalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Open</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

/** Demo: the projects list. `?demo=loading|error|empty` shows each state. */
export function ProjectsTable({
  state = "ready",
}: {
  state?: "ready" | "loading" | "error" | "empty"
}) {
  const [projects, setProjects] = React.useState(
    state === "empty" ? [] : SAMPLE_PROJECTS
  )

  const archive = (rows: Project[], clear: () => void) => {
    const ids = new Set(rows.map((r) => r.id))
    const before = projects
    setProjects((list) => list.filter((p) => !ids.has(p.id)))
    clear()
    toastUndo(
      rows.length === 1
        ? `Archived “${rows[0].name}”`
        : `Archived ${rows.length} projects`,
      {
        onUndo: () => setProjects(before),
      }
    )
  }

  return (
    <DataTable
      columns={columns}
      data={projects}
      status={
        state === "loading" ? "loading" : state === "error" ? "error" : "ready"
      }
      onRetry={() => toast("Retrying…")}
      getRowId={(p) => p.id}
      noun={{ one: "project", other: "projects" }}
      searchPlaceholder="Search projects"
      filters={[
        {
          id: "status",
          label: "Status",
          options: Object.entries(STATUS).map(([value, s]) => ({
            value,
            label: s.label,
          })),
        },
      ]}
      bulkActions={(rows, clear) => (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast(`Exported ${rows.length} projects`)}
          >
            <DownloadIcon data-icon="inline-start" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => archive(rows, clear)}
          >
            <ArchiveIcon data-icon="inline-start" />
            Archive
          </Button>
        </>
      )}
      emptyState={
        <Empty className="rounded-lg py-16 shadow-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderPlusIcon />
            </EmptyMedia>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Projects keep your work and teammates in one place.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>Create project</Button>
          </EmptyContent>
        </Empty>
      }
    />
  )
}
