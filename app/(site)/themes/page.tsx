import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import type { Metadata } from "next"

import { Playground } from "@/components/playground/playground"
import { installCommand } from "@/lib/docs"

export const metadata: Metadata = { title: "Themes" }

type ThemeFile = {
  cssVars: { light?: Record<string, string>; dark?: Record<string, string> }
}

function loadThemes() {
  const dir = join(process.cwd(), "registry/themes")
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const name = f.replace(/\.json$/, "")
      const { cssVars } = JSON.parse(
        readFileSync(join(dir, f), "utf8")
      ) as ThemeFile
      return { name, cssVars }
    })
}

const decl = (vars: Record<string, string> = {}) =>
  Object.entries(vars)
    .map(([k, v]) => `--${k}:${v};`)
    .join("")

export default function Page() {
  const themes = loadThemes()
  const css = themes
    .map(
      ({ name, cssVars }) =>
        `:root[data-ds-theme="${name}"]{${decl(cssVars.light)}}` +
        `:root.dark[data-ds-theme="${name}"]{${decl(cssVars.dark)}}`
    )
    .join("\n")

  return (
    <>
      <style>{css}</style>
      <Playground
        themes={themes.map((t) => ({
          ...t,
          install: installCommand(`theme-${t.name}`),
        }))}
      />
    </>
  )
}
