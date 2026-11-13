"use client"

import * as React from "react"

/**
 * Subscribes to a media query with `useSyncExternalStore` (no effect, no tearing).
 * The server snapshot is `false`, so components render their desktop form first;
 * overlays are closed on load, so the switch never shows.
 */
export function useMediaQuery(query: string) {
  return React.useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener("change", onChange)
      return () => list.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

/** Below Tailwind's `sm` (640px): dialogs and popovers become bottom sheets. */
export const MOBILE_QUERY = "(max-width: 639px)"
export const useIsMobile = () => useMediaQuery(MOBILE_QUERY)

/** Touch-first devices: selects use the native picker. */
export const useIsTouch = () => useMediaQuery("(pointer: coarse)")
