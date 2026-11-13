// Layer 2: the "personality" a tweakcn theme doesn't cover, plus the motion,
// elevation and focus rules from the frontend-design / animate skills.
// Defaults derive from the shadcn contract (--radius, --ring...), so any theme
// works untouched; a project overrides only what it wants.

// :root values. Everything is prefixed --ds-* except shadcn-compatible names.
export const root = {
  // Size and shape
  "ds-control-h": "2rem",
  "ds-control-h-sm": "1.75rem",
  "ds-control-h-xs": "1.5rem",
  "ds-control-h-lg": "2.25rem",
  "ds-radius-control": "var(--radius)",

  // Focus: outline-based, so it never fights box-shadow elevation.
  "ds-focus-ring": "var(--ring)",

  // Motion (animate skill): strong curves, UI stays under 300ms.
  "ds-ease-out": "cubic-bezier(0.23, 1, 0.32, 1)",
  "ds-ease-in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
  "ds-ease-drawer": "cubic-bezier(0.32, 0.72, 0, 1)",
  "ds-duration-press": "160ms",
  "ds-duration-tooltip": "125ms",
  "ds-duration-popover": "200ms",
  "ds-duration-modal": "250ms",
  "ds-duration-drawer": "500ms",

  // Elevation (surfaces.md): one named shadow per role. Light = layered, ring included.
  "ds-shadow-border":
    "0 0 0 1px oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.06), 0 2px 4px 0 oklch(0 0 0 / 0.04)",
  "ds-shadow-border-hover":
    "0 0 0 1px oklch(0 0 0 / 0.08), 0 1px 2px -1px oklch(0 0 0 / 0.08), 0 2px 4px 0 oklch(0 0 0 / 0.06)",
  "ds-shadow-popover":
    "0 0 0 1px oklch(0 0 0 / 0.08), 0 2px 4px -1px oklch(0 0 0 / 0.06), 0 8px 24px -4px oklch(0 0 0 / 0.12)",
  "ds-shadow-modal":
    "0 0 0 1px oklch(0 0 0 / 0.08), 0 4px 8px -2px oklch(0 0 0 / 0.06), 0 24px 48px -12px oklch(0 0 0 / 0.2)",

  // Tailwind's default shadow scale; tweakcn themes override these.
  "shadow-2xs": "0 1px rgb(0 0 0 / 0.05)",
  "shadow-xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  "shadow-sm": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  "shadow-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  "shadow-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  "shadow-xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "shadow-2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
}

// .dark overrides. Dark mode: depth shadows vanish, so a single white ring carries the edge.
export const dark = {
  "ds-shadow-border": "0 0 0 1px oklch(1 0 0 / 0.08)",
  "ds-shadow-border-hover": "0 0 0 1px oklch(1 0 0 / 0.13)",
  "ds-shadow-popover": "0 0 0 1px oklch(1 0 0 / 0.1), 0 8px 24px -4px oklch(0 0 0 / 0.5)",
  "ds-shadow-modal": "0 0 0 1px oklch(1 0 0 / 0.1), 0 24px 48px -12px oklch(0 0 0 / 0.6)",
}

// @theme inline: exposes tokens as Tailwind utilities.
export const theme = {
  "spacing-control": "var(--ds-control-h)",
  "spacing-control-sm": "var(--ds-control-h-sm)",
  "spacing-control-xs": "var(--ds-control-h-xs)",
  "spacing-control-lg": "var(--ds-control-h-lg)",
  "radius-control": "var(--ds-radius-control)",
  "ease-out": "var(--ds-ease-out)",
  "ease-in-out": "var(--ds-ease-in-out)",
  "ease-drawer": "var(--ds-ease-drawer)",
  "shadow-border": "var(--ds-shadow-border)",
  "shadow-border-hover": "var(--ds-shadow-border-hover)",
  "shadow-popover": "var(--ds-shadow-popover)",
  "shadow-modal": "var(--ds-shadow-modal)",
  "shadow-2xs": "var(--shadow-2xs)",
  "shadow-xs": "var(--shadow-xs)",
  "shadow-sm": "var(--shadow-sm)",
  "shadow-md": "var(--shadow-md)",
  "shadow-lg": "var(--shadow-lg)",
  "shadow-xl": "var(--shadow-xl)",
  "shadow-2xl": "var(--shadow-2xl)",
}

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const STARTING = "&[data-starting-style], &[data-ending-style]"

