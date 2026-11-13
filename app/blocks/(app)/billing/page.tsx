"use client"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import { BillingPage } from "@/components/blocks/billing/billing-page"

export default function Page() {
  return (
    <>
      <AppShellHeader title="Billing" description="Plan, usage and invoices" />
      <AppShellContent>
        <BillingPage />
      </AppShellContent>
    </>
  )
}
