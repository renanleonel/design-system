// WCAG contrast for every theme in registry/themes, light and dark.
// Text pairs need 4.5:1; UI boundaries (focus ring, input border) need 3:1.
// Usage: node scripts/check-contrast.mjs [--fix]   (exit 1 when a pair fails)
// --fix nudges OKLCH lightness only (hue and chroma kept): the foreground first,
// then the background if the foreground is already at black/white.
import { readdirSync, readFileSync, writeFileSync } from "node:fs"

import { PAIRS, parse, ratio } from "../lib/color.mjs"

const FIX = process.argv.includes("--fix")

const OKLCH = /^oklch\(\s*([\d.]+)(%?)(\s+[\d.]+\s+[\d.]+.*)$/
const lightnessOf = (v) => {
  const m = v.trim().match(OKLCH)
  return m ? (m[2] ? m[1] / 100 : +m[1]) : null
}
const withLightness = (v, l) =>
  v.trim().replace(OKLCH, (_, _l, _p, rest) => `oklch(${l.toFixed(4)}${rest}`)

function nudge(vars, key, other, min) {
  const l0 = lightnessOf(vars[key])
  if (l0 == null) return false
  const dir = lightnessOf(vars[other]) > l0 ? -1 : 1
  for (let l = l0; l >= 0 && l <= 1; l += dir * 0.005) {
    const candidate = withLightness(vars[key], l)
    if (ratio(parse(candidate), parse(vars[other])) >= min) {
      vars[key] = candidate
      return true
    }
  }
  return false
}

let failures = 0
for (const file of readdirSync("registry/themes").filter((f) =>
  f.endsWith(".json")
)) {
  const path = `registry/themes/${file}`
  const theme = JSON.parse(readFileSync(path, "utf8"))
  const { cssVars } = theme
  for (const mode of ["light", "dark"]) {
    // Dark inherits light values it doesn't override.
    const own = mode === "dark" ? (cssVars.dark ??= {}) : cssVars.light
    const vars = { ...cssVars.light, ...(mode === "dark" ? cssVars.dark : {}) }
    const rows = []
    for (const [fg, bg, min] of PAIRS) {
      const a = vars[fg] && parse(vars[fg])
      const b = vars[bg] && parse(vars[bg])
      if (!a || !b) continue
      const r = ratio(a, b)
      if (
        r < min &&
        FIX &&
        (nudge(vars, fg, bg, min) || nudge(vars, bg, fg, min))
      ) {
        const changed = [fg, bg].filter(
          (k) => vars[k] !== (own[k] ?? cssVars.light[k])
        )
        for (const k of changed) own[k] = vars[k]
        rows.push(
          `  ~ ${changed.join(", ")} adjusted (${r.toFixed(2)} -> ${ratio(parse(vars[fg]), parse(vars[bg])).toFixed(2)})`
        )
        continue
      }
      if (r < min) {
        failures++
        rows.push(`  ✗ ${fg} on ${bg}: ${r.toFixed(2)} (needs ${min})`)
      }
    }
    console.log(
      `${file.replace(".json", "")} / ${mode}: ${rows.length ? "" : "ok"}`
    )
    rows.forEach((r) => console.log(r))
  }
  if (FIX) writeFileSync(path, JSON.stringify(theme, null, 2) + "\n")
}
// Tones: text in the tone on a 12% tint of itself over the card (Badge tone, pills).
const { tones } = await import("../registry/tokens.mjs")
const blend = (fg, bg, alpha) =>
  fg.map((c, i) => c * alpha + bg[i] * (1 - alpha))
for (const file of readdirSync("registry/themes").filter((f) =>
  f.endsWith(".json")
)) {
  const { cssVars } = JSON.parse(
    readFileSync(`registry/themes/${file}`, "utf8")
  )
  for (const mode of ["light", "dark"]) {
    const vars = { ...cssVars.light, ...(mode === "dark" ? cssVars.dark : {}) }
    const card = parse(vars.card)
    if (!card) continue
    // Every surface a pill sits on: card, page, muted, and a hovered table row
    // (muted at 50% over the page).
    const background = parse(vars.background) ?? card
    const muted = parse(vars.muted) ?? card
    const surfaces = {
      card,
      background,
      muted,
      "row hover": blend(muted, background, 0.5),
    }
    const bad = Object.entries(tones[mode])
      .flatMap(([name, value]) =>
        Object.entries(surfaces).map(([surface, bg]) => [
          `${name} on ${surface}`,
          ratio(parse(value), blend(parse(value), bg, 0.12)),
        ])
      )
      .filter(([, r]) => r < 4.5)
    if (bad.length) {
      failures += bad.length
      bad.forEach(([n, r]) =>
        console.log(`  ✗ tone ${n} (${file} / ${mode}): ${r.toFixed(2)}`)
      )
    }
  }
}
console.log(failures ? `${failures} failing pairs` : "tones ok")
process.exit(failures ? 1 : 0)
