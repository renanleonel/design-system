// Generates public/llms.txt (index) and public/llms-full.txt (adds catalog
// notes, export names and changelog) from registry.json, registry/catalog.json
// and registry/changelog.json. Run by `registry:gen` after gen-registry.mjs.
// Output depends only on repo files, so CI's registry diff check stays stable.
import { readFileSync, writeFileSync, existsSync } from "node:fs"

const BASE_URL = (
  process.env.REGISTRY_URL ??
  "https://raw.githubusercontent.com/renanleonel/design-system/main/public/r"
).replace(/\/$/, "")

const registry = JSON.parse(readFileSync("registry.json", "utf8"))
const catalog = JSON.parse(readFileSync("registry/catalog.json", "utf8"))
const changelog = existsSync("registry/changelog.json")
  ? JSON.parse(readFileSync("registry/changelog.json", "utf8"))
  : {}

// Changelog: { "<item>": [{ date: "YYYY-MM-DD", change: "...", commit?: "..." }] }
const names = new Set(registry.items.map((i) => i.name))
for (const [name, entries] of Object.entries(changelog)) {
  if (!names.has(name))
    throw new Error(`registry/changelog.json: "${name}" is not a registry item`)
  if (!Array.isArray(entries) || entries.length === 0)
    throw new Error(`registry/changelog.json: "${name}" needs a non-empty array`)
  let prev = "9999-99-99"
  for (const e of entries) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e?.date ?? ""))
      throw new Error(`registry/changelog.json: "${name}" has a bad date "${e?.date}"`)
    if (typeof e.change !== "string" || !e.change.trim())
      throw new Error(`registry/changelog.json: "${name}" has an empty change`)
    if (e.date > prev)
      throw new Error(`registry/changelog.json: "${name}" entries must be newest first`)
    prev = e.date
  }
}

function exportsOf(item) {
  const found = new Set()
  for (const file of item.files) {
    if (!/\.tsx?$/.test(file.path)) continue
    const src = readFileSync(file.path, "utf8")
    for (const [, n] of src.matchAll(
      /^export\s+(?:async\s+)?(?:function\*?|const|let|class|type|interface|enum)\s+(\w+)/gm
    ))
      found.add(n)
    for (const [, list] of src.matchAll(/^export\s*\{([^}]*)\}/gm))
      for (const part of list.split(","))
        {
          const n = part.trim().split(/\s+as\s+/).pop()
          if (n && n !== "default") found.add(n)
        }
  }
  return [...found].sort()
}

const GROUPS = [
  ["registry:base", "Base"],
  ["registry:style", "Styles"],
  ["registry:theme", "Themes"],
  ["registry:lib", "Libraries"],
  ["registry:hook", "Hooks"],
  ["registry:ui", "Components"],
  ["registry:block", "Blocks"],
]
const url = (i) => `${BASE_URL}/${i.name}.json`
const one = (s) => String(s ?? "").replace(/\s+/g, " ").trim()
const sorted = (type) =>
  registry.items
    .filter((i) => i.type === type)
    .sort((a, b) => a.name.localeCompare(b.name))

const header = [
  "# renanleonel/ui",
  "",
  "> A shadcn registry on Base UI: accessible, themeable components, hooks and full-screen blocks for React and Next.js. Install an item with `npx shadcn add <url>`, or `npx shadcn add @renanleonel/<name>` after registering the namespace (see README).",
  "",
]

function line(i, extra = "") {
  const title = i.title ?? i.name
  const desc = one(i.description)
  return `- [${title}](${url(i)})${desc ? `: ${desc}` : ""}${extra}`
}

const index = [...header]
for (const [type, label] of GROUPS) {
  const items = sorted(type)
  if (!items.length) continue
  index.push(`## ${label}`, "", ...items.map((i) => line(i)), "")
}
writeFileSync("public/llms.txt", index.join("\n").trimEnd() + "\n")

const full = [...header]
for (const [type, label] of GROUPS) {
  const items = sorted(type)
  if (!items.length) continue
  full.push(`## ${label}`, "")
  for (const i of items) {
    full.push(`### ${i.name}`, "", line(i).replace(/^- /, ""), "")
    full.push(`Install: \`npx shadcn add ${url(i)}\``, "")
    const deps = (i.dependencies ?? []).filter(Boolean)
    if (deps.length) full.push(`npm: ${deps.join(", ")}`)
    const reg = (i.registryDependencies ?? []).map((r) =>
      r.replace(/^.*\//, "").replace(/\.json$/, "")
    )
    if (reg.length && i.name !== "base") full.push(`Needs: ${reg.join(", ")}`)
    if (type === "registry:ui" || type === "registry:block" || type === "registry:hook") {
      const ex = exportsOf(i)
      if (ex.length) full.push(`Exports: ${ex.join(", ")}`)
    }
    const entry =
      type === "registry:ui"
        ? catalog.components[i.name]
        : type === "registry:block"
          ? catalog.blocks.find((b) => b.registry === i.name)
          : null
    const notes = entry?.notes ?? []
    if (notes.length) full.push("", "Notes:", ...notes.map((n) => `- ${one(n)}`))
    const log = changelog[i.name] ?? []
    if (log.length)
      full.push("", "Changelog:", ...log.map((e) => `- ${e.date}: ${one(e.change)}`))
    full.push("")
  }
}
writeFileSync("public/llms-full.txt", full.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n")

console.log(
  `llms.txt: ${registry.items.length} items, ${Object.keys(changelog).length} with changelog`
)
