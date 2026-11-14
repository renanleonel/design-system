import { expect, test, type Page } from "@playwright/test"

import { hydrated } from "./helpers"

// The first story: a single-select "Entry file" that starts on tree.tsx.
const trigger = (page: Page) => page.getByRole("button", { name: "Entry file" })
const item = (page: Page, name: string) =>
  page.getByRole("treeitem", { name, exact: true })

async function openTree(page: Page) {
  await trigger(page).click()
  await expect(page.getByRole("tree")).toBeVisible()
  // Focus moves from the search box into the tree.
  await page.getByRole("searchbox", { name: "Search files" }).press("ArrowDown")
  await expect(page.getByRole("tree")).toBeFocused()
}

test.beforeEach(async ({ page }) => {
  await page.goto("/components/tree-select")
  await hydrated(trigger(page))
})

test("the trigger shows the current value and opens on its folder", async ({
  page,
}) => {
  await expect(trigger(page)).toContainText("tree.tsx")
  await trigger(page).click()
  // Ancestors of the value are open; other folders stay closed.
  await expect(item(page, "components")).toHaveAttribute("aria-expanded", "true")
  await expect(item(page, "ui")).toHaveAttribute("aria-expanded", "true")
  await expect(item(page, "tree.tsx")).toHaveAttribute("aria-selected", "true")
  await expect(item(page, "app")).toHaveAttribute("aria-expanded", "false")
})

test("arrow keys expand and collapse a folder", async ({ page }) => {
  await openTree(page)
  const tree = page.getByRole("tree")
  await tree.press("Home")
  await expect(item(page, "app")).toHaveAttribute("aria-expanded", "false")
  await tree.press("ArrowRight")
  await expect(item(page, "app")).toHaveAttribute("aria-expanded", "true")
  await expect(item(page, "globals.css")).toBeVisible()
  await tree.press("ArrowLeft")
  await expect(item(page, "app")).toHaveAttribute("aria-expanded", "false")
  await expect(item(page, "globals.css")).toHaveCount(0)
})

test("keyboard navigation reaches a nested item and selects it", async ({
  page,
}) => {
  await openTree(page)
  const tree = page.getByRole("tree")
  await tree.press("Home") // app
  await tree.press("ArrowRight") // expand
  await tree.press("ArrowRight") // into (site)
  await tree.press("ArrowRight") // expand (site)
  await tree.press("ArrowRight") // into page.tsx
  await tree.press("Enter")
  await expect(page.getByRole("tree")).toHaveCount(0) // popup closed on pick
  await expect(trigger(page)).toContainText("page.tsx")
})

test("clicking a nested item selects it and closes the popup", async ({
  page,
}) => {
  await trigger(page).click()
  await item(page, "button.tsx").click()
  await expect(page.getByRole("tree")).toHaveCount(0)
  await expect(trigger(page)).toContainText("button.tsx")
})

test("searching filters the tree and shows the empty message", async ({
  page,
}) => {
  await trigger(page).click()
  const search = page.getByRole("searchbox", { name: "Search files" })
  await search.fill("layout")
  await expect(item(page, "layout.tsx")).toBeVisible()
  await expect(item(page, "button.tsx")).toHaveCount(0)
  await search.fill("zzzz")
  await expect(page.getByText("No matches.")).toBeVisible()
})
