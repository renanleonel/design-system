"use client"

import { Hotkey } from "@/components/ui/hotkey"

/** Rendered for your platform: ⌘ on macOS, Ctrl elsewhere. */
export function Default() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Hotkey hotkey="Mod+K" />
      <Hotkey hotkey="Mod+Shift+P" />
      <Hotkey hotkey="Alt+Enter" />
    </div>
  )
}

/** The quiet form used in menus and palettes. */
export function Text() {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <Hotkey hotkey="Mod+E" variant="text" />
      <Hotkey hotkey="Mod+Backspace" variant="text" />
    </div>
  )
}
