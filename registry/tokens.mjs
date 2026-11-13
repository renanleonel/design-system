// Layer 2: the "personality" a tweakcn theme doesn't cover, plus the motion,
// elevation and focus rules from the frontend-design / animate skills.
// Defaults derive from the shadcn contract (--radius, --ring...), so any theme
// works untouched; a project overrides only what it wants.

// Category tones: status pills, icon tiles, markers. Saturated enough to read as
// text on their own 12% tint (checked by scripts/check-contrast.mjs); dark mode
// lifts lightness. One meaning per tone across a product (e.g. green = live).
export const tones = {
  light: {
    gray: "oklch(0.46 0.01 260)",
    blue: "oklch(0.47 0.17 262)",
    green: "oklch(0.45 0.11 158)",
    amber: "oklch(0.47 0.11 70)",
    orange: "oklch(0.48 0.16 42)",
    red: "oklch(0.48 0.19 25)",
    purple: "oklch(0.49 0.19 318)",
  },
  dark: {
    gray: "oklch(0.82 0.01 260)",
    blue: "oklch(0.83 0.1 262)",
    green: "oklch(0.82 0.11 158)",
    amber: "oklch(0.83 0.11 75)",
    orange: "oklch(0.83 0.11 50)",
    red: "oklch(0.84 0.1 22)",
    purple: "oklch(0.84 0.11 318)",
  },
}
const toneVars = (mode) =>
  Object.fromEntries(
    Object.entries(tones[mode]).map(([k, v]) => [`ds-tone-${k}`, v])
  )

// Categorical chart series (dataviz skill's validated palette): assign in this
// order, never cycled. The same hues across every theme, stepped per mode, and
// checked with validate_palette.js on white and on the dark card (adjacent CVD
// dE >= 8.4). Light slots 3-5 are under 3:1 on white, so charts always ship a
// legend and a tooltip.
export const chart = {
  light: [
    "#2a78d6",
    "#eb6834",
    "#1baf7a",
    "#eda100",
    "#e87ba4",
    "#008300",
    "#6250d6",
    "#e34948",
  ],
  dark: [
    "#3987e5",
    "#d95926",
    "#199e70",
    "#c98500",
    "#d55181",
    "#008300",
    "#9085e9",
    "#e66767",
  ],
}
const chartVars = (mode) =>
  Object.fromEntries(chart[mode].map((v, i) => [`ds-chart-${i + 1}`, v]))

// :root values. Everything is prefixed --ds-* except shadcn-compatible names.
export const root = {
  ...toneVars("light"),
  ...chartVars("light"),
  // Nested surfaces (Panel): a tray holds cards; card radius = tray radius - padding.
  "ds-panel-radius": "calc(var(--radius) * 2.4)",
  "ds-panel-pad": "0.5rem",
  "ds-panel-bg": "color-mix(in oklch, var(--muted) 65%, var(--background))",
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
  "shadow-md":
    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  "shadow-lg":
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  "shadow-xl":
    "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "shadow-2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
}

// .dark overrides. Dark mode: depth shadows vanish, so a single white ring carries the edge.
export const dark = {
  ...toneVars("dark"),
  ...chartVars("dark"),
  // Dark: elevation reads as lightness, so the tray sits below its cards.
  "ds-panel-bg": "var(--background)",
  "ds-shadow-border": "0 0 0 1px oklch(1 0 0 / 0.08)",
  "ds-shadow-border-hover": "0 0 0 1px oklch(1 0 0 / 0.13)",
  "ds-shadow-popover":
    "0 0 0 1px oklch(1 0 0 / 0.1), 0 8px 24px -4px oklch(0 0 0 / 0.5)",
  "ds-shadow-modal":
    "0 0 0 1px oklch(1 0 0 / 0.1), 0 24px 48px -12px oklch(0 0 0 / 0.6)",
}

