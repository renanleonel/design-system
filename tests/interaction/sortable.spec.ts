import { expect, test, type Page } from "@playwright/test"

import { hydrated } from "./helpers"

const NAMES = ["Lint", "Run tests", "Build", "Deploy to production"]

// Rows of the first story (handle drag), in DOM order.
const order = (page: Page) =>
  page
    .locator('[data-slot="sortable-item"]')
    .filter({ has: page.getByRole("button", { name: /^Reorder / }) })
    .locator("span.font-medium")

test.beforeEach(async ({ page }) => {
  await page.goto("/components/sortable")
  await hydrated(page.getByRole("button", { name: "Reorder Lint" }))
})

test("starts in the declared order", async ({ page }) => {
  await expect(order(page).first()).toHaveText("Lint")
})

test("Space, arrows, Space reorders with the keyboard", async ({ page }) => {
  const handle = page.getByRole("button", { name: "Reorder Lint" })
  await handle.focus()
  await page.keyboard.press("Space")
  // dnd-kit announces the lift; arrow keys are only listened to after that.
  await expect(handle).toHaveAttribute("aria-pressed", "true")
  await page.keyboard.press("ArrowDown")
  await expect(
    page.getByText("Lint moved to position 2 of 4.")
  ).toBeAttached()
  await page.keyboard.press("Space")
  await expect(page.getByText("Dropped Lint at position 2 of 4.")).toBeAttached()
  await expect(order(page)).toHaveText([
    "Run tests",
    "Lint",
    "Build",
    "Deploy to production",
  ])
})

test("Escape cancels a keyboard drag", async ({ page }) => {
  const handle = page.getByRole("button", { name: "Reorder Lint" })
  await handle.focus()
  await page.keyboard.press("Space")
  await expect(handle).toHaveAttribute("aria-pressed", "true")
  await page.keyboard.press("ArrowDown")
  await expect(
    page.getByText("Lint moved to position 2 of 4.")
  ).toBeAttached()
  await page.keyboard.press("Escape")
  await expect(page.getByText("Moving Lint cancelled.")).toBeAttached()
  await expect(order(page)).toHaveText(NAMES)
})
