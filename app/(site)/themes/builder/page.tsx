import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import type { Metadata } from "next"
import { z } from "zod"

import { ThemeBuilder } from "@/components/playground/theme-builder"
import { TooltipProvider } from "@/components/ui/tooltip"
import { installCommand } from "@/lib/docs"

export const metadata: Metadata = {
  title: "Theme builder",
  description:
    "Edit a theme's colors, radius and fonts with a live preview and contrast check, then export tweakcn JSON or CSS.",
}

const Vars = z.record(z.string(), z.string())
const ThemeFile = z.object({
  cssVars: z.object({ light: Vars.optional(), dark: Vars.optional() }),
})

function loadThemes() {
  const dir = join(process.cwd(), "registry/themes")
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => {
      const name = f.replace(/\.json$/, "")
      const { cssVars } = ThemeFile.parse(
        JSON.parse(readFileSync(join(dir, f), "utf8"))
      )
      return {
        name,
        light: cssVars.light ?? {},
        dark: cssVars.dark ?? {},
        install: installCommand(`theme-${name}`),
      }
    })
}

export default function Page() {
  return (
    <TooltipProvider>
      <ThemeBuilder themes={loadThemes()} />
    </TooltipProvider>
  )
}
