# Domain

The vocabulary used across code, docs and commits. Use these words exactly.

| Term | Meaning |
| --- | --- |
| **Registry** | The shadcn registry this repo publishes (`renan`); `registry.json` describes it, `public/r` serves it. |
| **Item** | One installable unit: `registry:ui`, `registry:block`, `registry:hook`, `registry:lib` (`utils`), `registry:style` (`tokens`), `registry:theme`, `registry:base` (`base`). |
| **Component** | A file in `components/ui`; a `registry:ui` item built only on Base UI and tokens. |
| **Block** | A full screen in `components/blocks/<name>/`, built only from components; router-agnostic. Demoed under `app/blocks/`. |
| **Theme** (layer 1) | The shadcn variable contract (`--primary`, `--radius`, `--font-sans`, `--shadow-*`…); anything tweakcn exports. |
| **Token** (layer 2) | `--ds-*` variables in `registry/tokens.mjs` for what themes don't cover (control height, radius, focus ring, motion, panel, tones, chart). Defaults derive from layer 1. |
| **Utility** | A Tailwind `@utility` defined in `tokens.mjs` `css`: `h-control`, `rounded-control`, `focus-ring`, `hit-area`, `shadow-border/popover/modal`, `motion-*`. |
| **Tone** | Semantic color: `gray blue green amber orange red purple`, used as text on a 12% tint (`Badge tone`, `IconTile tone`, `Alert tone`, `tone-*`). One meaning per tone. |
| **Elevation** | One shadow per surface role: `shadow-border` (cards), `shadow-popover`, `shadow-modal`. |
| **Catalog** | `registry/catalog.json`: group, title, description, notes per component. Feeds the docs sidebar and item descriptions. |
| **Story** | An `export function` in `components/demos/<name>.tsx` (Storybook CSF style); the first is the page's main preview. |
| **Example** | A reference composition in `components/examples/`, shown live on the home page. Start new compositions from one. |
| **Playground** | `/themes`: live theme and token editing. |
| **Audit** | `pnpm audit:ui`: Playwright + axe over every docs page and block demo, 320/1280px, light/dark. |
| **Hotkey** | A `Mod+…`-style binding via `@tanstack/react-hotkeys`; shown with `<Hotkey>`. |
| **Responsive overlay** | An overlay that changes form below 640px or on touch (Dialog → Drawer, Popover → bottom sheet, Select → native). |
| **Sample data** | Signed-in user Renan Leonel (RL, renan@acme.dev); others are common Brazilian names (Ana Souza, João Silva, Pedro Santos, Maria Oliveira, Lucas Costa, Beatriz Lima). |
