"use client"

import * as React from "react"
import { cn } from "cn"

import { DemoStory } from "@/components/demos"

/**
 * A story that loads once it's within ~800px of the viewport. The home page's
 * preview grid sits below the fold, and its demos (forms, charts, calendars,
 * drag and drop) would otherwise all ship with the first load. The wide margin
 * lets tiles swap in, and the columns rebalance, before anyone scrolls to them.
 */
export function LazyDemo({
  name,
  story,
  className,
}: {
  name: string
  story: string
  /** Placeholder size; match the demo's height to keep the swap still. */
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [near, setNear] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el || near) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true)
      },
      { rootMargin: "800px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [near])

  if (near) return <DemoStory name={name} story={story} />
  return <div ref={ref} aria-hidden className={cn("h-40 w-full", className)} />
}
