"use client"

import * as React from "react"
import { DirectionProvider } from "@base-ui/react/direction-provider"

type Dir = "ltr" | "rtl"

const EVENT = "ds-dir-change"

function read(): Dir {
  return new URLSearchParams(window.location.search).get("dir") === "rtl"
    ? "rtl"
    : "ltr"
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  window.addEventListener("popstate", onChange)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener("popstate", onChange)
  }
}

/** Docs-site only: `?dir=rtl` mirrors the page. Not part of any registry item. */
export function useDocsDir(): [Dir, (next: Dir) => void] {
  const dir = React.useSyncExternalStore(subscribe, read, () => "ltr" as Dir)
  const set = React.useCallback((next: Dir) => {
    const url = new URL(window.location.href)
    if (next === "rtl") url.searchParams.set("dir", "rtl")
    else url.searchParams.delete("dir")
    window.history.replaceState(null, "", url)
    window.dispatchEvent(new Event(EVENT))
  }, [])
  return [dir, set]
}

/** Sets `dir` on <html> and wraps the tree in Base UI's DirectionProvider. */
export function DocsDirection({ children }: { children: React.ReactNode }) {
  const [dir] = useDocsDir()
  React.useEffect(() => {
    document.documentElement.dir = dir
    return () => {
      document.documentElement.removeAttribute("dir")
    }
  }, [dir])
  return <DirectionProvider direction={dir}>{children}</DirectionProvider>
}
