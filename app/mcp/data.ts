// Data layer for the design-system MCP endpoint. Everything is read from
// committed, generated files at request time (memoized per server instance),
// so new registry items show up with no hand-maintained list:
//   public/r/*.json        items with inlined source (output of `shadcn build`)
//   registry/catalog.json  titles, descriptions, notes
//   registry/changelog.json
//   docs/*.md              rules
//   components/demos/*.tsx stories
// next.config.ts traces these files into the /mcp serverless function
// (outputFileTracingIncludes).
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

export const RAW_BASE = "https://ds.renanleonel.com/r"
export const NAMESPACE = "@renanleonel"
export const SITE_REPO = "https://github.com/renanleonel/design-system"

// /*turbopackIgnore*/ keeps the bundler from tracing the whole project for a
// dynamic path; the files we need are listed in outputFileTracingIncludes.
const read = (path: string) =>
  readFileSync(join(/*turbopackIgnore: true*/ process.cwd(), path), "utf8")
const readJson = <T>(path: string): T => JSON.parse(read(path)) as T
const exists = (path: string) =>
  existsSync(join(/*turbopackIgnore: true*/ process.cwd(), path))
const list = (dir: string) =>
  readdirSync(join(/*turbopackIgnore: true*/ process.cwd(), dir))

// --- Items -------------------------------------------------------------------

type RawItem = {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files?: { path: string; type: string; content?: string; target?: string }[]
  cssVars?: Record<string, Record<string, string>>
  css?: unknown
}
type CatalogEntry = {
  group: string
  title: string
  description: string
  notes?: string[]
}
type BlockEntry = {
  id: string
  registry: string
  title: string
  description: string
  src?: string
  notes?: string[]
}
type Catalog = {
  groups: string[]
  components: Record<string, CatalogEntry>
  blocks: BlockEntry[]
}
type ChangeEntry = { date: string; change: string; commit?: string }

export type Item = {
  name: string
  /** Short type: ui, block, hook, theme, base, lib, style. */
  kind: string
  registryType: string
  title: string
  description: string
  group?: string
  notes: string[]
  npm: string[]
  registryDeps: string[]
  files: { path: string; content: string }[]
  install: string
  url: string
  raw: RawItem
}

const KIND: Record<string, string> = {
  "registry:ui": "ui",
  "registry:block": "block",
  "registry:hook": "hook",
  "registry:theme": "theme",
  "registry:base": "base",
  "registry:lib": "lib",
  "registry:style": "style",
}
const kindOf = (t: string) => KIND[t] ?? t.replace(/^registry:/, "")

const depName = (r: string) => r.replace(/^.*\//, "").replace(/\.json$/, "")

let itemsCache: Item[] | undefined
let catalogCache: Catalog | undefined
let changelogCache: Record<string, ChangeEntry[]> | undefined

export function catalog(): Catalog {
  return (catalogCache ??= readJson<Catalog>("registry/catalog.json"))
}

export function changelog(): Record<string, ChangeEntry[]> {
  return (changelogCache ??= exists("registry/changelog.json")
    ? readJson<Record<string, ChangeEntry[]>>("registry/changelog.json")
    : {})
}

export function items(): Item[] {
  if (itemsCache) return itemsCache
  const cat = catalog()
  const out: Item[] = []
  for (const file of list("public/r")) {
    // registry.json is the index of every item, not an item itself.
    if (!file.endsWith(".json") || file === "registry.json") continue
    const raw = readJson<RawItem>(`public/r/${file}`)
    if (!raw.name || !raw.type) continue
    const kind = kindOf(raw.type)
    const comp = kind === "ui" ? cat.components[raw.name] : undefined
    const blocks =
      kind === "block" ? cat.blocks.filter((b) => b.registry === raw.name) : []
    const notes = [
      ...(comp?.notes ?? []),
      ...blocks.flatMap((b) => b.notes ?? []),
    ]
    const description =
      raw.description ??
      comp?.description ??
      blocks.map((b) => b.description).join(" ")
    out.push({
      name: raw.name,
      kind,
      registryType: raw.type,
      title: raw.title ?? comp?.title ?? blocks[0]?.title ?? raw.name,
      description: description.replace(/\s+/g, " ").trim(),
      group: comp?.group,
      notes,
      npm: raw.dependencies ?? [],
      registryDeps: (raw.registryDependencies ?? []).map(depName),
      files: (raw.files ?? []).map((f) => ({
        path: f.target ?? f.path,
        content: f.content ?? "",
      })),
      install: `npx shadcn add ${NAMESPACE}/${raw.name}`,
      url: `${RAW_BASE}/${raw.name}.json`,
      raw,
    })
  }
  return (itemsCache = out.sort(
    (a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name)
  ))
}

export const findItem = (name: string) => {
  const n = name
    .trim()
    .toLowerCase()
    .replace(/^@renanleonel\//, "")
  return items().find((i) => i.name === n)
}

export function kinds(): string[] {
  return [...new Set(items().map((i) => i.kind))].sort()
}

// --- Fuzzy matching ----------------------------------------------------------

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
      prev = tmp
    }
  }
  return row[b.length]
}

