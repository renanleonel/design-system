"use client"

import { PlusIcon } from "lucide-react"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import { CustomersTable } from "@/components/blocks/grouped-table/customers-table"
import { Button } from "@/components/ui/button"

export default function CustomersPage() {
  return (
    <>
      <AppShellHeader
        title="Customers"
        description="Grouped by rating, size, owner or country"
        actions={
          <Button hotkey="Shift+N">
            <PlusIcon data-icon="inline-start" />
            Add company
          </Button>
        }
      />
      <AppShellContent>
        <CustomersTable className="h-[calc(100dvh-10.5rem)]" />
      </AppShellContent>
    </>
  )
}
