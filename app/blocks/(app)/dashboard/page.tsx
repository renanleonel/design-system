"use client"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import { DashboardPage } from "@/components/blocks/dashboard/dashboard-page"

export default function Page() {
  return (
    <>
      <AppShellHeader title="Dashboard" description="Revenue, usage and activity" />
      <AppShellContent>
        <DashboardPage />
      </AppShellContent>
    </>
  )
}
