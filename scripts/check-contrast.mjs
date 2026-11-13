// WCAG contrast for every theme in registry/themes, light and dark.
// Text pairs need 4.5:1; UI boundaries (focus ring, input border) need 3:1.
// Usage: node scripts/check-contrast.mjs [--fix]   (exit 1 when a pair fails)
// --fix nudges OKLCH lightness only (hue and chroma kept): the foreground first,
// then the background if the foreground is already at black/white.
import { readdirSync, readFileSync, writeFileSync } from "node:fs"

const FIX = process.argv.includes("--fix")

const PAIRS = [
  ["foreground", "background", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "muted", 4.5],
  ["card-foreground", "card", 4.5],
  ["popover-foreground", "popover", 4.5],
  ["primary-foreground", "primary", 4.5],
  ["secondary-foreground", "secondary", 4.5],
  ["accent-foreground", "accent", 4.5],
  ["destructive", "background", 4.5],
  ["ring", "background", 3],
]

function oklchToRgb(l, c, h) {
  const hr = (h * Math.PI) / 180
  const a = c * Math.cos(hr)
  const b = c * Math.sin(hr)
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ].map((v) => Math.min(1, Math.max(0, v)))
}

function hslToRgb(h, s, l) {
  s /= 100
  l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)].map((v) => {
    // sRGB-encoded -> linear
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
}

// Returns linear-light RGB in 0..1, or null when the value isn't a plain color.
function parse(value) {
  const v = value.trim()
  let m = v.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/)
  if (m) return oklchToRgb(m[2] ? m[1] / 100 : +m[1], +m[3], +m[4])
  m = v.match(/^hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/)
  if (m) return hslToRgb(+m[1], +m[2], +m[3])
  m = v.match(/^#([0-9a-f]{6})$/i)
  if (m) {
    return [0, 2, 4].map((i) => {
      const c = parseInt(m[1].slice(i, i + 2), 16) / 255
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
  }
  return null
}

const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const OKLCH = /^oklch\(\s*([\d.]+)(%?)(\s+[\d.]+\s+[\d.]+.*)$/
const lightnessOf = (v) => {
  const m = v.trim().match(OKLCH)
  return m ? (m[2] ? m[1] / 100 : +m[1]) : null
}
const withLightness = (v, l) =>
  v.trim().replace(OKLCH, (_, _l, _p, rest) => `oklch(${l.toFixed(4)}${rest}`)

// Moves `key` away from `other` in lightness until the pair reaches `min`.
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
    const card = parse(
      { ...cssVars.light, ...(mode === "dark" ? cssVars.dark : {}) }.card
    )
    if (!card) continue
    const bad = Object.entries(tones[mode])
      .map(([name, value]) => [
        name,
        ratio(parse(value), blend(parse(value), card, 0.12)),
      ])
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
