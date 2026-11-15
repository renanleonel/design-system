import { expect, test, type Page } from "@playwright/test"

import { hydrated } from "./helpers"

// Display cells carry no label; find them by row text and column position.
const row = (page: Page, deal: string) =>
  page.getByRole("row").filter({ hasText: deal })
const COL = {
  name: 0,
  company: 1,
  owner: 2,
  stage: 3,
  value: 4,
  probability: 5,
}
const at = (page: Page, deal: string, col: keyof typeof COL) =>
  row(page, deal).getByRole("gridcell").nth(COL[col])

test.beforeEach(async ({ page }) => {
  await page.goto("/blocks/deals")
  await expect(page.getByRole("grid", { name: "Deals" })).toBeVisible()
  await hydrated(at(page, "Seat expansion", "value"))
})

test("editing a cell shows the new value at once and then saves", async ({
  page,
}) => {
  const value = at(page, "Seat expansion", "value")
  await expect(value).toContainText("R$32,500")
  await value.dblclick()
  const editor = page.getByRole("textbox", {
    name: "Value for Seat expansion",
  })
  await editor.fill("40000")
  await editor.press("Enter")

  await expect(value).toContainText("R$40,000")
  await expect(value.getByLabel("Saving")).toBeVisible()
  await expect(page.getByText("Saving 1 change…")).toBeVisible()

  await expect(value.getByLabel("Saving")).toHaveCount(0)
  await expect(page.getByText("All changes saved")).toBeVisible()
  await expect(value).toContainText("R$40,000")
})

test("typing on a focused cell replaces its value", async ({ page }) => {
  const probability = at(page, "Seat expansion", "probability")
  await probability.click()
  await page.keyboard.type("80")
  await page.keyboard.press("Enter")
  await expect(probability).toContainText("80%")
  await expect(page.getByText("All changes saved")).toBeVisible()
  await expect(probability).toContainText("80%")
})

test("a failing save rolls the cell back and keeps an error", async ({
  page,
}) => {
  // Deals over R$1M are refused by the stand-in API.
  const value = at(page, "Seat expansion", "value")
  await value.dblclick()
  const editor = page.getByRole("textbox", { name: "Value for Seat expansion" })
  await editor.fill("2000000")
  await editor.press("Enter")
  await expect(value).toContainText("R$2,000,000")

  await expect(value).toContainText("R$32,500")
  await expect(value).toHaveAttribute("aria-invalid", "true")
  await expect(page.getByText("1 change not saved")).toBeVisible()
  await expect(
    page.getByText("Deals over R$1,000,000 need a manager's approval.").first()
  ).toBeVisible()
})

test("the server-error switch fails every save, and Retry is offered", async ({
  page,
}) => {
  await page.getByRole("switch", { name: "Simulate server errors" }).click()
  const name = at(page, "Seat expansion", "name")
  await name.dblclick()
  const editor = page.getByRole("textbox", { name: "Deal for Seat expansion" })
  await editor.fill("Seat growth")
  await editor.press("Enter")

  await expect(name).toContainText("Seat expansion")
  await expect(name).toHaveAttribute("aria-invalid", "true")
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible()
})

test("Escape cancels an edit without saving", async ({ page }) => {
  const value = at(page, "Seat expansion", "value")
  await value.dblclick()
  const editor = page.getByRole("textbox", { name: "Value for Seat expansion" })
  await editor.fill("1")
  await editor.press("Escape")
  await expect(value).toContainText("R$32,500")
  await expect(page.getByText("All changes saved")).toBeVisible()
})

test("an out-of-range number is rejected before saving", async ({ page }) => {
  const probability = at(page, "Seat expansion", "probability")
  await probability.dblclick()
  const editor = page.getByRole("textbox", {
    name: "Probability for Seat expansion",
  })
  await editor.fill("150")
  await editor.press("Enter")
  await expect(probability).toHaveAttribute("aria-invalid", "true")
  await expect(probability).toContainText("40%")
})
