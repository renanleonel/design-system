"use client"

import { CheckCheckIcon } from "lucide-react"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function Page() {
  return (
    <>
      <AppShellHeader
        title="Inbox"
        description="Mentions, reviews and assignments"
      />
      <AppShellContent className="flex-1 justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CheckCheckIcon />
            </EmptyMedia>
            <EmptyTitle>You&apos;re all caught up</EmptyTitle>
            <EmptyDescription>
              New mentions and review requests show up here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </AppShellContent>
    </>
  )
}
