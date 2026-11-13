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
