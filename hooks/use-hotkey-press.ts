"use client"

import * as React from "react"
import { useHotkey, type RegisterableHotkey } from "@tanstack/react-hotkeys"

/**
 * Clicks `element` as if pressed. Popups it opens skip their entrance motion:
 * keyboard-initiated actions never animate (`animate` skill), so `data-ds-instant`
 * zeroes the motion-* transitions for the two frames the popup takes to mount.
 */
export function pressInstantly(element: HTMLElement | null | undefined) {
  if (!element) return
  const root = document.documentElement
  root.setAttribute("data-ds-instant", "")
  element.click()
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.removeAttribute("data-ds-instant"))
  )
}

/** Presses the element in `ref` when `hotkey` fires. No hotkey registers nothing. */
export function useHotkeyPress(
  ref: React.RefObject<HTMLElement | null>,
  hotkey: RegisterableHotkey | null | undefined,
  { enabled = true }: { enabled?: boolean } = {}
) {
  useHotkey(hotkey, () => pressInstantly(ref.current), { enabled })
}

/** `aria-keyshortcuts` value. `Mod` lists both platforms, so server and client agree. */
export function toAriaKeyShortcuts(
  hotkey: RegisterableHotkey | null | undefined
) {
  if (!hotkey || typeof hotkey !== "string") return undefined
  const map: Record<string, string> = {
    Ctrl: "Control",
    Cmd: "Meta",
    Option: "Alt",
  }
  const chord = (mod: string) =>
    hotkey
      .split("+")
      .map((key) => (key === "Mod" ? mod : (map[key] ?? key)))
      .join("+")
  return hotkey.split("+").includes("Mod")
    ? `${chord("Control")} ${chord("Meta")}`
    : chord("")
}

/** Merges refs into one callback ref. */
export function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    }
  }
}
