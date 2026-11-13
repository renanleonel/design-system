# Component rules

Apply to everything in `components/ui` and `hooks`, and to any code that uses them. Every rule applied before a component counts as done. Screens: also [`BLOCKS.md`](BLOCKS.md); layout and visual craft: [`COMPOSITION.md`](COMPOSITION.md).

## Tokens and surfaces

- **Tokens only.** Read shadcn theme vars and `--ds-*` tokens from `registry/tokens.mjs`. New values become tokens first.
- **Controls:** `h-control` / `-xs` / `-sm` / `-lg` and `rounded-control`. Small touch targets get `hit-area`; 16px targets keep 24px clear around them.
- **Focus:** `focus-ring` (outline, 2px offset, `--ds-focus-ring`), never a box-shadow ring. Destructive variants set `[--ds-focus-ring:var(--destructive)]`.
- **Elevation:** `shadow-border` (cards), `shadow-popover` (menus, popovers, selects), `shadow-modal` (dialogs, sheets). A surface has a shadow or a border, never both.
- **Token CSS** (`css` in `tokens.mjs`): shadcn's CSS writer handles one nesting level inside `@utility`. Put `@media` at the top level and act through variables or plain selectors (see `hit-area`, `--ds-motion-scale`). Verify by installing `public/r/tokens.json` into a fresh project and building it.

## Motion

- `motion-press` on pressables; `motion-popover` / `motion-tooltip` / `motion-modal` / `motion-backdrop` on Base UI popups.
- Transitions only (no `animate-in` keyframes), `transform`/`opacity` only, explicit properties (no `transition-all`), start scale above 0.
- Reduced motion keeps fades and drops movement. Keyboard-shortcut actions are instant: press with `useHotkeyPress` so popups opened from the keyboard skip their motion.
- Chevrons on popup triggers rotate 180° while open (`group-data-popup-open`); the icon stays the same.

## States

- Every control covers hover, focus-visible, active, disabled, loading (`Button loading`), invalid.
- Loading regions: `<SkeletonGroup label="Loading …">`, skeletons shaped like the content, shown after 200ms.
- Empty regions: `Empty` with the variant matching the cause (first use, no results + clear filters, no permission).
- Failed regions: `<ErrorState onRetry>` per section.
- Reversible actions run immediately with `toastUndo`; confirm dialogs are for irreversible ones.

## Effects

Use a `useEffect` only to subscribe to something outside React (DOM/window event, third-party store) with cleanup. Reach first, in order, for:

1. Deriving during render.
2. CSS: data attributes, `group-*` / `has-*` variants, transitions (`Button` loading is a pure CSS width animation).
3. The event handler that caused the change (including writes to `document`).
4. Adjusting state during render when a prop changes (`if (prop && !state) setState(true)`).
5. `onTransitionEnd` / `onAnimationEnd` for "after the animation" logic.
6. `useSyncExternalStore` for external stores; a `key` to reset state.

Effects never `setState` synchronously and never sync one piece of state from another.

**Browser-only values** (stored theme, locale, `toLocaleString` without a locale) render after mount via `useSyncExternalStore`, or with a fixed locale (date-fns), so hydration matches.

## Hotkeys

- Actionable components take a `hotkey` prop (`Button`, `DropdownMenuItem`); `TooltipContent hotkey` only displays.
- Show shortcuts with `<Hotkey>`, set `aria-keyshortcuts` via `toAriaKeyShortcuts`.
- Prefer `Mod+…` or `Shift+…`; single letters only where no text input or menu typeahead competes.

## Responsive overlays

- Below 640px `Dialog` renders a swipeable `Drawer` (same tree, mode from context; `responsive={false}` opts out).
- `Popover` and `DropdownMenu` become bottom sheets via `max-sm:` classes plus `--ds-motion-y` / `--ds-motion-ease`.
- On touch, `Select` with `items` renders the native picker and controls grow to 44px (`--ds-control-h` under `pointer: coarse`).
- Detect viewport with `useMediaQuery` (`useSyncExternalStore`).

## Forms (React Hook Form + zod)

- `useZodForm(schema)`: validates on blur, then live while invalid.
- `<Form form onSubmit>`: real `<form>`, blocks double submit, thrown errors become `<FormBanner>`.
- `<FormField name label render>`: wires label, `id`, `aria-invalid`, `aria-describedby`, error text.
- `<FormSubmit>`: enabled while invalid, busy while submitting.
- Error copy says what's wrong and how to fix it.
- Pick inputs by option count: 2 → switch/radio, 3–7 → `Select`, 8+ or many values → `MultiSelect` / combobox.

## Text and worst-case data

- Base CSS: `text-wrap: balance` on headings, `pretty` on `p, li, dd, figcaption, blockquote` (scoped, not `*`); `overflow-wrap: anywhere` everywhere.
- `data-streaming` on regions whose text changes per frame (AI streaming, live logs) for plain wrapping.
- User-entered labels in chips/badges truncate with a `title`.
- Option popups (`DropdownMenu`, `Select`) are at least the trigger's width, grow to fit, capped at `--available-width`. Rows in menus/selects/comboboxes are 36px (44px on touch).
- Before shipping, render at 320px with a 50-char word, an empty value and CJK/Arabic text.

## Accessibility

- Soft destructive/status surfaces use `tone-*` (contrast-checked on card, page, muted and hovered rows), not the theme's raw `--destructive` on a tint.
- A control's accessible name contains its visible text; decorative key caps get `aria-hidden`.
- Separators inside `list`/`listbox` are `aria-hidden`. Icon-only buttons have `aria-label`.

## Component specifics

- **Button:** always holds an empty spinner slot (it animates the loading width). Lay out children with `justify-start` and `ms-auto` on the trailing part (hotkey, chevron, count); `justify-between` shifts the label.
- **Optical centering:** icon beside a non-truncating label wraps the text in `opticalText` (`lib/utils`), as `Button`, `Badge` and menu rows do.
- **Charts:** series colors `--ds-chart-1…8` (`fill-series-N`), assigned in order. 2+ series get a legend, every chart a tooltip, one y-axis, bars ≤24px with 4px rounded ends, `isAnimationActive={false}`.
- **Reordering:** `Sortable` / `SortableItem` / `SortableHandle` (dnd-kit): pointer + keyboard (Space, arrows, Space; Escape cancels), announcements via `getLabel`, works in dialogs (capture-phase keyboard sensor).
- **Contrast:** `pnpm check:contrast` checks every theme and tone (text 4.5:1, focus ring 3:1, light and dark); `--fix` nudges OKLCH lightness only.