// Popup motion for Base UI parts (they set data-starting-style / data-ending-style).
// Transitions, not keyframes, so a reopen mid-close retargets instead of restarting.
// NOTE: shadcn's CSS writer only handles one nesting level inside @utility, so
// media queries live at the top level of `css` and act through variables.
const popup = (duration, scale, origin) => ({
  "transform-origin": origin,
  transition: `opacity var(${duration}) var(--ds-ease-out), transform var(${duration}) var(--ds-ease-out)`,
  [STARTING]: { opacity: "0", transform: `scale(var(--ds-motion-scale, ${scale}))` },
})

// Extra CSS: utilities components use, and base-layer browser polish.
export const css = {
  // Keyboard focus ring: 2px outline, offset, token color. Never on mouse click.
  "@utility focus-ring": {
    "&:focus-visible": {
      outline: "2px solid var(--ds-focus-ring)",
      "outline-offset": "2px",
    },
  },
  // Same, drawn inside the box (inputs inside groups, menu items, table cells).
  "@utility focus-ring-inset": {
    "&:focus-visible": {
      outline: "2px solid var(--ds-focus-ring)",
      "outline-offset": "-2px",
    },
  },
  // Press feedback (interaction.md): scale 0.97, never below 0.95. Kept under reduced motion.
  "@utility motion-press": {
    transition: `transform var(--ds-duration-press) var(--ds-ease-out), background-color var(--ds-duration-press) ease, color var(--ds-duration-press) ease, box-shadow var(--ds-duration-press) ease`,
    "&:active:not(:disabled):not([aria-disabled=true]):not([data-disabled])": {
      transform: "scale(0.97)",
    },
  },
  // Touch targets (interaction.md): extend small controls to 44px on coarse pointers,
  // via a pseudo-element so the visual size doesn't change.
  "@utility hit-area": {
    position: "relative",
    "&::after": { content: '""', position: "absolute" },
  },
  "@media (pointer: coarse)": {
    ".hit-area::after": {
      top: "50%",
      left: "50%",
      width: "max(100%, 2.75rem)",
      height: "max(100%, 2.75rem)",
      translate: "-50% -50%",
    },
  },
  // Reduced motion: popups keep the fade, drop the scale.
  [REDUCED]: { ":root": { "--ds-motion-scale": "1" } },
  "@utility motion-popover": popup("--ds-duration-popover", "0.95", "var(--transform-origin)"),
  "@utility motion-tooltip": {
    ...popup("--ds-duration-tooltip", "0.97", "var(--transform-origin)"),
    // Once one tooltip is open, neighbours open instantly.
    "&[data-instant]": { "transition-duration": "0ms" },
  },
  // Modals are not anchored to a trigger: they stay centered.
  "@utility motion-modal": popup("--ds-duration-modal", "0.96", "center"),
  "@utility motion-backdrop": {
    transition: "opacity var(--ds-duration-modal) var(--ds-ease-out)",
    [STARTING]: { opacity: "0" },
  },
  "@layer base": {
    "button, [role=button], a, input, label, select, summary, textarea": {
      "touch-action": "manipulation",
    },
    html: { "-webkit-tap-highlight-color": "transparent" },
    // Everything pressable shows a pointer; disabled and busy controls don't.
    'button:not(:disabled):not([aria-disabled="true"]), [role="button"]:not([aria-disabled="true"]), summary, label:has(input:not(:disabled))':
      { cursor: "pointer" },
    "::selection": {
      "background-color": "color-mix(in oklch, var(--primary) 25%, transparent)",
    },
  },
}
