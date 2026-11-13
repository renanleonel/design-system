"use client"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import { SettingsPage } from "@/components/blocks/settings/settings-page"

export default function Page() {
  return (
    <>
      <AppShellHeader
        title="Settings"
        description="Profile, members and workspace"
      />
      <AppShellContent className="max-w-4xl">
        <SettingsPage workspace="Acme" />
      </AppShellContent>
    </>
  )
}
