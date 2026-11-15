// Read-only design-system MCP server (Streamable HTTP, stateless, no auth).
// Complements the shadcn MCP: that one installs items, this one explains them
// (stories, rules, tokens, changelog). Data comes from app/mcp/data.ts.
import { createMcpHandler } from "mcp-handler"
import { z } from "zod"

import {
  changelog,
  closeMatches,
  findItem,
  items,
  kinds,
  RAW_BASE,
  search,
  sections,
  stories,
  tokenData,
} from "./data"

// Node runtime: the tools read files from disk.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Above this, get_item and get_examples cut the source and say so. */
const MAX_CHARS = 40_000

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const fail = (t: string) => ({
  content: [{ type: "text" as const, text: t }],
  isError: true,
})

function notFound(name: string) {
  const close = closeMatches(name)
  return fail(
    `No registry item named "${name}".` +
      (close.length ? ` Closest: ${close.join(", ")}.` : " No close matches.") +
      ` Use list_items or search to browse (types: ${kinds().join(", ")}).`
  )
}

/** Cap `parts` (in order) at MAX_CHARS, noting what was left out. */
function capped(parts: string[], hint: string) {
  let used = 0
  const kept: string[] = []
  for (const p of parts) {
    if (used + p.length > MAX_CHARS && kept.length) {
      kept.push(`\n[truncated: ${hint}]`)
      break
    }
    kept.push(p)
    used += p.length
  }
  return kept.join("\n")
}

