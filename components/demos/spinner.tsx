"use client"

import { Spinner } from "@/components/ui/spinner"

export function Default() {
  return (
    <div className="flex items-center gap-4">
      <Spinner className="size-3" />
      <Spinner />
      <Spinner className="size-6" />
    </div>
  )
}

export function WithLabel() {
  return (
    <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      Syncing 3 of 12 files…
    </p>
  )
}
