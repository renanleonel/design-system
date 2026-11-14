import { expect, type Locator } from "@playwright/test"

/**
 * Waits until React has hydrated the element (it owns a `__reactProps$` key).
 * Server HTML is visible before its handlers exist, so acting on it too early
 * silently does nothing.
 */
export async function hydrated(locator: Locator) {
  await expect
    .poll(() =>
      locator.evaluate((el) =>
        Object.keys(el).some((key) => key.startsWith("__reactProps$"))
      )
    )
    .toBe(true)
}
