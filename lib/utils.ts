import * as React from "react"

export { cn } from "cn"

const NAME_PARTICLES =
  /^(da|de|do|das|dos|di|du|del|della|der|den|van|von|la|le|y|e|bin|al)$/i
const NAME_SUFFIXES = /^(jr|sr|ii|iii|iv|neto|filho|j[uú]nior|sobrinho)\.?$/i

// Built once on first use; avatars call initials() for every row of a list.
let graphemes: Intl.Segmenter | undefined

/**
 * Up to two initials for an avatar fallback: first and last word, skipping
 * particles ("dos", "de la") and suffixes (Jr, III, Neto). Counts graphemes,
 * so accents, emoji and CJK stay whole; an email-only name uses its local part.
 */
export function initials(name: string) {
  let words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 1 && words[0].includes("@")) {
    words = words[0]
      .split("@")[0]
      .split(/[._+-]+/)
      .filter(Boolean)
  }
  const core = words.filter((w) => !NAME_PARTICLES.test(w))
  while (core.length > 1 && NAME_SUFFIXES.test(core[core.length - 1]))
    core.pop()
  if (!core.length) return ""
  const segmenter = (graphemes ??= new Intl.Segmenter(undefined, {
    granularity: "grapheme",
  }))
  const first = (word: string) =>
    segmenter.segment(word)[Symbol.iterator]().next().value?.segment ?? ""
  const picked =
    core.length === 1 ? [core[0]] : [core[0], core[core.length - 1]]
  return picked.map(first).join("").toLocaleUpperCase()
}

/**
 * Optical centering (typography.md): wraps bare text children in a span whose
 * box is trimmed to cap height and baseline (`text-box`), so `items-center`
 * puts icons on the text's visual center instead of the font's line box, for
 * any font. Elements pass through untouched. A label too long for its box
 * ends in an ellipsis: `overflow-x: clip` keeps the trimmed box's ascenders
 * and descenders painting (`hidden` would cut them), so pass a `title`.
 */
export function opticalText(children: React.ReactNode) {
  return React.Children.map(children, (child) =>
    typeof child === "string" || typeof child === "number"
      ? React.createElement(
          "span",
          {
            "data-slot": "label",
            className:
              "min-w-0 overflow-x-clip text-ellipsis [text-box:trim-both_cap_alphabetic]",
          },
          child
        )
      : child
  )
}
