import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import type { Metadata } from "next"
import { z } from "zod"

import { Playground } from "@/components/playground/playground"
import { TooltipProvider } from "@/components/ui/tooltip"
import { installCommand } from "@/lib/docs"

export const metadata: Metadata = { title: "Themes" }

const Vars = z.record(z.string(), z.string())
const ThemeFile = z.object({
  cssVars: z.object({ light: Vars.optional(), dark: Vars.optional() }),
})

function loadThemes() {
  const dir = join(process.cwd(), "registry/themes")
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const name = f.replace(/\.json$/, "")
      const { cssVars } = ThemeFile.parse(
        JSON.parse(readFileSync(join(dir, f), "utf8"))
      )
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
      <TooltipProvider>
        <Playground
          themes={themes.map((t) => ({
            ...t,
            install: installCommand(`theme-${t.name}`),
          }))}
        />
      </TooltipProvider>
    </>
  )
}
