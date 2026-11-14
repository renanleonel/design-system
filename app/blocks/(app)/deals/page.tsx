"use client"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import { DealsTable } from "@/components/blocks/editable-table/deals-table"

export default function DealsPage() {
  return (
    <>
      <AppShellHeader
        title="Deals"
        description="Edit any cell; it saves on its own"
      />
      <AppShellContent>
        <DealsTable />
      </AppShellContent>
    </>
  )
}