// @theme inline: exposes tokens as Tailwind utilities.
export const theme = {
  "spacing-control": "var(--ds-control-h)",
  "spacing-control-sm": "var(--ds-control-h-sm)",
  "spacing-control-xs": "var(--ds-control-h-xs)",
  "spacing-control-lg": "var(--ds-control-h-lg)",
  "radius-control": "var(--ds-radius-control)",
  ...Object.fromEntries(
    Object.keys(tones.light).map((k) => [
      `color-tone-${k}`,
      `var(--ds-tone-${k})`,
    ])
  ),
  "color-panel": "var(--ds-panel-bg)",
  ...Object.fromEntries(
    chart.light.map((_, i) => [
      `color-series-${i + 1}`,
      `var(--ds-chart-${i + 1})`,
    ])
  ),
  // Opaque tints (tone mixed onto the card) for overlapping things like avatar stacks,
  // where a translucent tint would let the avatar underneath show through.
  ...Object.fromEntries(
    Object.keys(tones.light).map((k) => [
      `color-tone-${k}-soft`,
      `color-mix(in oklch, var(--ds-tone-${k}) 16%, var(--card))`,
    ])
  ),
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
  // --ds-motion-y / --ds-motion-ease let a component turn the popup into a bottom
  // sheet on mobile (slide up from 100%, drawer curve) without another utility.
  transition: `opacity var(${duration}) var(--ds-motion-ease, var(--ds-ease-out)), transform var(${duration}) var(--ds-motion-ease, var(--ds-ease-out))`,
  [STARTING]: {
    opacity: "0",
    transform: `translateY(var(--ds-motion-y, 0)) scale(var(--ds-motion-scale, ${scale}))`,
  },
  // Exits run at 3/4 of the entrance (as the bulk bar does: 200ms in, 150ms out).
  "&[data-ending-style]": {
    "transition-duration": `calc(var(${duration}) * 0.75)`,
  },
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
  // Touch: controls grow to the 44px target (interaction.md); xs/sm stay smaller and lean on hit-area.
  "@media (pointer: coarse)": {
    ".hit-area::after": {
      top: "50%",
      left: "50%",
      width: "max(100%, 2.75rem)",
      height: "max(100%, 2.75rem)",
      translate: "-50% -50%",
    },
    ":root": {
      "--ds-control-h": "2.75rem",
      "--ds-control-h-lg": "3rem",
      "--ds-control-h-sm": "2.25rem",
      "--ds-control-h-xs": "2rem",
    },
  },
  // Reduced motion: popups keep the fade, drop the scale.
  [REDUCED]: { ":root": { "--ds-motion-scale": "1" } },
  // Opened from a hotkey (pressInstantly): no entrance motion, keyboard actions are instant.
  ":root[data-ds-instant] :is(.motion-popover, .motion-tooltip, .motion-modal, .motion-backdrop, [data-slot=sheet-content], [data-slot=drawer-popup], [data-slot=drawer-overlay])":
    { "transition-duration": "0ms" },
  "@utility motion-popover": popup(
    "--ds-duration-popover",
    "0.95",
    "var(--transform-origin)"
  ),
  "@utility motion-tooltip": {
    ...popup("--ds-duration-tooltip", "0.97", "var(--transform-origin)"),
    // Once one tooltip is open, neighbours open instantly.
    "&[data-instant]": { "transition-duration": "0ms" },
  },
  // Modals are not anchored to a trigger: they stay centered.
  "@utility motion-modal": popup("--ds-duration-modal", "0.96", "center"),
  // Loading placeholders appear only if loading outlasts ~200ms (interaction.md:
  // avoid a flash of loading). Pure CSS: no timer, no effect.
  "@keyframes ds-appear": { from: { opacity: "0" }, to: { opacity: "1" } },
  "@utility appear-delayed": {
    animation:
      "ds-appear 150ms var(--ds-ease-out) var(--ds-appear-delay, 200ms) both",
  },
  "@utility motion-backdrop": {
    transition: "opacity var(--ds-duration-modal) var(--ds-ease-out)",
    [STARTING]: { opacity: "0" },
    "&[data-ending-style]": {
      "transition-duration": "calc(var(--ds-duration-modal) * 0.75)",
    },
  },
  "@layer base": {
    // No double-tap-zoom delay on anything tappable, incl. Base UI's div rows.
    "button, [role=button], a, input, label, select, summary, textarea, [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=option], [role=tab], [role=switch]":
      { "touch-action": "manipulation" },
    html: {
      "-webkit-tap-highlight-color": "transparent",
      "-webkit-text-size-adjust": "100%",
      "text-size-adjust": "100%",
    },
    // Line breaks (typography.md): no lone last word in running text, even
    // two-line headings. Scoped to text elements, not `*`: the cost grows with
    // text that re-lays out constantly, so streaming / editable regions
    // (`data-streaming`, contenteditable) fall back to plain wrapping.
    // Worst-case data (edge-cases.md): an unbroken 50-char word or URL must not
    // widen its card. `anywhere` (unlike break-word) also shrinks min-content, so
    // grid and flex children stay inside their track. Tables and code opt out.
    body: { "overflow-wrap": "anywhere" },
    "table, pre, code, kbd": { "overflow-wrap": "normal" },
    "h1, h2, h3, h4, h5, h6": { "text-wrap": "balance" },
    "p, li, dd, figcaption, blockquote": { "text-wrap": "pretty" },
    "[data-streaming], [data-streaming] *, [contenteditable], [contenteditable] *":
      { "text-wrap": "wrap" },
    // Focusing the first invalid field scrolls it clear of a sticky header.
    "input, select, textarea, button, [role=combobox]": {
      "scroll-margin-block": "var(--ds-scroll-offset, 5rem)",
    },
    // Everything pressable shows a pointer; disabled and busy controls don't.
    'button:not(:disabled):not([aria-disabled="true"]), :is([role="button"], [role="checkbox"], [role="switch"], [role="radio"], [role="tab"]):not([aria-disabled="true"]):not([data-disabled]), summary, label:has(input:not(:disabled)), label[for]:not([data-disabled])':
      { cursor: "pointer" },
    "::selection": {
      "background-color":
        "color-mix(in oklch, var(--primary) 25%, transparent)",
    },
  },
}
