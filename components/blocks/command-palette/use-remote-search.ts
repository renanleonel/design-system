"use client"

import * as React from "react"

import type { PaletteCommand } from "./command-palette"

type Remote =
  | { query: string; items: PaletteCommand[]; error?: false }
  | { query: string; items: []; error: true }

const NONE: PaletteCommand[] = []

/**
 * Debounced async lookup behind the palette. Results are tagged with the query
 * they answer, so "loading" is derived (the input has moved on) and a stale
 * answer never shows.
 */
export function useRemoteSearch(
  lookup:
    | ((query: string, signal: AbortSignal) => Promise<PaletteCommand[]>)
    | undefined,
  query: string,
  debounced: string,
  enabled: boolean
) {
  const [remote, setRemote] = React.useState<Remote | null>(null)

  const remoteQuery = enabled && lookup ? debounced.trim() : ""
  React.useEffect(() => {
    if (!remoteQuery || !lookup) return
    const controller = new AbortController()
    lookup(remoteQuery, controller.signal).then(
      (items) => {
        if (!controller.signal.aborted) setRemote({ query: remoteQuery, items })
      },
      () => {
        if (!controller.signal.aborted)
          setRemote({ query: remoteQuery, items: [], error: true })
      }
    )
    return () => controller.abort()
  }, [remoteQuery, lookup])

  const wanted = enabled && !!lookup && query.trim() !== ""
  const ready = wanted && remote?.query === query.trim()
  return {
    loading: wanted && !ready,
    items: ready && !remote.error ? remote.items : NONE,
    failed: ready && remote.error === true,
    reset: () => setRemote(null),
  }
}
