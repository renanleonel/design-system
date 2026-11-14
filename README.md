# renanleonel/ui

Personal design system: a [shadcn](https://ui.shadcn.com) registry on [Base UI](https://base-ui.com), themeable with any [tweakcn](https://tweakcn.com) theme. Accessible by default (axe WCAG 2.2 AA audited on every page), responsive down to 320px, light and dark.

## Install

```bash
R=https://raw.githubusercontent.com/renanleonel/design-system/main/public/r

npx shadcn init $R/base.json                            # new project: tokens, utils, every component
npx shadcn add $R/theme-caffeine.json                   # a theme from this registry (neutral, caffeine, amethyst-haze)
npx shadcn add https://tweakcn.com/r/themes/<id>.json   # ...or any tweakcn theme
npx shadcn add $R/button.json                           # one component in an existing project
npx shadcn add $R/app-shell.json $R/data-table.json     # blocks
```

Or register the namespace once in the project's `components.json` and add items by name:

```json
"registries": {
  "@renanleonel": "https://raw.githubusercontent.com/renanleonel/design-system/main/public/r/{name}.json"
}
```

```bash
npx shadcn add @renanleonel/button @renanleonel/app-shell @renanleonel/theme-caffeine
```

## What's inside

- **55 components** (`components/ui`): inputs, forms (React Hook Form + zod), overlays that become drawers and sheets on mobile, feedback states, charts, sortable lists, hotkeys. Browse them at `/components`.
- **Hooks:** `use-hotkey-press`, `use-media-query`, `use-url-state`.
- **Blocks** (full screens, router-agnostic, preview at `/blocks`):

| Block | What's in it |
| --- | --- |
| `app-shell` | Resizable sidebar that settles to an icon rail, Mod+K palette, G-then-key navigation |
| `data-table` | Search, filters, sort and pages in the URL; bulk actions; every loading state |
| `grouped-table` | Collapsible groups, pinned header and bands, calculation footer |
| `infinite-table` | Cursor pagination that loads ahead, inline retry, end mark |
| `dashboard` | KPI tiles with sparklines, charts, activity |
| `settings` · `billing` | Profile, members and roles, typed delete · plans, usage meters, invoices |
| `auth` | Sign in, sign up, password reset, Google and SSO |
| `onboarding` | Setup wizard, get-started checklist, first-run screens |
| `notifications` | Bell menu with unread count and a full feed |
| `marketing` · `pricing` · `site-footer` | Header, hero, features, testimonials · plans and comparison · footer |
| `error-pages` | 404, 403, 500, maintenance |

## Theming in layers

1. **Theme** (shadcn contract): `--primary`, `--radius`, `--font-sans`, `--shadow-*`… anything tweakcn exports.
2. **Tokens** (`registry/tokens.mjs`): what themes don't cover. Defaults derive from layer 1, so override only what you need:

   ```css
   :root { --ds-radius-control: 9999px; --ds-control-h: 2.5rem; } /* pill buttons, comfortable density */
   ```

3. **Components** read only layers 1 and 2.

## Develop

```bash
pnpm install
pnpm dev              # docs site: /, /components, /blocks, /themes
pnpm registry:build   # regenerate registry.json, app/ds-tokens.css, public/r (commit the output)
```

Before pushing: `pnpm typecheck && pnpm lint && pnpm check:contrast && pnpm registry:build && pnpm build && pnpm audit:ui`.

| Doc | For |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | Entry point for AI agents (Claude Code reads it via `CLAUDE.md`) |
| [`docs/CONTEXT.md`](docs/CONTEXT.md) | Repo map and build pipeline |
| [`docs/DOMAIN.md`](docs/DOMAIN.md) | Glossary |
| [`docs/RULES.md`](docs/RULES.md) · [`docs/BLOCKS.md`](docs/BLOCKS.md) · [`docs/COMPOSITION.md`](docs/COMPOSITION.md) | Component, block and composition rules |
| [`docs/WORKFLOWS.md`](docs/WORKFLOWS.md) | Adding components, blocks, themes, tokens; checks |
