# Block rules

For `components/blocks/<name>/` and their demo routes in `app/blocks/`. Component rules in [`RULES.md`](RULES.md) still apply.

## Structure

- Built only from `components/ui`; published as `registry:block`.
- Router-agnostic so they run in Next.js and Vite: plain `<a>` or a `linkComponent` prop, `onNavigate`, `currentPath`.
- Shareable view state lives in the URL via `hooks/use-url-state` (`useSyncExternalStore` + History API).
- Width-dependent layout uses container queries (`@container`, `@2xl/table:`): beside a sidebar, a tablet holds a phone-width table.
- Sample data follows [`DOMAIN.md`](DOMAIN.md) (Renan Leonel + Brazilian names); demos avoid external images and network calls (the audit fails on console errors).

## Page width

`AppShellContent` is centered (`mx-auto`). Reading and form pages cap it (`max-w-3xl` feeds, `max-w-4xl` settings); tables and dashboards stay full width.

## Tables

Pick by job:

| Block | For |
| --- | --- |
| `DataTable` | Search, filters, sort and pages in the URL |
| `GroupedTable` | Spreadsheet view: collapsible groups, calculation footer, floating bulk bar |
| `InfiniteTable` | Feeds and logs: cursor pagination; `useCursorPages` has the `useInfiniteQuery` shape, reset with a `key` when filters change |

- Pinned header, bands or footer: `border-separate border-spacing-0`, borders as inset shadows.
- The scroll container is the table's own `relative` div. An outer `overflow-x-auto` wrapper breaks `sticky top`; a missing `relative` lets `sr-only` descendants escape the clip and scroll the page.
- Full-height tables: `AppShellContent fill` + `flex-1 min-h-0`, so only the table scrolls (no `calc(100dvh-…)`).
- First-load skeletons fill the whole table and clip (no scrollbar).
- Infinite lists load ahead (`rootMargin` 600px), keep a "Load more" button for keyboard and screen readers, retry inline, and announce the end.
- Row checkboxes are named after the row (`getRowLabel`).
- TanStack Table: memoize URL-derived state by value; a new array each render re-triggers auto-resets and loops.

## Resizable sidebars

Every sidebar that resizes or collapses (app shell, docs nav, settings sub-nav, inspector panels) reuses the app shell pattern, `variant="fade"` (default):

- Labels stay mounted; icons keep one position in both states (left-aligned, not centered).
- The edge is a resize handle (drag, double-click, Enter, arrows); under 160px it settles to the icon rail.
- `motion` sets how labels leave: `ease-out` (snap, 0.16s fade, 0.4s width), `cascade` (drift left, fade top-down via `--i`), `scrub` (opacity follows drag width). Timings live in `SIDEBAR_MOTION` as CSS variables.
- `variant="classic"` exists only for the old rail.

## Demo routes

- `app/blocks/(app)/` pages render inside `AppShell`; standalone screens (auth, marketing, errors) sit beside it.
- Add every new route (and query-param variants) to `ALL_PAGES` in `scripts/audit-ui.mjs`.
