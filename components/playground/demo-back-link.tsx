"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "cn"
import { ArrowLeftIcon } from "lucide-react"

const noop = () => () => {}
/** True inside an iframe (the blocks gallery previews), after hydration. */
const useEmbedded = () =>
  React.useSyncExternalStore(
    noop,
    () => window.self !== window.top,
    () => false
  )

/**
 * Demo-only: a way back to the gallery from full-screen block demos that have
 * no navigation of their own (auth pages, setup). Not part of a block, and
 * hidden inside the gallery's previews.
 */
export function DemoBackLink({
  position = "bottom-left",
}: {
  position?: "bottom-left" | "top-right"
}) {
  if (useEmbedded()) return null
  return (
    <Link
      href="/blocks"
      className={cn(
        "fixed z-50 inline-flex items-center gap-1.5 rounded-full bg-popover py-1.5 ps-2.5 pe-3 text-xs font-medium text-muted-foreground shadow-popover focus-ring transition-colors hover:text-foreground",
        position === "top-right" ? "top-4 right-4" : "bottom-4 left-4"
      )}
    >
      <ArrowLeftIcon className="size-3.5" />
      All blocks
    </Link>
  )
}
