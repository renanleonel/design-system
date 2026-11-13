// Layer 2 tokens: the "personality" knobs a tweakcn theme doesn't cover.
// Defaults derive from the shadcn contract (--radius etc.), so any theme works
// untouched; a project overrides only what it wants (e.g. --ds-radius-control: 9999px).

export const root = {
  "ds-control-h": "2rem",
  "ds-control-h-sm": "1.75rem",
  "ds-control-h-xs": "1.5rem",
  "ds-control-h-lg": "2.25rem",
  "ds-radius-control": "var(--radius)",
  "ds-duration": "150ms",
  // Tailwind's default shadows; tweakcn themes override these.
  "shadow-2xs": "0 1px rgb(0 0 0 / 0.05)",
  "shadow-xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  "shadow-sm": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  "shadow-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  "shadow-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  "shadow-xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "shadow-2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
}

// Maps tokens to Tailwind utilities: h-control, rounded-control, duration-ds, shadow-*.
export const theme = {
  "spacing-control": "var(--ds-control-h)",
  "spacing-control-sm": "var(--ds-control-h-sm)",
  "spacing-control-xs": "var(--ds-control-h-xs)",
  "spacing-control-lg": "var(--ds-control-h-lg)",
  "radius-control": "var(--ds-radius-control)",
  "shadow-2xs": "var(--shadow-2xs)",
  "shadow-xs": "var(--shadow-xs)",
  "shadow-sm": "var(--shadow-sm)",
  "shadow-md": "var(--shadow-md)",
  "shadow-lg": "var(--shadow-lg)",
  "shadow-xl": "var(--shadow-xl)",
  "shadow-2xl": "var(--shadow-2xl)",
}
