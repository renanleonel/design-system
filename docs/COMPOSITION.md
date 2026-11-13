# Composition

How to build cards, panels and dialogs that look considered, using only renan/ui parts. The three compositions in `/examples` (`components/examples/*`) follow every rule here; start from the closest one.

## 1. Surfaces

- **Nest, don't border.** A tinted tray (`Panel`) holds white cards (`PanelCard`). Hierarchy comes from tone (tray < card), not lines. Never a card inside a card.
- **Radii are concentric.** Inner radius = outer radius − padding. `Panel` computes it from `--ds-panel-radius` and `--ds-panel-pad`; for any other nesting write `rounded-[calc(outer-pad)]`, never the same radius twice.
- **One elevation per surface:** `shadow-border` (cards, tray), `shadow-popover`, `shadow-modal`. No border + shadow. Clickable cards get `interactive` (ring darkens on hover); static cards don't react.
- **Inset groups** inside a card or dialog (the "IF" block): `rounded-xl bg-muted/60 p-3`, controls inside on `bg-background`.

## 2. Alignment

- **Few edges.** The header title, card content and footer text share one leading edge (`PanelHeader` pads by tray + card padding for this). Trailing items (pills, amounts, counts, chevrons) share one trailing edge. Check by drawing a vertical line in the screenshot.
- **Row anatomy, always in this order:** leading visual (`IconTile` / avatar) → title + meta (`min-w-0 flex-1`, both `truncate`) → trailing status (`Badge tone`) → trailing value (`tabular-nums`, `text-end`).
- **Nothing reserves invisible space** at a row's end (e.g. a hidden check icon); it breaks the trailing edge.
- **Selects open over their trigger** by aligning the selected item's text with the trigger's text; this is exact only when both have the same leading content. A trigger with a leading visual (icon tile, avatar) uses `<SelectContent alignItemWithTrigger={false}>` so the popup drops below with matching edges.
- **Icons and text center optically,** not by line box: `Button`, `Badge` and menu rows wrap their text in a `text-box`-trimmed span (`opticalText` in `lib/utils`). Use it in any new component that puts an icon beside a label that never truncates.
- **Overlapping avatars use opaque tints** (`bg-tone-*-soft`), and initials overlap less than photos (`-space-x-1`).
- **Grids over flex math;** a single shrinkable column on mobile (`grid-cols-[minmax(0,1fr)]`).

## 3. Type (few sizes, one weight step)

| Role | Classes |
| --- | --- |
| Panel title | `text-lg font-medium tracking-tight` |
| Card / row title | `text-base font-medium` |
| Meta, labels | `text-sm text-muted-foreground` |
| Value under a label | `DataItem` (`text-base font-medium tabular-nums`) |
| Hero value / code | `font-heading text-3xl font-semibold tracking-tight leading-none` |
| Section heading in lists | `text-xs text-muted-foreground` with a trailing count |

- Meta joins facts with ` · ` ("staging · 12 min ago"); keep it to two facts.
- Times, amounts, counts and IDs are `tabular-nums`. Highlight a search match with weight, not color.

## 4. Color

- Neutral by default. Color only carries meaning, through **tones** (`gray blue green amber orange red purple`): `Badge tone`, `IconTile tone`, `Alert tone`, avatar tints. One meaning per tone across the product (green = live/ok, blue = in progress, orange = draft, red = failed, purple = scheduled).
- Tones are text on a 12% tint of themselves, contrast-checked in both modes (`pnpm check:contrast`). Never put tone text on a different tone.
- **One dark primary action per view** (`Button` default, in a `Panel` it is a pill at `size="lg"`), secondary actions as `variant="surface"` round icon buttons or `outline`.

## 5. Spacing

- 4px scale only. Inside a group 8px (`gap-2`), between groups 16–24px (`gap-4`/`gap-5`), tray padding `--ds-panel-pad`.
- Card content `p-4`; row cards and dialog sections the same, so edges line up across cards.
- Push the last group of a stretched card to the bottom (`mt-auto`) instead of leaving a hole.

## 6. Details that make it read "designed"

- A leading `IconTile` in dialog headers, with title + one-line meta ("Escalate urgent tickets · step 3 of 8") and the close button in the same row, vertically centered.
- Segmented controls (`TabsList variant="segmented"`) for 2–4 views, with a sliding thumb.
- Avatar stacks with a `ring-2 ring-card` separating faces.
- Dialog footers: a quiet note on the leading edge (icon + `text-sm text-muted-foreground`), actions trailing, the primary with an icon and a hotkey.
- Keyboard hints where the action lives (`Hotkey`, `Kbd` in palette footers).
- Real content shapes, never decorative fake charts. No illustration? Use an `IconTile`, initials or a labelled placeholder.

## 7. Checklist before shipping a composition

- [ ] Squint test: the one thing the user came for is the most prominent.
- [ ] Leading and trailing edges line up (inspect at 1x).
- [ ] Concentric radii; no surface has both border and shadow.
- [ ] Works at 320px (container queries for card internals: `DataList` switches to a 2×2 grid) and in dark mode (tray darker than cards).
- [ ] Long names truncate, no row reserves dead space, counts and amounts are tabular.
- [ ] One primary action; every icon-only button has `aria-label`.
