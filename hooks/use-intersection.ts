"use client"

import * as React from "react"

type Options = {
  /** Scroll container to observe against. Defaults to the viewport. */
  root?: Element | Document | null
  rootMargin?: string
  threshold?: number | number[]
  /** Stop observing after the first time the element intersects. */
  once?: boolean
}

/**
 * Observes an element with `IntersectionObserver`. Returns a ref callback to
 * put on the element and the latest entry plus a boolean. Nothing is observed
 * on the server; `isIntersecting` starts `false`.
 *
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
