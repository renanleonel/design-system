// UI audit: the checks from docs/COMPOSITION.md that a browser can measure.
// Runs every page at 320px and 1280px, light and dark, and fails on:
//   - icon/label pairs whose centers differ by more than 0.5px (optical centering)
//   - horizontal overflow (page scroll, or an element past the viewport)
//   - selects whose popup is narrower than, or (when over the trigger) offset from, the trigger
//   - icon-only buttons without an accessible name
//   - console errors and uncaught exceptions
//
// Usage: pnpm build && pnpm audit:ui            (starts `next start` on :3210)
//        AUDIT_URL=http://localhost:3000 pnpm audit:ui   (audits a running server)
import { execSync, spawn } from "node:child_process"
import { readFileSync } from "node:fs"
import AxeBuilder from "@axe-core/playwright"
import { chromium } from "playwright"

// AUDIT_PAGES=/blocks/projects,/examples limits the run to some pages.
// Every component docs page, from the registry.
const COMPONENT_PAGES = JSON.parse(readFileSync("registry.json", "utf8"))
  .items.filter((i) => i.type === "registry:ui")
  .map((i) => `/components/${i.name}`)
const ALL_PAGES = [
  "/",
  "/components",
  ...COMPONENT_PAGES,
  "/themes",
  "/examples",
  "/blocks",
  "/blocks/landing",
  "/blocks/pricing",
  "/blocks/dashboard",
  "/blocks/setup",
  "/blocks/onboarding",
  "/blocks/onboarding?variant=card",
  "/blocks/projects",
  "/blocks/customers",
  "/blocks/activity",
  "/blocks/footer",
  "/blocks/not-found",
  "/blocks/server-error",
  "/blocks/inbox",
  "/blocks/settings",
  "/blocks/billing",
  "/blocks/sign-in",
  "/blocks/sign-up",
  "/blocks/sign-up?layout=image-right",
  "/blocks/sign-up?layout=image-left",
  "/blocks/reset-password",
]
// AUDIT_SHARD=2/4 audits every 4th page starting at the 2nd (CI runs 4 in parallel).
const [shard, shards] = (process.env.AUDIT_SHARD ?? "1/1").split("/").map(Number)
const PAGES = (
  process.env.AUDIT_PAGES ? process.env.AUDIT_PAGES.split(",") : ALL_PAGES
).filter((_, i) => i % shards === shard - 1)
const VIEWPORTS = [
  { name: "mobile", width: 320, height: 800 },
  { name: "desktop", width: 1280, height: 900 },
]
const SCHEMES = ["light", "dark"]
const TOLERANCE = 0.5

// Accessibility (axe-core, WCAG 2.2 A/AA), desktop only (structure doesn't
// change with the viewport; contrast does with the theme, so both schemes).
// Iframes are skipped: the pages they show are audited on their own.
async function a11yChecks(page) {
  // Let entrance fades finish so contrast isn't measured mid-animation.
  await page.waitForTimeout(600)
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude("iframe")
    .analyze()
  return violations.map((v) => {
    const target = v.nodes[0]?.target.join(" ") ?? ""
    return `a11y ${v.id}: ${v.help} (${v.nodes.length}x, e.g. ${target.slice(0, 80)})`
  })
}

let server
async function baseUrl() {
  if (process.env.AUDIT_URL) return process.env.AUDIT_URL.replace(/\/$/, "")
  const port = 3210
  server = spawn("pnpm", ["exec", "next", "start", "-p", String(port)], {
    stdio: "ignore",
    shell: process.platform === "win32",
    // Own process group on POSIX, so the whole tree (pnpm -> next) can be killed.
    detached: process.platform !== "win32",
  })
  const url = `http://localhost:${port}`
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return url
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error("next start did not come up; run `pnpm build` first")
}

