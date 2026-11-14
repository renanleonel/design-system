"use client"

import * as React from "react"

const subscribe = () => () => {}

/**
 * `false` on the server and during hydration, `true` afterwards. Gate output
 * that differs between server and client (theme, locale, `window` reads):
 *
 * ```tsx
 * const mounted = useMounted()
 * return mounted ? <Clock /> : <Skeleton className="h-6 w-20" />
 * ```
 */
export function useMounted() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