const readOnly = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: false,
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_items",
      {
        title: "List registry items",
        description:
          "List installable items in the renanleonel/ui design system: ui components, blocks (full screens), hooks, themes, base, tokens. One line each: name, title, description. Filter by type. Install any item with `npx shadcn add @renanleonel/<name>`. Use get_item for details.",
        inputSchema: z.object({
          type: z
            .string()
            .optional()
            .describe(
              "Filter by type: ui, block, hook, theme, base, lib or style. Omit for all."
            ),
        }),
        annotations: readOnly,
      },
      async ({ type }) => {
        const t = type
          ?.trim()
          .toLowerCase()
          .replace(/^registry:/, "")
        const all = items()
        const rows = t ? all.filter((i) => i.kind === t) : all
        if (!rows.length)
          return fail(
            `No items of type "${type}". Types: ${kinds().join(", ")}.`
          )
        const lines = rows.map(
          (i) =>
            `- ${i.name} [${i.kind}] ${i.title}${i.description ? `: ${i.description}` : ""}`
        )
        return text(
          [
            `${rows.length} item(s). Install: npx shadcn add @renanleonel/<name> (needs the @renanleonel namespace in components.json; raw URL: ${RAW_BASE}/<name>.json)`,
            "",
            ...lines,
          ].join("\n")
        )
      }
    )

    server.registerTool(
      "search",
      {
        title: "Search items",
        description:
          "Ranked search over item names, titles, descriptions and catalog notes. Use it to find the right component or block for a task (e.g. 'date picker', 'bulk actions', 'otp').",
        inputSchema: z.object({
          query: z.string().min(1).describe("Free text, e.g. 'sortable list'"),
        }),
        annotations: readOnly,
      },
      async ({ query }) => {
        const hits = search(query)
        if (!hits.length)
          return text(
            `No matches for "${query}". Try fewer or broader words, or call list_items.`
          )
        return text(
          hits
            .map(
              ({ item: i, score }) =>
                `- ${i.name} [${i.kind}] ${i.title} (score ${score}): ${i.description}\n  install: ${i.install}`
            )
            .join("\n")
        )
      }
    )

    server.registerTool(
      "get_item",
      {
        title: "Get item details",
        description:
          "Full details of one registry item: description, catalog notes, npm and registry dependencies, install command and raw URL, and the source files. Set include_source=false for metadata only. Large sources are truncated with a note.",
        inputSchema: z.object({
          name: z
            .string()
            .min(1)
            .describe("Item name, e.g. 'button' or 'data-table'"),
          include_source: z
            .boolean()
            .optional()
            .describe("Include file contents (default true)"),
        }),
        annotations: readOnly,
      },
      async ({ name, include_source }) => {
        const i = findItem(name)
        if (!i) return notFound(name)
        const head = [
          `# ${i.title} (${i.name}, ${i.kind})`,
          i.description,
          "",
          `Install: ${i.install}`,
          `Raw: ${i.url}`,
          `npm: ${i.npm.length ? i.npm.join(", ") : "none"}`,
          `Registry deps: ${i.registryDeps.length ? i.registryDeps.join(", ") : "none"}`,
          `Files: ${i.files.map((f) => f.path).join(", ") || "none (config only)"}`,
          ...(i.notes.length
            ? ["", "Notes:", ...i.notes.map((n) => `- ${n}`)]
            : []),
        ].join("\n")
        if (include_source === false) return text(head)
        const files = i.files.map(
          (f) => `\n## ${f.path}\n\`\`\`tsx\n${f.content}\n\`\`\``
        )
        return text(capped([head, ...files], `fetch the rest from ${i.url}`))
      }
    )

    server.registerTool(
      "get_examples",
      {
        title: "Get usage examples",
        description:
          "The stories (real usage snippets) for a ui component, from its demo file. Each is a self-contained snippet with its imports and a description where one exists. Use these instead of guessing props.",
        inputSchema: z.object({
          name: z.string().min(1).describe("Component name, e.g. 'dialog'"),
        }),
        annotations: readOnly,
      },
      async ({ name }) => {
        const i = findItem(name)
        if (!i) return notFound(name)
        const list = stories(i.name)
        if (!list)
          return text(
            `${i.name} has no stories (only ui components do). ${
              i.kind === "block"
                ? "For blocks, read the source with get_item and the rules with get_rules topic=blocks."
                : "Use get_item for its source."
            }`
          )
        const parts = list.map(
          (s) =>
            `\n## ${s.id}${s.description ? `\n${s.description}` : ""}\n\`\`\`tsx\n${s.code}\`\`\``
        )
        return text(
          capped(
            [`${list.length} stories for ${i.name}:`, ...parts],
            "more stories omitted; use get_item for the component source"
          )
        )
      }
    )

    server.registerTool(
      "get_rules",
      {
        title: "Get design rules",
        description:
          "Sections of the design-system rules (docs/RULES.md, COMPOSITION.md, BLOCKS.md): tokens, focus, motion, states, forms, hotkeys, a11y, composition, tables, sidebars. Call without a topic to list topics. Read the relevant ones before writing UI with these components.",
        inputSchema: z.object({
          topic: z
            .string()
            .optional()
            .describe(
              "Topic id (e.g. 'rules/motion') or a word to match (e.g. 'motion', 'tables'). Omit to list topics."
            ),
        }),
        annotations: readOnly,
      },
      async ({ topic }) => {
        const all = sections()
        const listing = all.map((s) => `- ${s.topic}: ${s.heading}`).join("\n")
        const q = topic?.trim().toLowerCase()
        if (!q) return text(`Topics (pass one as "topic"):\n${listing}`)
        let hits = all.filter((s) => s.topic === q)
        if (!hits.length) {
          const words = q.split(/[^a-z0-9]+/).filter(Boolean)
          hits = all.filter((s) => {
            const hay = `${s.topic} ${s.heading}`.toLowerCase()
            return words.every((w) => hay.includes(w))
          })
        }
        if (!hits.length)
          return fail(`No topic matches "${topic}". Topics:\n${listing}`)
        return text(
          capped(
            hits.map((s) => `# ${s.topic}: ${s.heading}\n\n${s.body}\n`),
            "narrow the topic"
          )
        )
      }
    )

    server.registerTool(
      "get_tokens",
      {
        title: "Get design tokens",
        description:
          "The --ds-* design tokens (tones, chart colors, control sizes, motion, shadows) with light and dark values, plus the Tailwind aliases that expose them. Components must use these and theme variables (--primary, --radius...), never raw colors, sizes or durations.",
        inputSchema: z.object({}),
        annotations: readOnly,
      },
      async () => {
        const { light, dark, theme } = tokenData()
        const fmt = (o: Record<string, string>) =>
          Object.entries(o)
            .map(([k, v]) => `--${k}: ${v}`)
            .join("\n")
        const darkOnly = Object.fromEntries(
          Object.entries(dark).filter(([k, v]) => light[k] !== v)
        )
        return text(
          [
            "Guidance: use these tokens and shadcn theme vars (var(--primary), var(--radius)...) or their Tailwind utilities; never hard-code colors, sizes, radii, shadows or durations. Override a token in :root to retheme (e.g. --ds-radius-control: 9999px for pill buttons). Tones (gray, blue, green, amber, orange, red, purple) carry one meaning each across a product.",
            "",
            "## :root (light)",
            fmt(light),
            "",
            "## .dark overrides",
            fmt(darkOnly),
            "",
            "## Tailwind aliases (@theme inline)",
            fmt(theme),
          ].join("\n")
        )
      }
    )

    server.registerTool(
      "get_changelog",
      {
        title: "Get changelog",
        description:
          "Dated change entries per item, newest first. With a name: that item's history. Without: the 30 most recent changes across the registry.",
        inputSchema: z.object({
          name: z
            .string()
            .optional()
            .describe("Item name; omit for recent changes"),
        }),
        annotations: readOnly,
      },
      async ({ name }) => {
        const log = changelog()
        if (name) {
          const i = findItem(name)
          if (!i) return notFound(name)
          const entries = log[i.name] ?? []
          if (!entries.length)
            return text(`No changelog entries for ${i.name}.`)
          return text(
            entries
              .map(
                (e) =>
                  `- ${e.date}: ${e.change}${e.commit ? ` (${e.commit})` : ""}`
              )
              .join("\n")
          )
        }
        const rows = Object.entries(log)
          .flatMap(([n, es]) => es.map((e) => ({ n, ...e })))
          .sort(
            (a, b) => b.date.localeCompare(a.date) || a.n.localeCompare(b.n)
          )
        const top = rows.slice(0, 30)
        return text(
          [
            `${top.length} of ${rows.length} entries (pass name for one item's history):`,
            ...top.map((e) => `- ${e.date} ${e.n}: ${e.change}`),
          ].join("\n")
        )
      }
    )
  },
  { serverInfo: { name: "renanleonel-ui", version: "1.0.0" } }
)

export { handler as GET, handler as POST }