/** Item names close to `input`: substring or small edit distance. */
export function closeMatches(input: string, limit = 5): string[] {
  const q = input
    .trim()
    .toLowerCase()
    .replace(/^@renanleonel\//, "")
  return items()
    .map((i) => {
      const sub = q && (i.name.includes(q) || q.includes(i.name)) ? 0 : 99
      return { name: i.name, score: Math.min(sub, distance(q, i.name)) }
    })
    .filter((m) => m.score <= Math.max(1, Math.floor(q.length / 3)))
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((m) => m.name)
}

// --- Search ------------------------------------------------------------------

export function search(query: string, limit = 10) {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1)
  if (!tokens.length) return []
  const q = tokens.join("-")
  return items()
    .map((i) => {
      const name = i.name
      const title = i.title.toLowerCase()
      const desc = i.description.toLowerCase()
      const notes = i.notes.join(" ").toLowerCase()
      let score = 0
      if (name === q) score += 100
      for (const t of tokens) {
        if (name === t) score += 60
        else if (name.startsWith(t)) score += 35
        else if (name.includes(t)) score += 25
        if (title.includes(t)) score += 15
        if (desc.includes(t)) score += 8
        if (notes.includes(t)) score += 4
        if (i.group?.toLowerCase() === t) score += 5
      }
      return { item: i, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, limit)
}

// --- Stories (components/demos/<name>.tsx) -------------------------------------

export type Story = {
  id: string
  description?: string
  code: string
}

const uses = (code: string, id: string) =>
  new RegExp(`(?<![\\w.])${id.replace("$", "\\$")}(?!\\w)`).test(code)

/**
 * Every `export function Name()` in a demo file is a story, with an optional
 * JSDoc description above it. Each story carries the imports it uses and the
 * top-level helpers it calls, so the snippet is self-contained.
 */
export function stories(name: string): Story[] | null {
  const path = `components/demos/${name}.tsx`
  if (!exists(path)) return null
  const lines = read(path).replace(/\r\n/g, "\n").split("\n")

  type Chunk = { text: string; doc?: string }
  const chunks: Chunk[] = []
  let doc: string | undefined
  let cur: string[] = []
  const flush = () => {
    const text = cur.join("\n").trim()
    if (text) chunks.push({ text, doc })
    cur = []
    doc = undefined
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith("/**")) {
      flush()
      const buf = [line]
      while (!buf.at(-1)!.includes("*/") && i + 1 < lines.length)
        buf.push(lines[++i])
      doc = buf
        .join("\n")
        .replace(/^\/\*\*|\*\/$/g, "")
        .split("\n")
        .map((l) => l.replace(/^\s*\* ?/, "").trim())
        .filter(Boolean)
        .join(" ")
      continue
    }
    if (/^(import |export |function |const |type |"use client")/.test(line)) {
      // A JSDoc line already flushed the previous chunk, so `cur` is empty
      // and `doc` still belongs to this declaration.
      if (cur.length) flush()
    }
    cur.push(line)
  }
  flush()

  const imports: { text: string; names: string[] }[] = []
  const helpers: { id: string; text: string }[] = []
  const found: { id: string; doc?: string; text: string }[] = []
  for (const { text, doc } of chunks) {
    if (text.startsWith('"use client"')) continue
    if (text.startsWith("import ")) {
      const ns = text.match(/import \* as (\w+)/)?.[1]
      const def = text.match(/^import (\w+)[ ,]/)?.[1]
      const named = text.match(/\{([^}]*)\}/)?.[1]
      imports.push({
        text,
        names: [
          ...(ns ? [ns] : []),
          ...(def && def !== "type" ? [def] : []),
          ...(named
            ? named
                .split(",")
                .map((n) =>
                  n
                    .trim()
                    .replace(/^type /, "")
                    .split(" as ")
                    .at(-1)!
                )
                .filter(Boolean)
            : []),
        ],
      })
      continue
    }
    const story = text.match(/^export function (\w+)/)?.[1]
    if (story) found.push({ id: story, doc, text })
    else {
      const id = text.match(/^(?:export )?(?:function|const|type) (\w+)/)?.[1]
      if (id) helpers.push({ id, text })
    }
  }

  return found.map((s) => {
    const used = new Set<(typeof helpers)[number]>()
    const visit = (code: string) => {
      for (const h of helpers)
        if (!used.has(h) && uses(code, h.id)) {
          used.add(h)
          visit(h.text)
        }
    }
    visit(s.text)
    const body = [
      ...helpers.filter((h) => used.has(h)).map((h) => h.text),
      s.text,
    ].join("\n\n")
    const importText = imports
      .filter((imp) => imp.names.some((n) => uses(body, n)))
      .map((imp) => imp.text)
      .join("\n")
    return {
      id: s.id,
      description: s.doc,
      code: `${importText}\n\n${body}\n`.trimStart(),
    }
  })
}

// --- Docs (rules) ------------------------------------------------------------

export type Section = {
  topic: string
  heading: string
  doc: string
  body: string
}

const DOCS = [
  ["rules", "docs/RULES.md"],
  ["composition", "docs/COMPOSITION.md"],
  ["blocks", "docs/BLOCKS.md"],
] as const

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/^\d+\.\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

let sectionsCache: Section[] | undefined
export function sections(): Section[] {
  if (sectionsCache) return sectionsCache
  const out: Section[] = []
  for (const [doc, path] of DOCS) {
    if (!exists(path)) continue
    const parts = read(path)
      .replace(/\r\n/g, "\n")
      .split(/^(?=## )/m)
    for (const part of parts) {
      const m = part.match(/^## (.+)\n/)
      if (!m) continue // preamble before the first heading
      out.push({
        topic: `${doc}/${slug(m[1])}`,
        heading: m[1].trim(),
        doc,
        body: part.slice(m[0].length).trim(),
      })
    }
  }
  return (sectionsCache = out)
}

// --- Tokens --------------------------------------------------------------------

export function tokenData() {
  const t = readJson<RawItem>("public/r/tokens.json")
  return {
    light: t.cssVars?.light ?? {},
    dark: t.cssVars?.dark ?? {},
    theme: t.cssVars?.theme ?? {},
  }
}
