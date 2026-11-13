// Prints axe violations with each node's HTML and failure summary.
// Usage: node scripts/axe-detail.mjs /path [rule,rule] [light|dark]  (AUDIT_URL to change the server)
import AxeBuilder from "@axe-core/playwright"
import { chromium } from "playwright"

const [path = "/", rules, scheme = "light"] = process.argv.slice(2)
const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  colorScheme: scheme,
})
await context.addInitScript((s) => localStorage.setItem("theme", s), scheme)
const page = await context.newPage()
await page.goto(`${process.env.AUDIT_URL ?? "http://localhost:3000"}${path}`, { waitUntil: "load" })
await page.waitForTimeout(1500)
let builder = new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
  .exclude("iframe")
if (rules) builder = builder.withRules(rules.split(","))
const { violations } = await builder.analyze()
for (const v of violations) {
  console.log(`\n## ${v.id}`)
  for (const n of v.nodes.slice(0, 4)) {
    console.log("-", n.html.slice(0, 220))
    console.log("  ", n.failureSummary?.split("\n").slice(1, 3).join(" | ").slice(0, 260))
  }
}
await browser.close()
