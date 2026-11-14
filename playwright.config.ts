import { defineConfig } from "@playwright/test"

// Runs against a built docs site. INTERACTION_URL points at a running server;
// without it, `next start` is launched on :3220 (run `pnpm build` first).
const PORT = 3220
const external = process.env.INTERACTION_URL?.replace(/\/$/, "")
const baseURL = external ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: "tests/interaction",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    // Entrance fades and slides are not under test.
    reducedMotion: "reduce",
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
