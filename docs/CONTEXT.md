# Context

How the repo is laid out and how source becomes an installable registry. Terms are defined in [`DOMAIN.md`](DOMAIN.md).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 · Base UI · shadcn CLI 4 (`base-nova` style) · TanStack Table v8 · TanStack Virtual · react-resizable-panels · React Hook Form + zod · Recharts 3 · dnd-kit · `@tanstack/react-hotkeys` · Playwright + axe-core for the audit. pnpm only.

## Map

| Path | What | Hand-written? |
| --- | --- | --- |
| `components/ui/` | Primitives; each file becomes one `registry:ui` item | yes |
| `components/blocks/<name>/` | Full screens; each folder becomes one `registry:block` | yes |
| `hooks/` | Each file becomes a `registry:hook` | yes |
| `lib/utils.ts` | `cn`, `opticalText`…; the `utils` item | yes |
| `registry/tokens.mjs` | Layer-2 tokens: `tones`, `chart`, `root`, `dark`, `theme`, `css` (utilities) | yes |
| `registry/themes/*.json` | tweakcn themes → `theme-<file>` items | yes |
| `registry/catalog.json` | Docs metadata per ui component (group, title, description, notes) | yes |
| `components/demos/<name>.tsx` | Stories for each ui component | yes |
| `components/examples/` | Reference compositions, shown live on the home page | yes |
| `components/docs/`, `components/playground/` | Docs-site-only code; not published | yes |
| `app/(site)/` | Docs site: `/`, `/components`, `/blocks`, `/themes`, `/themes/builder` | yes |
| `app/mcp/` | Read-only design-system MCP endpoint at `/mcp`: `route.ts` (tools), `data.ts` (reads `public/r`, catalog, changelog, `docs/`, demos; files traced via `outputFileTracingIncludes`). Not published | yes |
| `app/blocks/` | Demo routes rendering each block; `(app)` group wraps pages in `AppShell` | yes |
| `scripts/` | `gen-registry`, `check-contrast`, `audit-ui`, `axe-detail` | yes |
| `registry/changelog.json`, `registry/size-budget.json` | Per-item dated change entries; per-item gzip and dependency budgets | yes |
| `registry.json`, `app/ds-tokens.css`, `components/demos/index.ts`, `public/llms.txt`, `public/llms-full.txt`, `public/tokens/*.tokens.json` | Output of `registry:gen` | **generated** |
| `lib/color.mjs` | Color math shared by `check-contrast`, `export-tokens` and the theme builder (`/themes/builder`) | yes |
| `public/r/*.json` | Output of `shadcn build`; what consumers install. Committed | **generated** |

## Pipeline

```
components/ui · components/blocks · hooks · lib/utils · registry/{tokens.mjs,themes,catalog.json}
   │  pnpm registry:gen   (scripts/gen-registry.mjs: deps read from imports, pinned to package.json ranges)
   ▼
registry.json · app/ds-tokens.css · components/demos/index.ts
   │  scripts/gen-llms.mjs (also reads registry/changelog.json; throws on an unknown item or bad entry)
   ▼
public/llms.txt · public/llms-full.txt
   │  scripts/export-tokens.mjs (W3C Design Tokens per theme, from tokens.mjs and registry/themes)
   ▼
public/tokens/<theme>.tokens.json
   │  shadcn build        (pnpm registry:build runs both steps)
   ▼
public/r/*.json  ──►  npx shadcn add https://raw.githubusercontent.com/renanleonel/design-system/main/public/r/<item>.json
```

- `registry:gen` throws when a ui file lacks a catalog entry or a demo file.
- Imports of `@/components/ui/*`, `@/hooks/*`, `@/lib/utils` and `@/components/blocks/<name>/*` become `registryDependencies`, so a block can build on another block (`app-shell` uses `command-palette`).
- `base` bundles tokens, utils and every ui component for `shadcn init`.
- `REGISTRY_URL` overrides the base URL baked into item references.
- shadcn rewrites registry CSS on install, which is why CI installs `public/r` into a fresh Next app and builds it.

## CI

`.github/workflows/ci.yml`: typecheck, lint, contrast, registry-is-up-to-date (`git diff --exit-code` on generated files), `check:size` (gzip and npm-dependency budget per item), `audit:ui` in 4 shards, and a fresh-project install of the registry.