// Runs in the page: static checks that need no interaction.
function staticChecks(tolerance) {
  const issues = []
  const name = (el) => el.getAttribute("data-slot") || el.tagName.toLowerCase()
  const text = (el) => (el.textContent || "").trim().slice(0, 30)

  // Optical centering: every icon beside a trimmed label shares its center.
  for (const label of document.querySelectorAll("[data-slot=label]")) {
    const lr = label.getBoundingClientRect()
    if (!lr.height) continue
    for (const svg of label.parentElement.children) {
      if (svg.tagName !== "svg") continue
      const r = svg.getBoundingClientRect()
      if (!r.width) continue
      const d = r.top + r.height / 2 - (lr.top + lr.height / 2)
      if (Math.abs(d) > tolerance)
        issues.push(
          `icon off-center by ${d.toFixed(2)}px in ${name(label.parentElement)} "${text(label)}"`
        )
    }
  }

  // Overflow: no page scroll, nothing past the viewport (decorative aria-hidden parts excepted).
  const doc = document.documentElement
  if (doc.scrollWidth > doc.clientWidth + 1)
    issues.push(
      `page scrolls horizontally (${doc.scrollWidth} > ${doc.clientWidth})`
    )
  // Content clipped by a container that fits (a scrolling code line) is fine.
  const clipped = (el) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement)
      if (
        getComputedStyle(a).overflowX !== "visible" &&
        a.getBoundingClientRect().right <= window.innerWidth + 1
      )
        return true
    return false
  }
  for (const el of document.querySelectorAll("main *")) {
    if (el.closest("[aria-hidden=true]")) continue
    if (clipped(el)) continue
    const r = el.getBoundingClientRect()
    if (
      r.width &&
      r.right > window.innerWidth + 1 &&
      getComputedStyle(el).position !== "fixed"
    ) {
      issues.push(
        `${name(el)} "${text(el)}" overflows the viewport (right=${Math.round(r.right)})`
      )
      break
    }
  }

  // Icon-only buttons need a name.
  for (const b of document.querySelectorAll("button, [role=button]")) {
    const r = b.getBoundingClientRect()
    if (!r.width || text(b)) continue
    const named =
      b.getAttribute("aria-label") ||
      b.getAttribute("aria-labelledby") ||
      b.getAttribute("title") ||
      b.querySelector(".sr-only")
    if (!named) issues.push(`icon-only ${name(b)} has no accessible name`)
  }
  return issues
}

// `scope` limits the selects to a container (an open dialog), so nothing behind an overlay is clicked.
async function selectChecks(page, scope = "") {
  const issues = []
  const selector =
    `${scope} [data-slot=select-trigger]:visible:not([disabled]):not([data-disabled])`.trim()
  const count = await page.locator(selector).count()
  for (let i = 0; i < count; i++) {
    const trigger = page.locator(selector).nth(i)
    try {
      await trigger.click({ timeout: 3000 })
    } catch (error) {
      const reason = error.message.split("\n")[0]
      issues.push(`select #${i} could not be opened: ${reason}`)
      continue
    }
    const popup = page.locator("[data-slot=select-content][data-open]")
    const opened = await popup
      .waitFor({ state: "visible", timeout: 1500 })
      .then(() => true)
      .catch(() => false)
    if (!opened) continue // native select on touch
    await page.waitForTimeout(350)
    const m = await page.evaluate(() => {
      const t = document.querySelector(
        "[data-slot=select-trigger][aria-expanded=true]"
      )
      // Other selects keep their (hidden) popups mounted: measure the open one.
      const p = document.querySelector("[data-slot=select-content][data-open]")
      if (!t || !p) return null
      const tr = t.getBoundingClientRect()
      const pr = p.getBoundingClientRect()
      return {
        label: t.textContent.trim().slice(0, 20),
        over: p.getAttribute("data-side") === "none",
        left: pr.left - tr.left,
        narrower: tr.width - pr.width,
      }
    })
    await page.keyboard.press("Escape")
    await page.waitForTimeout(250)
    if (!m) continue
    if (m.narrower > 1)
      issues.push(
        `select "${m.label}" popup is ${m.narrower.toFixed(1)}px narrower than its trigger`
      )
    if (m.over && Math.abs(m.left) > 1)
      issues.push(
        `select "${m.label}" popup is offset ${m.left.toFixed(1)}px from its trigger`
      )
  }
  return issues
}

