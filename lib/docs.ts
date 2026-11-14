// Docs data, read at build time on the server: the registry, the catalog
// (registry/catalog.json) and the demo files (components/demos/<name>.tsx).
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { cache } from "react"
import { createHighlighter } from "shiki"
import { z } from "zod"

import catalog from "@/registry/catalog.json"

export const REGISTRY_URL =
  "https://raw.githubusercontent.com/renanleonel/design-system/main/public/r"
export const GITHUB_URL = "https://github.com/renanleonel/design-system"

type CatalogEntry = {
  group: string
  title: string
  description: string
  notes: string[]
}
const RegistrySchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      registryDependencies: z.array(z.string()).optional(),
      dependencies: z.array(z.string()).optional(),
      files: z.array(z.object({ path: z.string() })).default([]),
    })
  ),
})

export type DocEntry = CatalogEntry & { name: string; href: string }
export type BlockEntry = (typeof catalog.blocks)[number] & { href: string }
export type NavGroup = { label: string; items: { title: string; href: string }[] }

// Only runs at build time (every docs page is prerendered), so don't trace it.
const read = (path: string) =>
  readFileSync(join(/*turbopackIgnore: true*/ process.cwd(), path), "utf8")

// Validated, so a malformed registry.json fails the build with a readable error.
const registryItems = cache(
  () => RegistrySchema.parse(JSON.parse(read("registry.json"))).items
)

export function registryItem(name: string) {
  return registryItems().find((i) => i.name === name)
}

/** Every registry:ui item, in catalog group order, then alphabetically. */
export const getComponents = cache((): DocEntry[] => {
  const entries = catalog.components as Record<string, CatalogEntry>
  const groups: string[] = catalog.groups
  return registryItems()
    .filter((i) => i.type === "registry:ui")
    .map((i) => ({
      name: i.name,
      href: `/components/${i.name}`,
      ...(entries[i.name] ?? {
        group: "Other",
        title: i.name,
        description: "",
        notes: [],
      }),
    }))
    .sort(
      (a, b) =>
        (groups.indexOf(a.group) + 1 || 99) -
          (groups.indexOf(b.group) + 1 || 99) ||
        a.title.localeCompare(b.title)
    )
})

export function getBlocks(): BlockEntry[] {
  return catalog.blocks.map((b) => ({ ...b, href: `/blocks#${b.id}` }))
}

export const getNav = cache((): NavGroup[] => {
  const groups = new Map<string, NavGroup>()
  for (const c of getComponents()) {
    const group = groups.get(c.group) ?? { label: c.group, items: [] }
    group.items.push({ title: c.title, href: c.href })
    groups.set(c.group, group)
  }
  return [
    {
      label: "Getting started",
      items: [
        { title: "Introduction", href: "/" },
        { title: "Components", href: "/components" },
        { title: "Themes", href: "/themes" },
      ],
    },
    ...groups.values(),
    {
      label: "Blocks",
      items: getBlocks().map((b) => ({ title: b.title, href: b.href })),
    },
  ]
})

export const installCommand = (name: string) =>
  `shadcn@latest add ${REGISTRY_URL}/${name}.json`

/** `import { A, B } from "@/components/ui/x"` from the file's export list. */
export function importLine(name: string) {
  const src = read(`components/ui/${name}.tsx`)
  const block = src.match(/^export \{([^}]*)\}/m)?.[1] ?? ""
  const names = block
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("type ") && !/Variants$/.test(s))
  const from = `"@/components/ui/${name}"`
  return names.length > 3
    ? `import {\n${names.map((n) => `  ${n},`).join("\n")}\n} from ${from}`
    : `import { ${names.join(", ")} } from ${from}`
}

// --- Demos -----------------------------------------------------------------

export type Story = {
  /** Export name, e.g. `WithIcon`. */
  id: string
  /** "With icon" */
  title: string
  description?: string
  /** Self-contained source: the imports and helpers it uses, then the story. */
  code: string
}

const humanize = (id: string) =>
  id
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/ ([A-Z])(?=[a-z])/g, (_, c: string) => ` ${c.toLowerCase()}`)

const uses = (code: string, id: string) =>
  new RegExp(`(?<![\\w.])${id.replace("$", "\\$")}(?!\\w)`).test(code)

/**
 * Splits a demo file into stories. Every `export function Name()` is a story
 * (Storybook CSF style), with an optional `/** … *\/` description above it.
 * Each story's code keeps only the imports and top-level helpers it uses, so
 * it can be copied as is.
 */
