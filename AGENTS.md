<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# renan/ui rules

A shadcn registry on Base UI. Rules come from the `frontend-design` and `animate` skills; read them before adding a component.

- **Tokens only.** Components read the shadcn theme vars and the layer-2 tokens in `registry/tokens.mjs`, never raw colors, sizes or durations. Run `pnpm registry:build` after changing tokens, components or themes (regenerates `registry.json`, `app/ds-tokens.css`, `public/r`).
- **Controls:** `h-control` / `-sm` / `-xs` / `-lg` and `rounded-control`. Small touch targets get `hit-area`.
- **Focus:** `focus-ring` (outline, 2px offset, `--ds-focus-ring`). Never a box-shadow ring; destructive variants set `[--ds-focus-ring:var(--destructive)]`.
- **Elevation:** one per role: `shadow-border` (cards), `shadow-popover` (menus, popovers, selects), `shadow-modal` (dialogs, sheets). Never a border plus a shadow on the same surface.
- **Motion:** `motion-press` on pressables, `motion-popover` / `motion-tooltip` / `motion-modal` / `motion-backdrop` on Base UI popups. Transitions only (no `animate-in` keyframes), `transform`/`opacity` only, never `transition-all`, never `scale(0)`. Reduced motion keeps fades, drops movement. Nothing animates on keyboard-shortcut actions.
- **States:** every control covers hover, focus-visible, active, disabled, loading (`Button loading`), invalid.
- **As few `useEffect`s as possible.** Use one only when there's no other way: subscribing to something outside React (a DOM/window event, a third-party store) with cleanup. Before writing one, reach for, in order:
  1. Derive during render (computed values, no state).
  2. CSS: data attributes, `group-*` / `has-*` variants, transitions (e.g. `Button` loading is pure CSS width animation).
  3. The event handler that caused the change (including writes to `document`).
  4. Adjust state during render when a prop changes (`if (prop && !state) setState(true)`).
  5. DOM events like `onTransitionEnd` / `onAnimationEnd` for "after the animation" logic, never `setTimeout` in an effect.
  6. `useSyncExternalStore` for external stores, a `key` to reset state.
  Never `setState` synchronously inside an effect, and never an effect to sync one piece of state from another.
- **Token CSS (`css` in `registry/tokens.mjs`):** shadcn's CSS writer handles only one nesting level inside `@utility`. Put `@media` at the top level and act through variables or plain selectors (see `hit-area`, `--ds-motion-scale`). Verify a change by installing `public/r/tokens.json` into a fresh project and building it.
- **Hotkeys** (`@tanstack/react-hotkeys`): actionable components take a `hotkey` prop (`Button`, `DropdownMenuItem`; `TooltipContent hotkey` only displays). Show shortcuts with `<Hotkey>` (never hand-written "⌘K"), set `aria-keyshortcuts` via `toAriaKeyShortcuts`, and press elements with `useHotkeyPress` so popups opened from the keyboard skip their motion. Prefer `Mod+…` or `Shift+…`; single letters only where no text input or menu typeahead competes.
- **Responsive overlays:** below 640px `Dialog` renders a swipeable `Drawer` (same tree, mode from context; `responsive={false}` opts out), `Popover` and `DropdownMenu` become bottom sheets via `max-sm:` classes plus `--ds-motion-y` / `--ds-motion-ease`, and on touch devices `Select` with `items` renders the native picker. Touch devices also get 44px controls (`--ds-control-h` under `pointer: coarse`). Detect viewport with `useMediaQuery` (`useSyncExternalStore`), never an effect.
- **Forms** (React Hook Form + zod): `useZodForm(schema)` (validates on blur, then live while invalid), `<Form form onSubmit>` (real `<form>`, blocks double submit, thrown errors become `<FormBanner>`), `<FormField name label render>` (label, `id`, `aria-invalid`, `aria-describedby`, error text), `<FormSubmit>` (never disabled while invalid; busy while submitting). Error copy says what's wrong and how to fix it. Pick inputs by option count: 2 → switch/radio, 3–7 → `Select`, 8+ or many values → `MultiSelect` / combobox.
- **Text wrapping:** base CSS sets `text-wrap: balance` on headings and `pretty` on `p, li, dd, figcaption, blockquote`. Don't set it on `*`. Put `data-streaming` on regions whose text changes per frame (AI streaming, live logs) so they use plain wrapping; very long text and code keep the default.
- **States:** loading regions use `<SkeletonGroup label="Loading …">` (skeletons shaped like the content, shown only after 200ms); empty regions use `Empty` with the variant that matches the cause (first use, no results + clear filters, no permission); failed regions use `<ErrorState onRetry>` per section; reversible actions run immediately with `toastUndo` instead of a confirm dialog.
- **Contrast:** `pnpm check:contrast` checks every theme (text 4.5:1, focus ring 3:1, light and dark); `--fix` nudges OKLCH lightness only. Run it after adding a tweakcn theme.
- **Worst-case data:** base CSS sets `overflow-wrap: anywhere` so long words never widen a card; user-entered labels in chips/badges truncate with a `title`. Popups that list options (`DropdownMenu`, `Select`) are at least the trigger's width and grow to fit, capped at `--available-width`. Rows in menus/selects/comboboxes are 36px (44px on touch). Before shipping a component, render it at 320px with a 50-char word, an empty value and CJK/Arabic text.
- **Composition:** before building a card, panel, dialog or palette, read `docs/COMPOSITION.md` and start from the closest example in `components/examples/` (`/examples` in the playground). Use `Panel`/`PanelCard`, `IconTile`, `Badge tone`, `DataList`, `TabsList variant="segmented"`, `Alert tone` and `Button variant="surface"` instead of one-off styling.
