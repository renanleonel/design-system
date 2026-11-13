"use client"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import { GeneralSettings } from "@/components/blocks/settings/general-settings"

export default function Page() {
  return (
    <>
      <AppShellHeader
        title="General"
        description="Workspace name, URL, locale and defaults"
      />
      <AppShellContent className="max-w-4xl">
        <GeneralSettings />
      </AppShellContent>
    </>
  )
}