export const getStories = cache((name: string): Story[] => {
  const path = `components/demos/${name}.tsx`
  if (!existsSync(join(/*turbopackIgnore: true*/ process.cwd(), path)))
    return []
  const src = read(path).replace(/\r\n/g, "\n")

  // Top-level chunks: a chunk starts at a line with no indentation that begins
  // a declaration (or its doc comment) and runs until the next one.
  const lines = src.split("\n")
  const starts: number[] = []
  lines.forEach((line, i) => {
    if (/^(\/\*\*|import |export |function |const |type |"use client")/.test(line)) {
      // A doc comment owns the declaration right after it.
      if (/^(export |function |const |type )/.test(line) && lines[i - 1]?.endsWith("*/") && starts.at(-1) !== undefined && lines[starts.at(-1)!]?.startsWith("/**"))
        return
      starts.push(i)
    }
  })
  const chunks = starts.map((s, k) =>
    lines
      .slice(s, starts[k + 1] ?? lines.length)
      .join("\n")
      .trim()
  )

  const imports: { text: string; names: string[]; from: string }[] = []
  const helpers: { id: string; text: string }[] = []
  const stories: Story[] = []
  for (const chunk of chunks) {
    if (chunk.startsWith('"use client"')) continue
    if (chunk.startsWith("import ")) {
      const from = chunk.match(/from\s+"([^"]+)"/)?.[1] ?? ""
      const ns = chunk.match(/import \* as (\w+)/)?.[1]
      const named = chunk.match(/\{([^}]*)\}/)?.[1]
      const def = chunk.match(/^import (\w+)[ ,]/)?.[1]
      imports.push({
        text: chunk,
        from,
        names: [
          ...(ns ? [ns] : []),
          ...(def && def !== "type" ? [def] : []),
          ...(named
            ? named
                .split(",")
                .map((n) => n.trim().replace(/^type /, "").split(" as ").at(-1)!)
                .filter(Boolean)
            : []),
        ],
      })
      continue
    }
    const doc = chunk.match(/^\/\*\*([\s\S]*?)\*\/\n/)
    const body = doc ? chunk.slice(doc[0].length) : chunk
    const story = body.match(/^export function (\w+)/)?.[1]
    if (story) {
      stories.push({
        id: story,
        title: humanize(story),
        description: doc?.[1]
          .split("\n")
          .map((l) => l.replace(/^\s*\* ?/, "").trim())
          .join(" ")
          .trim(),
        code: body,
      })
    } else {
      const id = body.match(/^(?:export )?(?:function|const|type) (\w+)/)?.[1]
      if (id) helpers.push({ id, text: chunk })
    }
  }

  return stories.map((story) => {
    // Helpers used by the story, and helpers used by those helpers.
    const used = new Set<(typeof helpers)[number]>()
    const visit = (code: string) => {
      for (const h of helpers)
        if (!used.has(h) && uses(code, h.id)) {
          used.add(h)
          visit(h.text)
        }
    }
    visit(story.code)
    const body = [
      ...helpers.filter((h) => used.has(h)).map((h) => h.text),
      story.code,
    ].join("\n\n")
    const importText = imports
      .map((imp) => {
        const keep = imp.names.filter((n) => uses(body, n))
        if (!keep.length) return null
        if (/import \* as|^import \w+ from/.test(imp.text)) return imp.text
        const typeOnly = imp.text.startsWith("import type")
        return keep.length > 3
          ? `import ${typeOnly ? "type " : ""}{\n${keep.map((k) => `  ${k},`).join("\n")}\n} from "${imp.from}"`
          : `import ${typeOnly ? "type " : ""}{ ${keep.join(", ")} } from "${imp.from}"`
      })
      .filter(Boolean)
      .join("\n")
    return { ...story, code: `${importText}\n\n${body}\n` }
  })
})

// --- Code highlighting -----------------------------------------------------

// One highlighter for the whole build (react `cache` is per request).
let highlighterPromise: ReturnType<typeof createHighlighter> | undefined
const highlighter = () =>
  (highlighterPromise ??= createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["tsx", "bash"],
  }))

export async function highlight(code: string, lang: "tsx" | "bash" = "tsx") {
  const h = await highlighter()
  return h.codeToHtml(code.trimEnd(), {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  })
}

export function readSource(path: string) {
  return read(path)
}
