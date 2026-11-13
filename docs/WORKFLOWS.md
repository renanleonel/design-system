# Workflows

Each recipe is done when its last step passes. All end with [Checks before pushing](#checks-before-pushing).

## Add or change a component

1. Read [`RULES.md`](RULES.md); for a card, panel, dialog or palette also [`COMPOSITION.md`](COMPOSITION.md) and the closest file in `components/examples/`.
2. Write `components/ui/<name>.tsx`. Reuse `Panel`/`PanelCard`, `IconTile`, `Badge tone`, `DataList`, `TabsList variant="segmented"`, `Alert tone`, `Button variant="surface"` over one-off styling.
3. Add `registry/catalog.json` → `components.<name>` (group, title, description, notes). The description becomes the item's description.
4. Write `components/demos/<name>.tsx`: each `export function` is a story, the first is the main preview, an optional `/** … */` above it is its description. The code tab shows the story with only the imports and helpers it uses, so keep stories self-contained.
5. `pnpm registry:build`. The page `/components/<name>` and its audit entry appear automatically.

## Add a block

1. Read [`BLOCKS.md`](BLOCKS.md).
2. Write `components/blocks/<name>/*.tsx` using only `components/ui`.
3. Add a demo route in `app/blocks/` (inside `(app)/` if it lives in the shell) and add it to `ALL_PAGES` in `scripts/audit-ui.mjs`.
4. `pnpm registry:build`.

## Add a theme

1. Drop the tweakcn theme JSON in `registry/themes/<name>.json` (published as `theme-<name>`).
2. `pnpm check:contrast` (add `--fix` to nudge lightness), then `pnpm registry:build`.

## Change tokens or utilities

1. Edit `registry/tokens.mjs`; defaults derive from theme vars.
2. `pnpm registry:build`, then install `public/r/tokens.json` into a fresh project and build it (CI's `registry-install` job does this).

## Checks before pushing

```bash
pnpm typecheck && pnpm lint && pnpm check:contrast && pnpm registry:build && pnpm build && pnpm audit:ui
```

- `audit:ui` starts `next start` on :3210, so run `pnpm build` first (or point `AUDIT_URL` at a running server). It fails on icons off their label's center by >0.5px, horizontal overflow, select popups narrower than or offset from their trigger, unnamed icon-only buttons, console errors, and any axe WCAG 2.2 A/AA violation. It opens every select, dialog and dropdown menu.
- Narrow it: `AUDIT_PAGES=/blocks/projects,/examples` or `AUDIT_SHARD=2/4`.
- Debug one axe failure: `node scripts/axe-detail.mjs /path [rule]` prints the failing HTML.
- Commit the generated files with the change; CI fails when `registry:build` produces a diff.
