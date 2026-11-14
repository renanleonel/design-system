// React Doctor (`npx react-doctor@latest`). Each rule turned off here doesn't fit
// this repo; the reason sits next to it. Prefer fixing code over adding to this list.
const config = {
  rules: {
    // Every useSearchParams here is hooks/use-url-state (useSyncExternalStore over
    // window.location; blocks are router-agnostic), not next/navigation's, so
    // there's no client-rendering bailout to guard. `next build` already fails on
    // an unwrapped next/navigation useSearchParams.
    "react-doctor/nextjs-no-use-search-params-without-suspense": "off",
    // shadcn's public API exports variants and helpers (buttonVariants,
    // getPageRange, toastUndo…) and blocks export their sample data beside the
    // component. Consumers import them, so they can't move; only Fast Refresh
    // granularity is at stake.
    "react-doctor/only-export-components": "off",
    // Links here are Base UI's `<Button render={<a href=… />}>`, which takes its
    // text from the Button's children, so the static check can't see it. axe's
    // link-name rule checks the rendered DOM on every page in `pnpm audit:ui`.
    "react-doctor/anchor-has-content": "off",
    // Forms here are client-handled (react-hook-form, or a handler that must keep
    // the typed value when the request fails, which React 19 form actions reset).
    // The rule targets progressive-enhancement server actions, not a client library.
    "react-doctor/no-prevent-default": "off",
  },
}

export default config
