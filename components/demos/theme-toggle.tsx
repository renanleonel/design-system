"use client"

import { ThemeSwitcher, ThemeToggle } from "@/components/ui/theme-toggle"

/** Mount next-themes' `ThemeProvider` (attribute="class") once at the root. */
export function Default() {
  return <ThemeToggle hotkey="Shift+D" />
}

export function Switcher() {
  return <ThemeSwitcher />
}

export function WithLabels() {
  return <ThemeSwitcher showLabels />
}
