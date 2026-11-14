import { expect, test } from "@playwright/test"

import { hydrated } from "./helpers"

test.beforeEach(async ({ page }) => {
  await page.goto("/components/combobox")
  await hydrated(page.getByRole("combobox", { name: "Timezone" }).first())
  await hydrated(page.getByRole("combobox", { name: "Timezone" }).nth(1))
})

// The first "Timezone" combobox on the page is the Default story.
const input = (page: import("@playwright/test").Page) =>
  page.getByRole("combobox", { name: "Timezone" }).first()

test("opens on click and lists every option", async ({ page }) => {
  await input(page).click()
  await expect(page.getByRole("option", { name: "Lisbon" })).toBeVisible()
  await expect(page.getByRole("option")).toHaveCount(10)
})

test("typing filters the options", async ({ page }) => {
  await input(page).fill("lon")
  await expect(page.getByRole("option")).toHaveText(["London"])
})

test("keyboard selects the highlighted option", async ({ page }) => {
  const box = input(page)
  await box.fill("tok")
  await box.press("ArrowDown")
  await box.press("Enter")
  await expect(box).toHaveValue("Tokyo")
  await expect(page.getByRole("option")).toHaveCount(0)
})

test("shows the empty state when nothing matches", async ({ page }) => {
  await input(page).fill("zzzz")
  await expect(page.getByText("No timezones match.")).toBeVisible()
  await expect(page.getByRole("option")).toHaveCount(0)
})

test("the clear button empties a selected value", async ({ page }) => {
  // Second story: starts on Lisbon and has a clear button.
  const box = page.getByRole("combobox", { name: "Timezone" }).nth(1)
  await expect(box).toHaveValue("Lisbon")
  await page.getByRole("button", { name: "Clear" }).first().click()
  await expect(box).toHaveValue("")
})
