"use client"

import * as React from "react"

type Options<T> = {
  serialize?: (value: T) => string
  deserialize?: (raw: string) => T
}

// Same-tab writes don't fire `storage`, so notify our own subscribers.
const listeners = new Map<string, Set<() => void>>()

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null // private mode, blocked storage
  }
}

function notify(key: string) {
  listeners.get(key)?.forEach((fn) => fn())
}

function subscribe(key: string, onChange: () => void) {
  let set = listeners.get(key)
  if (!set) listeners.set(key, (set = new Set()))
  set.add(onChange)
  const onStorage = (e: StorageEvent) => {
    // `key === null` means storage was cleared.
    if (e.key === key || e.key === null) onChange()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    set.delete(onChange)
    window.removeEventListener("storage", onStorage)
  }
}

/**
 * The server (and hydration) renders `initialValue`; private mode and corrupt
 * JSON fall back to it instead of throwing.
 *
 * ```tsx
 * const [view, setView, resetView] = useLocalStorage<"grid" | "list">("view", "grid")
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  { serialize = JSON.stringify, deserialize = JSON.parse }: Options<T> = {}
) {
  const initialRef = React.useRef(initialValue)
  const codec = React.useRef({ serialize, deserialize })
  React.useLayoutEffect(() => {
    initialRef.current = initialValue
    codec.current = { serialize, deserialize }
  })

  const raw = React.useSyncExternalStore(
    React.useCallback((onChange) => subscribe(key, onChange), [key]),
    () => read(key),
    () => null
  )

  // Parse only when the raw string changes, so the value keeps its identity.
  // Hoist object `initialValue`s (and custom `deserialize`) out of the render
  // to keep the fallback stable too.
  const value = React.useMemo<T>(() => {
    if (raw === null) return initialValue
    try {
      return deserialize(raw)
    } catch {
      return initialValue // corrupt JSON
    }
  }, [raw, initialValue, deserialize])

  const setValue = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      let prev = initialRef.current
      const current = read(key)
      if (current !== null) {
        try {
          prev = codec.current.deserialize(current)
        } catch {}
      }
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(prev) : next
      try {
        window.localStorage.setItem(key, codec.current.serialize(resolved))
      } catch {}
      notify(key)
    },
    [key]
  )

  const remove = React.useCallback(() => {
    try {
      window.localStorage.removeItem(key)
    } catch {}
    notify(key)
  }, [key])

  return [value, setValue, remove] as const
}
