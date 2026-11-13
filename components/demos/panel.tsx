"use client"

import { GlobeIcon, PlusIcon, ServerIcon } from "lucide-react"

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

/** A tray with concentric cards and one primary action. See /examples for a full composition. */
export function Default() {
  return (
    <Panel className="w-full max-w-md">
      <PanelHeader
        icon={<ServerIcon />}
        title="Production"
        description="eu-west-1 · 3 instances"
        actions={<Badge tone="green">Healthy</Badge>}
      />
      <PanelContent className="sm:grid-cols-2">
        <PanelCard>
          <DataList layout="stack">
            <DataItem label="Requests">1.2M</DataItem>
            <DataItem label="p95">182 ms</DataItem>
          </DataList>
        </PanelCard>
        <PanelCard interactive className="flex items-center gap-3">
          <IconTile tone="blue">
            <GlobeIcon />
          </IconTile>
          <div className="min-w-0">
            <p className="truncate font-medium">acme.app</p>
            <p className="text-sm text-muted-foreground">Primary domain</p>
          </div>
        </PanelCard>
      </PanelContent>
      <PanelActions>
        <Button className="flex-1">Deploy</Button>
        <Button variant="surface" size="icon" aria-label="Add instance">
          <PlusIcon />
        </Button>
      </PanelActions>
    </Panel>
  )
}
