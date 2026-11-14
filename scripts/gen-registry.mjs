// Generates registry.json (consumed by `shadcn build`) and app/ds-tokens.css
// from components/ui, hooks, registry/tokens.mjs and registry/themes/*.json.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { join, basename } from "node:path"
import { root, dark, theme, css } from "../registry/tokens.mjs"

const BASE_URL =
  process.env.REGISTRY_URL ??
  "https://raw.githubusercontent.com/renanleonel/design-system/main/public/r"
const NAME = "renanleonel"
const IGNORED_DEPS = new Set(["react", "react-dom", "next"])

const ref = (name) => `${BASE_URL}/${name}.json`

// Declare each dependency with the range this repo is built against, so an
// install never pulls an incompatible major (e.g. TanStack Table v9 vs v8).
const PKG = JSON.parse(readFileSync("package.json", "utf8"))
const RANGES = { ...PKG.devDependencies, ...PKG.dependencies }
const withRange = (pkg) => (RANGES[pkg] ? `${pkg}@${RANGES[pkg]}` : pkg)

function camel(name) {
  return name.replace(/-(\w)/g, (_, c) => c.toUpperCase()) + "Demos"
}

function pkgName(spec) {
  const parts = spec.split("/")
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}

function analyze(path) {
  const src = readFileSync(path, "utf8")
  const dependencies = new Set()
  const registryDependencies = new Set()
  for (const [, spec] of src.matchAll(/from\s+["']([^"']+)["']/g)) {
    if (spec.startsWith("@/components/ui/"))
      registryDependencies.add(ref(basename(spec)))
    else if (spec === "@/lib/utils") registryDependencies.add(ref("utils"))
    else if (spec.startsWith("@/hooks/"))
      registryDependencies.add(ref(basename(spec)))
    else if (!spec.startsWith(".") && !spec.startsWith("@/")) {
      const pkg = pkgName(spec)
      if (!IGNORED_DEPS.has(pkg)) dependencies.add(pkg)
    }
  }
  return {
    dependencies: [...dependencies].sort().map(withRange),
    registryDependencies: [...registryDependencies].sort(),
  }
}

function fileItems(dir, type) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => /\.tsx?$/.test(f))
    .sort()
    .map((f) => {
      const path = join(dir, f).replaceAll("\\", "/")
      return {
        name: f.replace(/\.tsx?$/, ""),
        type,
        ...analyze(path),
        files: [{ path, type }],
      }
    })
}

// Titles and descriptions come from the docs catalog (registry/catalog.json).
const CATALOG = JSON.parse(readFileSync("registry/catalog.json", "utf8"))
const ui = fileItems("components/ui", "registry:ui").map((item) => {
  const entry = CATALOG.components[item.name]
  if (!entry) throw new Error(`registry/catalog.json has no entry for "${item.name}"`)
  if (!existsSync(`components/demos/${item.name}.tsx`))
    throw new Error(`components/demos/${item.name}.tsx is missing`)
  return { name: item.name, type: item.type, title: entry.title, description: entry.description, ...item }
})
const hooks = fileItems("hooks", "registry:hook")

// Blocks: one item per folder in components/blocks, every file in it, installed
// at the same path so their relative imports keep working.
const BLOCKS_DIR = "components/blocks"
const blocks = existsSync(BLOCKS_DIR)
  ? readdirSync(BLOCKS_DIR)
      .sort()
      .map((name) => {
        const dir = `${BLOCKS_DIR}/${name}`
        const files = readdirSync(dir)
          .filter((f) => /.tsx?$/.test(f))
          .sort()
        const deps = files.map((file) => analyze(`${dir}/${file}`))
        const entry = CATALOG.blocks.find((b) => b.registry === name)
        return {
          name,
          type: "registry:block",
          ...(entry && { title: entry.title, description: entry.description }),
          dependencies: [
            ...new Set(deps.flatMap((d) => d.dependencies)),
          ].sort(),
          registryDependencies: [
            ...new Set(deps.flatMap((d) => d.registryDependencies)),
          ].sort(),
          files: files.map((file) => ({
            path: `${dir}/${file}`,
            type: "registry:component",
            target: `${dir}/${file}`,
          })),
        }
      })
  : []

const utils = {
  name: "utils",
  type: "registry:lib",
  dependencies: ["cn"],
  files: [{ path: "lib/utils.ts", type: "registry:lib" }],
}

const tokens = {
  name: "tokens",
  type: "registry:style",
  title: "Design tokens",
  description:
    "Layer-2 tokens (control size, control radius, shadows) on top of the shadcn theme contract.",
  cssVars: { theme, light: root, dark },
  css,
}

const themesDir = "registry/themes"
const themes = existsSync(themesDir)
  ? readdirSync(themesDir)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => {
        const { $schema, name, ...rest } = JSON.parse(
          readFileSync(join(themesDir, f), "utf8")
        )
        return {
          ...rest,
          name: `theme-${f.replace(/\.json$/, "")}`,
          type: "registry:theme",
        }
      })
  : []

const base = {
  name: "base",
  type: "registry:base",
  title: "renanleonel/ui",
  description: "Everything: tokens, default theme, utils and all components.",
  config: {
    style: "base-nova",
    iconLibrary: "lucide",
    tailwind: { baseColor: "neutral", cssVariables: true },
  },
  registryDependencies: [
    ref("utils"),
    ref("tokens"),
    ...ui.map((i) => ref(i.name)),
  ],
}

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: NAME,
  homepage: "https://github.com/renanleonel/design-system",
  items: [base, utils, tokens, ...themes, ...hooks, ...ui, ...blocks],
}
writeFileSync("registry.json", JSON.stringify(registry, null, 2) + "\n")

// Demo index for the docs site: every component's stories, by registry name.
writeFileSync(
  "components/demos/index.ts",
  [
    "// Generated by scripts/gen-registry.mjs. Do not edit.",
    'import type { ComponentType } from "react"',
    "",
    ...ui.map((i) => `import * as ${camel(i.name)} from "./${i.name}"`),
    "",
    "export const demos: Record<string, Record<string, ComponentType>> = {",
    ...ui.map((i) => `  "${i.name}": ${camel(i.name)},`),
    "}",
    "",
  ].join("\n")
)

// Same tokens for the docs/playground app itself.
const NL = "\n"
const decl = (obj, indent = "  ") =>
  Object.entries(obj)
    .map(([k, v]) => `${indent}--${k}: ${v};`)
    .join(NL)
const serialize = (obj, indent = "") =>
  Object.entries(obj)
    .map(([k, v]) =>
      typeof v === "string"
        ? `${indent}${k}: ${v};`
        : `${indent}${k} {${NL}${serialize(v, indent + "  ")}${NL}${indent}}`
    )
    .join(NL)
writeFileSync(
  "app/ds-tokens.css",
  [
    "/* Generated by scripts/gen-registry.mjs from registry/tokens.mjs. Do not edit. */",
    `:root {${NL}${decl(root)}${NL}}`,
    `.dark {${NL}${decl(dark)}${NL}}`,
    `@theme inline {${NL}${decl(theme)}${NL}}`,
    serialize(css),
  ].join(NL + NL) + NL
)

console.log(
  `registry.json: ${registry.items.length} items (${ui.length} ui, ${blocks.length} blocks, ${themes.length} themes)`
)
