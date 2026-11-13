"use client"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import { ActivityLog } from "@/components/blocks/infinite-table/activity-log"

export default function ActivityPage() {
  // ?demo=error fails the third page once; ?demo=empty returns nothing.
  return (
    <>
      <AppShellHeader
        title="Activity"
        description="Every event in your workspace, newest first"
      />
      <AppShellContent>
        <ActivityLog className="h-[calc(100dvh-13rem)]" />
      </AppShellContent>
    </>
  )
}
