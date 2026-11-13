"use client"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import { ActivityLog } from "@/components/blocks/infinite-table/activity-log"

export default function ActivityPage() {
  // ?demo=error fails the third page once, ?demo=slow takes 4s a page,
  // ?demo=empty returns nothing.
  return (
    <>
      <AppShellHeader
        title="Activity"
        description="Every event in your workspace, newest first"
      />
      <AppShellContent fill>
        <ActivityLog className="min-h-0 flex-1" />
      </AppShellContent>
    </>
  )
}
