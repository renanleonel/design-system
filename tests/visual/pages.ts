import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

/** Every ui component with a docs page (`/components/<name>`), from the registry. */
export function componentNames(): string[] {
  const registry = JSON.parse(readFileSync("registry.json", "utf8")) as {
    items: { name: string; type: string }[]
  }
  return registry.items
    .filter((i) => i.type === "registry:ui")
    .map((i) => i.name)
}

export type BlockRoute = {
  /** URL path, e.g. `/blocks/settings/general`. */
  route: string
  /** The demo route reads `?data=worst`. */
  worst: boolean
}

/** Every demo route under `app/blocks` (route groups stripped), found on disk. */
export function blockRoutes(): BlockRoute[] {
  const root = path.join("app", "blocks")
  const out: BlockRoute[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry)
      if (statSync(full).isDirectory()) walk(full)
      else if (entry === "page.tsx") {
        const segments = path
          .relative(root, dir)
          .split(path.sep)
          .filter((s) => s && !(s.startsWith("(") && s.endsWith(")")))
        out.push({
          route: "/blocks" + (segments.length ? "/" + segments.join("/") : ""),
          worst: /["']worst["']/.test(readFileSync(full, "utf8")),
        })
      }
    }
  }
  walk(root)
  return out
    .filter((b) => b.route !== "/blocks")
    .sort((a, b) => a.route.localeCompare(b.route))
}
