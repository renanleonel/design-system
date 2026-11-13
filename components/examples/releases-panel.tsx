"use client"

import {
  CheckIcon,
  GitBranchIcon,
  PlusIcon,
  RocketIcon,
  ServerIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SearchIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataItem, DataList } from "@/components/ui/data-list"
import { IconTile } from "@/components/ui/icon-tile"
import {
  Panel,
  PanelActions,
  PanelCard,
  PanelContent,
  PanelHeader,
} from "@/components/ui/panel"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Tone = "blue" | "green" | "orange" | "purple"

// Full class names (Tailwind can't see classes built from template strings).
const AVATAR_TONE: Record<Tone, string> = {
  blue: "bg-tone-blue/15 text-tone-blue",
  green: "bg-tone-green/15 text-tone-green",
  orange: "bg-tone-orange/15 text-tone-orange",
  purple: "bg-tone-purple/15 text-tone-purple",
}

const PEOPLE: Record<string, Tone> = {
  AK: "blue",
  ML: "purple",
  RS: "orange",
  JT: "green",
}

function People({ initials }: { initials: string[] }) {
  return (
    <AvatarGroup>
      {initials.map((i) => (
        <Avatar key={i} className="ring-2 ring-card">
          <AvatarFallback
            className={`text-xs font-medium ${AVATAR_TONE[PEOPLE[i]]}`}
          >
            {i}
          </AvatarFallback>
        </Avatar>
      ))}
    </AvatarGroup>
  )
}

/** "A → B" with the elapsed time on a dashed arc: source on the leading edge, target trailing. */
function Route() {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-end gap-3">
      <div>
        <p className="font-heading text-3xl leading-none font-semibold tracking-tight">
          main
        </p>
        <p className="mt-1.5 text-sm whitespace-nowrap text-muted-foreground tabular-nums">
          Started 14:02
        </p>
      </div>
      <div className="flex flex-col items-center gap-1 pb-1 text-muted-foreground">
        <div className="flex w-full items-center gap-1.5">
          <span className="size-1.5 shrink-0 rounded-full bg-border" />
          <span className="h-px flex-1 border-t border-dashed" />
          <RocketIcon className="size-4 shrink-0 text-foreground" />
          <span className="h-px flex-1 border-t border-dashed" />
          <span className="size-1.5 shrink-0 rounded-full bg-tone-green" />
        </div>
        <span className="text-xs tabular-nums">4m 12s</span>
      </div>
      <div className="text-end">
        <p className="font-heading text-3xl leading-none font-semibold tracking-tight">
          prod
        </p>
        <p className="mt-1.5 text-sm whitespace-nowrap text-muted-foreground tabular-nums">
          Live 14:06
        </p>
      </div>
    </div>
  )
}

/** Dashed tear line with notches cut into the card edges (the tray color shows through). */
function TearLine() {
  return (
    <div
      aria-hidden
      className="relative -mx-(--ds-card-pad) my-1 flex items-center"
    >
      <span className="size-4 -translate-x-1/2 rounded-full bg-panel" />
      <span className="h-px flex-1 border-t border-dashed" />
      <span className="size-4 translate-x-1/2 rounded-full bg-panel" />
    </div>
  )
}

const SERVICES: {
  name: string
  meta: string
  icon: React.ReactNode
  tone: Tone
  people: string[]
  status: { label: string; tone: Tone }
}[] = [
  {
    name: "Search service",
    meta: "staging · 12 min ago",
    icon: <SearchIcon />,
    tone: "blue",
    people: ["AK", "ML", "JT"],
    status: { label: "Building", tone: "blue" },
  },
  {
    name: "Auth gateway",
    meta: "canary · 5% traffic",
    icon: <ShieldCheckIcon />,
    tone: "purple",
    people: ["RS", "ML"],
    status: { label: "In 2 h", tone: "purple" },
  },
  {
    name: "Billing worker",
    meta: "Not scheduled",
    icon: <ServerIcon />,
    tone: "orange",
    people: ["JT"],
    status: { label: "Draft", tone: "orange" },
  },
]

export function ReleasesPanel() {
  return (
    <Panel className="w-full max-w-3xl">
      <PanelHeader
        icon={<GitBranchIcon />}
        title="Releases"
        actions={
          <Tabs defaultValue="active">
            <TabsList variant="segmented" aria-label="Releases">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />
      <PanelContent className="md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <PanelCard className="gap-5">
          <div className="flex items-center gap-3">
            <IconTile tone="inverse">
              <RocketIcon />
            </IconTile>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-medium">
                v2.14.0 · Checkout redesign
              </p>
              <p className="truncate text-sm text-muted-foreground">
                Promoted by Ana Kowalski
              </p>
            </div>
            <Badge tone="green" size="md">
              Live
            </Badge>
          </div>
          <Route />
          <DataList>
            <DataItem label="Commit">a1f9c2e</DataItem>
            <DataItem label="Region">eu-west-1</DataItem>
            <DataItem label="Checks">24 / 24</DataItem>
            <DataItem label="Bundle">1.2 MB</DataItem>
          </DataList>
          {/* Pinned to the bottom so the card reads as one ticket at any height. */}
          <div className="mt-auto flex flex-col gap-4">
            <TearLine />
            <div className="flex items-center gap-3">
              <People initials={["AK", "ML", "RS"]} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">3 reviewers</p>
                <p className="flex items-center gap-1 text-sm text-tone-green">
                  All approved <CheckIcon className="size-3.5" />
                </p>
              </div>
              <Button variant="outline" size="sm">
                Logs
              </Button>
            </div>
          </div>
        </PanelCard>

        <div className="flex min-w-0 flex-col gap-(--ds-panel-pad)">
          {SERVICES.map((s) => (
            <PanelCard
              key={s.name}
              interactive
              className="flex-row items-center gap-3"
            >
              <IconTile tone={s.tone} size="lg">
                {s.icon}
              </IconTile>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium">{s.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {s.meta}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <People initials={s.people} />
                  <Badge tone={s.status.tone} size="md">
                    {s.status.label}
                  </Badge>
                </div>
              </div>
            </PanelCard>
          ))}
          <PanelActions className="mt-auto">
            <Button size="lg" className="flex-1" hotkey="Shift+N">
              <PlusIcon data-icon="inline-start" />
              New release
            </Button>
            <Button
              variant="surface"
              size="icon-lg"
              aria-label="Release settings"
            >
              <Settings2Icon />
            </Button>
          </PanelActions>
        </div>
      </PanelContent>
    </Panel>
  )
}