// Kills the server and its children (pnpm spawns next, which spawns workers).
function stopServer() {
  if (!server?.pid) return
  try {
    if (process.platform === "win32")
      execSync(`taskkill /PID ${server.pid} /T /F`, { stdio: "ignore" })
    else process.kill(-server.pid, "SIGTERM")
  } catch {}
}

const url = await baseUrl()
const browser = await chromium.launch()
const failures = []
try {
  for (const scheme of SCHEMES) {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
        colorScheme: scheme,
      })
      await context.addInitScript(
        (s) => localStorage.setItem("theme", s),
        scheme
      )
      for (const path of PAGES) {
        const page = await context.newPage()
        const errors = []
        page.on("pageerror", (e) => errors.push(`uncaught: ${e.message}`))
        page.on(
          "console",
          (msg) =>
            msg.type() === "error" && errors.push(`console: ${msg.text()}`)
        )
        // Pages full of iframes (the blocks gallery) never go fully idle:
        // wait for load, then give the network a few seconds to settle.
        await page.goto(url + path, { waitUntil: "load" })
        await page
          .waitForLoadState("networkidle", { timeout: 5000 })
          .catch(() => {})
        await page.evaluate(() => document.fonts.ready)

        const where = `${path} · ${vp.name} · ${scheme}`
        const issues = [...(await page.evaluate(staticChecks, TOLERANCE))]
        if (vp.name === "desktop") issues.push(...(await a11yChecks(page)))
        if (vp.name === "desktop") {
          issues.push(...(await selectChecks(page)))
          // Dialogs: open each, audit inside, close.
          const triggers = page.locator(
            "[data-slot=dialog-trigger]:visible:not([disabled]):not([data-disabled])"
          )
          for (let i = 0; i < (await triggers.count()); i++) {
            try {
              await triggers.nth(i).click({ timeout: 3000 })
            } catch (error) {
              const reason = error.message.split("\n")[0]
              issues.push(`dialog #${i} could not be opened: ${reason}`)
              continue
            }
            await page.waitForTimeout(400)
            issues.push(
              ...(await page.evaluate(staticChecks, TOLERANCE)).map(
                (x) => `dialog: ${x}`
              )
            )
            issues.push(
              ...(await selectChecks(page, "[data-slot=dialog-content]")).map(
                (x) => `dialog: ${x}`
              )
            )
            await page.keyboard.press("Escape")
            await page.waitForTimeout(400)
          }
        }
        if (vp.name === "desktop") {
          // Command palette (Mod+K), on pages that have one: opening it must not throw.
          await page.keyboard.press("Control+K")
          await page.waitForTimeout(400)
          if (await page.locator("[cmdk-root]").count()) {
            issues.push(
              ...(await page.evaluate(staticChecks, TOLERANCE)).map(
                (x) => `palette: ${x}`
              )
            )
            await page.keyboard.press("Escape")
            await page.waitForTimeout(300)
          }
        }
        issues.push(...errors)
        for (const issue of new Set(issues)) failures.push(`${where}: ${issue}`)
        console.log(`${issues.length ? "✗" : "✓"} ${where}`)
        await page.close()
      }
      await context.close()
    }
  }
} finally {
  await browser.close()
  stopServer()
}

if (failures.length) {
  console.log(`\n${failures.length} issue(s):`)
  failures.forEach((f) => console.log(`  - ${f}`))
  process.exit(1)
}
console.log("\nUI audit passed.")
