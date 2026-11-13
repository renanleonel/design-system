import * as React from "react"

export { cn } from "cn"

/**
 * Optical centering (typography.md): wraps bare text children in a span whose
 * box is trimmed to cap height and baseline (`text-box`), so `items-center`
 * puts icons on the text's visual center instead of the font's line box, for
 * any font. Elements pass through untouched. Use it where a label never
 * truncates (buttons, badges, menu rows): trimmed boxes clip under overflow.
 */
export function opticalText(children: React.ReactNode) {
  return React.Children.map(children, (child) =>
    typeof child === "string" || typeof child === "number"
      ? React.createElement(
          "span",
          {
            "data-slot": "label",
            className: "[text-box:trim-both_cap_alphabetic]",
          },
          child
        )
      : child
  )
}
