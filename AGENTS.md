<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# renanleonel/ui

A shadcn registry on Base UI, plus the Next.js docs site that previews it. Consumers install from the committed `public/r/*.json`, so every change ships as registry output, not just source.

## Read before you work

Each doc is the single source of truth for its topic; read the ones your task touches.

| Read | When |
| --- | --- |
| [`docs/CONTEXT.md`](docs/CONTEXT.md) | First time here: directory map, the generate → build pipeline, what's generated vs hand-written |
| [`docs/DOMAIN.md`](docs/DOMAIN.md) | A term is unclear: registry item, block, token layer, tone, catalog, story, example |
| [`docs/RULES.md`](docs/RULES.md) | Writing or reviewing anything in `components/ui` or `hooks`: tokens, focus, motion, states, effects, forms, hotkeys, a11y |
| [`docs/BLOCKS.md`](docs/BLOCKS.md) | Building a screen in `components/blocks` or a demo route: tables, sidebars, page width, URL state, sample data |
| [`docs/COMPOSITION.md`](docs/COMPOSITION.md) | Composing a card, panel, dialog or palette: surfaces, alignment, type, color, spacing |
| [`docs/WORKFLOWS.md`](docs/WORKFLOWS.md) | Adding a component, block, theme or token; the checks before pushing |

The `frontend-design` and `animate` skills are the origin of these rules; `dataviz` covers charts.

## Hard guardrails

- Components read theme vars and `--ds-*` tokens only; raw colors, sizes and durations stay out of `components/`.
- Generated files are rebuilt with `pnpm registry:build`, never hand-edited: `registry.json`, `app/ds-tokens.css`, `components/demos/index.ts`, `public/r/`. Commit their output with the change.
- Done means the full check chain in [`docs/WORKFLOWS.md`](docs/WORKFLOWS.md#checks-before-pushing) passes; CI runs the same chain.
