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

## Stress-test a component or block

Run the `break-ui` skill. Where it leaves a choice open, this repo decides:

1. **Fixture boundary.** A component's worst case is a `WorstCase` story in `components/demos/<name>.tsx` (plus `Empty` / `One` stories where they apply), so it ships as docs and is audited. A block's lives in its demo route (`app/blocks/…/page.tsx`, so it never ships), enters through a data prop, and is picked by `?data=worst|empty|one|many` read with `useSearchParams` from `hooks/use-url-state` (see `/blocks/settings`).
2. **Toggle.** Shell blocks add a "Data" segment to the Demo control in `components/playground/demo-shell.tsx`. Full-height pages (`[data-fill]`) and standalone screens hide that control, so the URL param is their switch.
3. **Values.** Plausible Brazilian data per [`DOMAIN.md`](DOMAIN.md): compound names with particles and suffixes (`Maria Eduarda dos Santos Albuquerque Cavalcanti`, `João Pedro de Oliveira Neto`), a two-letter name (`Jo`), a long corporate email, CJK/Arabic text. A broken avatar is an undecodable `data:` URI; a missing path is a 404 console error and fails the audit.
4. **Regression test.** Add every `?data=` variant to `ALL_PAGES` in `scripts/audit-ui.mjs`; the audit's 320/1280px, light/dark overflow checks then guard the fixes.
5. **Fixes** use tokens, then `pnpm registry:build`. A fix that applies beyond one component becomes a line in `RULES.md` → Text and worst-case data.

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
