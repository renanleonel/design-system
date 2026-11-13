# renan/ui

Personal design system: a [shadcn](https://ui.shadcn.com) registry on Base UI, themeable with any [tweakcn](https://tweakcn.com) theme.

## Use it

```bash
R=https://raw.githubusercontent.com/renanleonel/design-system/main/public/r

npx shadcn init $R/base.json              # new project: tokens, utils, every component
npx shadcn add $R/theme-caffeine.json     # pick a theme from this registry
npx shadcn add https://tweakcn.com/r/themes/<id>.json   # ...or any tweakcn theme
npx shadcn add $R/button.json             # a single component in an existing project
```

## Theming in layers

1. **Theme** (shadcn contract): `--primary`, `--radius`, `--font-sans`, `--shadow-*`… Anything tweakcn exports.
2. **Tokens** (`registry/tokens.mjs`): personality the theme doesn't cover. Their defaults derive from layer 1, so a project only overrides what it needs:

   | Token | Utility | Default |
   | --- | --- | --- |
   | `--ds-control-h` (`-xs`, `-sm`, `-lg`) | `h-control`, `size-control-sm`… | `2rem` |
   | `--ds-radius-control` | `rounded-control` | `var(--radius)` |

   ```css
   :root { --ds-radius-control: 9999px; --ds-control-h: 2.5rem; } /* pill buttons, comfortable density */
   ```
3. **Components** read only layers 1 and 2, never raw colors or sizes.

## Develop

```bash
pnpm dev              # playground at / (theme, radius and density switchers)
pnpm registry:build   # regenerate registry.json + app/ds-tokens.css, then public/r
```

- Components live in `components/ui`; each file becomes a registry item automatically (deps are read from imports).
- Themes live in `registry/themes/*.json`; drop a tweakcn theme JSON there to add one.
- Commit `public/r` — consumers install from it.
