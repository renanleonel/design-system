"use client"

import * as React from "react"

const EVENT = "ds:urlchange"

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange)
  window.addEventListener(EVENT, onChange)
  return () => {
    window.removeEventListener("popstate", onChange)
    window.removeEventListener(EVENT, onChange)
  }
}

const getSearch = () => window.location.search
const getServerSearch = () => ""

export function useSearchParams() {
  const search = React.useSyncExternalStore(
    subscribe,
    getSearch,
    getServerSearch
  )
  return React.useMemo(() => new URLSearchParams(search), [search])
}

/**
 * Writes params. `mode: "replace"` for rapid changes (typing, paging through
 * results) so Back isn't flooded; `"push"` for discrete navigation (tabs).
 * `null` / `""` removes a param, so defaults never clutter the URL.
 */
export function setSearchParams(
  next: Record<string, string | number | null | undefined>,
  mode: "replace" | "push" = "replace"
) {
  const params = new URLSearchParams(window.location.search)
  for (const [key, value] of Object.entries(next)) {
    if (value === null || value === undefined || value === "")
      params.delete(key)
    else params.set(key, String(value))
  }
  const query = params.toString()
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
  window.history[mode === "push" ? "pushState" : "replaceState"](
    window.history.state,
    "",
    url
  )
  window.dispatchEvent(new Event(EVENT))
}

export function useUrlState(
  key: string,
  fallback = "",
  mode: "replace" | "push" = "replace"
) {
  const params = useSearchParams()
  const value = params.get(key) ?? fallback
  const setValue = React.useCallback(
    (next: string | null) =>
      setSearchParams({ [key]: next === fallback ? null : next }, mode),
    [key, fallback, mode]
  )
  return [value, setValue] as const
}
