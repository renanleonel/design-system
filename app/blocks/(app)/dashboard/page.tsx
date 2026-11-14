"use client"

import * as React from "react"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import { DashboardPage } from "@/components/blocks/dashboard/dashboard-page"
import {
  GetStartedChecklist,
  type ChecklistItem,
} from "@/components/blocks/onboarding/get-started-checklist"

const TASKS: Omit<ChecklistItem, "done" | "action">[] = [
  { id: "workspace", title: "Create your workspace", description: "Name it and pick a data region." },
  { id: "project", title: "Create your first project", description: "Connect a repository and every push gets a preview URL." },
  { id: "invite", title: "Invite your team", description: "Members can comment on previews and deploy." },
  { id: "domain", title: "Add a custom domain", description: "Point your DNS at us; certificates are automatic." },
]
const ACTIONS: Record<string, string> = {
  project: "Create project",
  invite: "Invite people",
  domain: "Add domain",
}

export default function Page() {
  const [done, setDone] = React.useState<string[]>(["workspace"])
  const [hidden, setHidden] = React.useState(false)
  const items: ChecklistItem[] = TASKS.map((task) => ({
    ...task,
    done: done.includes(task.id),
    action: ACTIONS[task.id]
      ? {
          label: ACTIONS[task.id],
          onClick: () => setDone((d) => [...d, task.id]),
        }
      : undefined,
  }))
  return (
    <>
      <AppShellHeader title="Dashboard" description="Revenue, usage and activity" />
      <AppShellContent className="gap-6">
        {!hidden && (
          <GetStartedChecklist
            items={items}
            onDismiss={() => setHidden(true)}
            className="max-w-xl"
          />
        )}
        <DashboardPage activityHref="/blocks/activity" />
      </AppShellContent>
    </>
  )
}
