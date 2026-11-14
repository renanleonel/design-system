import path from "node:path"
import { defineConfig } from "@playwright/test"

// Visual regression against a built docs site. VISUAL_URL points at a running
// server; without it, `next start` is launched on :3230 (run `pnpm build` first).
//
// Baselines are per platform (Playwright appends `-linux`, `-win32`, ...), and
// only the `-linux` ones are committed: they come from the `visual-baselines`
// workflow, never from a dev machine. VISUAL_SNAPSHOT_DIR redirects snapshots
// (reads and writes) to a throwaway directory for local runs.
const PORT = 3230
const external = process.env.VISUAL_URL?.replace(/\/$/, "")
const baseURL = external ?? `http://localhost:${PORT}`
const snapshotDir = process.env.VISUAL_SNAPSHOT_DIR
  ? path.resolve(process.env.VISUAL_SNAPSHOT_DIR)
  : path.resolve("tests/visual/__screenshots__")

export default defineConfig({
  testDir: "tests/visual",
  snapshotPathTemplate: `${snapshotDir.replaceAll("\\", "/")}/{arg}{-snapshotSuffix}{ext}`,
  outputDir: "test-results/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  reporter: process.env.CI
    ? [
        ["list"],
        ["github"],
        ["html", { open: "never", outputFolder: "playwright-report/visual" }],
      ]
    : "list",
  expect: {
    toHaveScreenshot: {
      // Sub-pixel antialiasing noise only; a real change moves far more pixels.
      maxDiffPixelRatio: 0.001,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  use: {
    baseURL,
    locale: "en-US",
    timezoneId: "UTC",
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: external
    ? undefined
    : {
        command: `pnpm exec next start -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
})
