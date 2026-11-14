// Color math shared by scripts/check-contrast.mjs, scripts/export-tokens.mjs and
// the theme builder. Plain ESM with no Node imports, so it runs in the browser.

/** Text pairs need 4.5:1; UI boundaries (focus ring) need 3:1. */
export const PAIRS = [
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

// Linear-light sRGB (unclamped) from OKLCH.
function oklchToLinear(l, c, h) {
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
  ]
}

const clamp01 = (v) => Math.min(1, Math.max(0, v))

export function oklchToRgb(l, c, h) {
  return oklchToLinear(l, c, h).map(clamp01)
}

const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const toSrgb = (v) =>
  v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055

export function hslToRgb(h, s, l) {
  s /= 100
  l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  // sRGB-encoded -> linear
  return [f(0), f(8), f(4)].map(toLinear)
}

// Returns linear-light RGB in 0..1, or null when the value isn't a plain color.
export function parse(value) {
  const v = value.trim()
  let m = v.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/)
  if (m) return oklchToRgb(m[2] ? m[1] / 100 : +m[1], +m[3], +m[4])
  m = v.match(/^hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/)
  if (m) return hslToRgb(+m[1], +m[2], +m[3])
  m = v.match(/^#([0-9a-f]{6})/i)
  if (m) {
    return [0, 2, 4].map((i) => toLinear(parseInt(m[1].slice(i, i + 2), 16) / 255))
  }
  m = v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/)
  if (m) return [m[1], m[2], m[3]].map((c) => toLinear(+c / 255))
  return null
}

export const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b

export const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Alpha of `oklch(... / 10%)`, `hsl(... / .5)` or `rgb(... / 0.2)`; 1 when absent. */
export function alphaOf(value) {
  const m = value.match(/\/\s*([\d.]+)(%?)\s*\)/)
  if (!m) return 1
  return clamp01(m[2] ? m[1] / 100 : +m[1])
}

const hex2 = (v) =>
  Math.round(clamp01(v) * 255)
    .toString(16)
    .padStart(2, "0")

/** `#rrggbb` (or `#rrggbbaa` when translucent) for any value `parse` accepts. */
export function toHex(value) {
  const rgb = parse(value)
  if (!rgb) return null
  const alpha = alphaOf(value)
  return (
    "#" + rgb.map((c) => hex2(toSrgb(c))).join("") + (alpha < 1 ? hex2(alpha) : "")
  )
}

/** `#rgb` / `#rrggbb` / `#rrggbbaa` to `{ l, c, h, alpha }` in OKLCH. */
export function hexToOklch(hex) {
  let d = hex.replace("#", "").toLowerCase()
  if (d.length <= 4) d = [...d].map((x) => x + x).join("")
  const [r, g, b] = [0, 2, 4].map((i) => toLinear(parseInt(d.slice(i, i + 2), 16) / 255))
  const alpha = d.length === 8 ? parseInt(d.slice(6, 8), 16) / 255 : 1
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const c = Math.hypot(A, B)
  const h = c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360
  return { l: L, c, h, alpha }
}

const trim = (n, digits) => String(+n.toFixed(digits))

/** CSS `oklch(L C H / A%)` with short, stable numbers. */
export function formatOklch({ l, c, h, alpha = 1 }) {
  const base = `${trim(l, 4)} ${trim(c, 4)} ${trim(h, 2)}`
  return alpha < 1
    ? `oklch(${base} / ${trim(alpha * 100, 0)}%)`
    : `oklch(${base})`
}

/** `{ l, c, h, alpha }` of an `oklch(...)` string, or null. */
export function parseOklch(value) {
  const m = value
    .trim()
    .match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)(%?))?\s*\)$/)
  if (!m) return null
  return {
    l: m[2] ? m[1] / 100 : +m[1],
    c: +m[3],
    h: +m[4],
    alpha: m[5] === undefined ? 1 : m[6] ? m[5] / 100 : +m[5],
  }
}

/** Contrast rows for one mode's resolved vars (dark already merged over light). */
export function contrastRows(vars) {
  const rows = []
  for (const [fg, bg, min] of PAIRS) {
    const a = vars[fg] && parse(vars[fg])
    const b = vars[bg] && parse(vars[bg])
    if (!a || !b) continue
    const r = ratio(a, b)
    rows.push({ fg, bg, min, ratio: r, pass: r >= min })
  }
  return rows
}
