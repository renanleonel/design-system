import { expect, test, type Page } from "@playwright/test"

import { hydrated } from "../interaction/helpers"
import { blockRoutes, componentNames } from "./pages"

// A fixed instant, so relative times ("3h ago"), "today" highlights and
// anything computed from Date.now() render the same on every run.
const NOW = new Date("2026-03-18T12:00:00Z")

const SCHEMES = ["light", "dark"] as const

async function settle(page: Page, url: string, scheme: string) {
  await page.clock.setFixedTime(NOW)
  await page.addInitScript((s) => {
    localStorage.setItem("theme", s)
    // Deterministic Math.random (simulated latency, generated ids).
    let seed = 1
    Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  }, scheme)
  await page.goto(url, { waitUntil: "load" })
  await hydrated(page.locator("body"))
  // Blocks with iframes or streams never go idle: bounded wait.
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {})
  await page.evaluate(() => document.fonts.ready)
  // Entrance fades and chart draw-ins.
  await page.waitForTimeout(700)
}

// --- Component pages: the main preview, not the docs chrome ---------------
const components = componentNames()
for (const scheme of SCHEMES) {
  test.describe(`components ${scheme} 1280`, () => {
    test.use({ colorScheme: scheme, viewport: { width: 1280, height: 900 } })
    for (const name of components) {
      test(name, async ({ page }) => {
        await settle(page, `/components/${name}`, scheme)
        const preview = page.locator("[data-slot=story-preview]").first()
        await expect(preview).toBeVisible()
        await expect(preview).toHaveScreenshot(
          `components/${name}-${scheme}.png`
        )
      })
    }
  })
}

// --- Blocks: each demo route, default data and ?data=worst ----------------
const VIEWPORTS = [
  { name: "1280", width: 1280, height: 900 },
  { name: "320", width: 320, height: 800 },
]
const blocks = blockRoutes()
for (const scheme of SCHEMES) {
  for (const vp of VIEWPORTS) {
    test.describe(`blocks ${scheme} ${vp.name}`, () => {
      test.use({
        colorScheme: scheme,
        viewport: { width: vp.width, height: vp.height },
      })
      for (const block of blocks) {
        const variants = block.worst ? ["", "worst"] : [""]
        for (const data of variants) {
          const slug = block.route.replace("/blocks/", "")
          test(data ? `${slug} ?data=${data}` : slug, async ({ page }) => {
            // chrome=0 hides the floating demo controls (docs-only UI).
            const query = new URLSearchParams({ chrome: "0" })
            if (data) query.set("data", data)
            await settle(page, `${block.route}?${query}`, scheme)
            await expect(page).toHaveScreenshot(
              `blocks/${slug}${data ? `-${data}` : ""}-${scheme}-${vp.name}.png`,
              { fullPage: true }
            )
          })
        }
      }
    })
  }
}

// --- RTL: a handful of directional components -----------------------------
const RTL = ["tabs", "breadcrumb", "pagination", "carousel", "dropdown-menu"]
test.describe("components rtl light 1280", () => {
  test.use({ colorScheme: "light", viewport: { width: 1280, height: 900 } })
  for (const name of RTL.filter((n) => components.includes(n))) {
    test(`${name} rtl`, async ({ page }) => {
      await settle(page, `/components/${name}?dir=rtl`, "light")
      const preview = page.locator("[data-slot=story-preview]").first()
      await expect(preview).toBeVisible()
      await expect(preview).toHaveScreenshot(`components/${name}-rtl.png`)
    })
  }
})
