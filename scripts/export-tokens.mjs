// Exports design tokens as W3C Design Tokens Format JSON (Tokens Studio / Figma
// Variables import): public/tokens/<theme>.tokens.json per registry/themes/*.json.
// One file per theme with three token sets: `core` (mode-independent), `light`
// and `dark`. Layer-2 --ds-* tokens reference theme tokens ({color.ring}) where
// they derive from them. Output depends only on repo files, so CI's diff check
// stays stable. Usage: node scripts/export-tokens.mjs
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"

import {
  formatOklch,
  hexToOklch,
  parse,
  parseOklch,
  toHex,
} from "../lib/color.mjs"
import { chart, dark as dsDark, root as dsRoot, tones } from "../registry/tokens.mjs"

const EXT = "com.renanleonel.ui"
const OUT = "public/tokens"

const token = (type, value, original) => ({
  $type: type,
  $value: value,
  ...(original === undefined ? {} : { $extensions: { [EXT]: { original } } }),
})

// Colors become "#rrggbb" / "#rrggbbaa": the sRGB hex string every importer
// reads. The authored oklch value is kept in $extensions.
const color = (value) => {
  const hex = toHex(value)
  if (!hex) throw new Error(`export-tokens: cannot convert color "${value}"`)
  return token("color", hex, value)
}

const px = (v) => (/^-?[\d.]+$/.test(v) ? `${v}${+v === 0 ? "px" : ""}` : v)

// "0 1px 2px -1px oklch(0 0 0 / 0.06), ..." -> DTCG shadow layers.
function splitTop(text, sep) {
  const parts = []
  let depth = 0
  let cur = ""
  for (const ch of text) {
    if (ch === "(") depth++
    if (ch === ")") depth--
    if (depth === 0 && (sep === "," ? ch === "," : /\s/.test(ch))) {
      if (cur.trim()) parts.push(cur.trim())
      cur = ""
    } else cur += ch
  }
  if (cur.trim()) parts.push(cur.trim())
  return parts
}

function shadow(value) {
  const layers = splitTop(value, ",").map((layer) => {
    const parts = splitTop(layer, " ")
    const colorPart = parts.find((p) => parse(p))
    const [offsetX, offsetY, blur = "0", spread = "0"] = parts
      .filter((p) => p !== colorPart && p !== "inset")
      .map(px)
    return {
      color: toHex(colorPart),
      offsetX,
      offsetY,
      blur,
      spread,
      ...(parts.includes("inset") ? { inset: true } : {}),
    }
  })
  return token("shadow", layers.length === 1 ? layers[0] : layers, value)
}

const bezier = (value) =>
  token(
    "cubicBezier",
    value.match(/[\d.]+/g).map(Number),
    value
  )

// CSS color-mix(in oklch, A p%, B) for the panel tray, computed so the export
// holds a plain color (a mix can't be a reference).
function mix(a, pct, b) {
  const toOklch = (v) => parseOklch(v) ?? hexToOklch(toHex(v))
  const [x, y] = [toOklch(a), toOklch(b)]
  const t = pct / 100
  let dh = y.h - x.h
  if (dh > 180) dh -= 360
  if (dh < -180) dh += 360
  const h = x.c < 1e-4 ? y.h : y.c < 1e-4 ? x.h : (x.h + dh * (1 - t) + 360) % 360
  return formatOklch({
    l: x.l * t + y.l * (1 - t),
    c: x.c * t + y.c * (1 - t),
    h,
  })
}

const set = (tree, path, value) => {
  const keys = path.split(".")
  const last = keys.pop()
  let node = tree
  for (const k of keys) node = node[k] ??= {}
  node[last] = value
}

const FONTS = ["sans", "serif", "mono"]

function exportTheme(name, cssVars) {
  const light = cssVars.light ?? {}
  const merged = { light, dark: { ...light, ...(cssVars.dark ?? {}) } }

  const core = {}
  set(core, "radius.base", token("dimension", light.radius ?? "0.5rem"))
  for (const f of FONTS)
    if (light[`font-${f}`])
      set(core, `font.${f}`, token("fontFamily", light[`font-${f}`]))
  set(core, "ds.radius.control", token("dimension", "{radius.base}", dsRoot["ds-radius-control"]))
  set(core, "ds.panel.radius", token("dimension", "{radius.base} * 2.4", dsRoot["ds-panel-radius"]))
  set(core, "ds.panel.pad", token("dimension", dsRoot["ds-panel-pad"]))
  for (const [key, path] of [
    ["ds-control-h", "height"],
    ["ds-control-h-sm", "height-sm"],
    ["ds-control-h-xs", "height-xs"],
    ["ds-control-h-lg", "height-lg"],
  ])
    set(core, `ds.control.${path}`, token("dimension", dsRoot[key]))
  for (const k of ["out", "in-out", "drawer"])
    set(core, `ds.ease.${k}`, bezier(dsRoot[`ds-ease-${k}`]))
  for (const k of [
    "press",
    "tooltip",
    "popover",
    "modal",
    "drawer",
    "fill",
    "reveal",
  ])
    set(core, `ds.duration.${k}`, token("duration", dsRoot[`ds-duration-${k}`]))

  const sets = { core }
  for (const mode of ["light", "dark"]) {
    const vars = merged[mode]
    const ds = mode === "dark" ? { ...dsRoot, ...dsDark } : dsRoot
    const out = {}
    for (const [key, value] of Object.entries(vars)) {
      // Layout and shadow helper vars aren't colors; fonts and radius live in core.
      if (key.startsWith("shadow") || key.startsWith("font-")) continue
      if (parse(value)) set(out, `color.${key}`, color(value))
    }
    for (const [k, v] of Object.entries(tones[mode]))
      set(out, `ds.tone.${k}`, color(v))
    chart[mode].forEach((v, i) => set(out, `ds.chart.${i + 1}`, color(v)))
    set(out, "ds.focus-ring", token("color", "{color.ring}", ds["ds-focus-ring"]))
    const panel =
      mode === "dark"
        ? token("color", "{color.background}")
        : color(mix(vars.muted, 65, vars.background))
    panel.$extensions = { [EXT]: { original: ds["ds-panel-bg"] } }
    set(out, "ds.panel.bg", panel)
    for (const k of ["border", "border-hover", "popover", "modal"])
      set(out, `ds.shadow.${k}`, shadow(ds[`ds-shadow-${k}`]))
    sets[mode] = out
  }

  return {
    $description: `${name}: design tokens from registry/themes/${name}.json and registry/tokens.mjs. Sets: core (mode-independent), light, dark. Colors are sRGB hex; the authored value is in $extensions["${EXT}"].original.`,
    ...sets,
    $themes: ["light", "dark"].map((mode) => ({
      id: `${name}-${mode}`,
      name: `${name} ${mode}`,
      selectedTokenSets: { core: "source", [mode]: "enabled" },
    })),
    $metadata: { tokenSetOrder: ["core", "light", "dark"] },
  }
}

mkdirSync(OUT, { recursive: true })
const files = readdirSync("registry/themes")
  .filter((f) => f.endsWith(".json"))
  .sort()
for (const file of files) {
  const name = file.replace(/\.json$/, "")
  const { cssVars } = JSON.parse(readFileSync(`registry/themes/${file}`, "utf8"))
  writeFileSync(
    `${OUT}/${name}.tokens.json`,
    JSON.stringify(exportTheme(name, cssVars), null, 2) + "\n"
  )
}
console.log(`tokens: ${files.length} themes -> ${OUT}/`)
