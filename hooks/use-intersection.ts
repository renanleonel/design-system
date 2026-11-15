"use client"

import * as React from "react"

type Options = {
  root?: Element | Document | null
  rootMargin?: string
  threshold?: number | number[]
  once?: boolean
}

/**
 * ```tsx
 * const [ref, { isIntersecting }] = useIntersection({ once: true, rootMargin: "100px" })
 * <div ref={ref}>{isIntersecting ? <HeavyChart /> : null}</div>
 * ```
 */
export function useIntersection<T extends Element = HTMLElement>({
  root = null,
  rootMargin = "0px",
  threshold = 0,
  once = false,
}: Options = {}) {
  const [entry, setEntry] = React.useState<IntersectionObserverEntry | null>(
    null
  )
  const [element, setElement] = React.useState<T | null>(null)
  // Compare thresholds by content, so an inline array doesn't re-observe.
  const thresholdKey = Array.isArray(threshold)
    ? threshold.join(",")
    : String(threshold)

  React.useEffect(() => {
    if (!element || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      (entries) => {
        const latest = entries[entries.length - 1]
        if (!latest) return
        setEntry(latest)
        if (once && latest.isIntersecting) observer.disconnect()
      },
      {
        root,
        rootMargin,
        threshold: thresholdKey.split(",").map(Number),
      }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [element, root, rootMargin, thresholdKey, once])

  return [
    setElement as (node: T | null) => void,
    { entry, isIntersecting: entry?.isIntersecting ?? false },
  ] as const
}
