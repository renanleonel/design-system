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
import { availableParallelism } from "node:os"
import AxeBuilder from "@axe-core/playwright"
import { chromium } from "playwright"

// AUDIT_PAGES=/blocks/projects,/themes limits the run to some pages.
// Every component docs page, from the registry.
const COMPONENT_PAGES = JSON.parse(readFileSync("registry.json", "utf8"))
  .items.filter((i) => i.type === "registry:ui")
  .map((i) => `/components/${i.name}`)
const ALL_PAGES = [
  "/",
  "/components",
  ...COMPONENT_PAGES,
  "/themes",
  "/themes/builder",
  "/blocks",
  "/blocks/landing",
  "/blocks/pricing",
  "/blocks/dashboard",
  "/blocks/setup",
  "/blocks/onboarding",
  "/blocks/onboarding?variant=card",
  "/blocks/projects",
  "/blocks/deals",
  "/blocks/board",
  "/blocks/board?data=worst",
  "/blocks/board?data=many",
  "/blocks/board?data=empty",
  "/blocks/board?data=one",
  "/blocks/customers",
  "/blocks/activity",
  "/blocks/footer",
  "/blocks/not-found",
  "/blocks/server-error",
  "/blocks/inbox",
  "/blocks/mail",
  "/blocks/mail?data=worst",
  "/blocks/mail?data=empty",
  "/blocks/mail?data=one",
  "/blocks/mail?data=many",
  "/blocks/feed",
  "/blocks/feed?data=worst",
  "/blocks/feed?data=empty",
  "/blocks/feed?data=one",
  "/blocks/feed?data=many",
  "/blocks/schedule",
  "/blocks/schedule?view=month",
  "/blocks/schedule?view=day",
  "/blocks/schedule?lang=pt-BR&view=month",
  "/blocks/schedule?data=worst",
  "/blocks/schedule?data=worst&view=month",
  "/blocks/schedule?data=worst&view=day",
  "/blocks/schedule?data=empty&view=month",
  "/blocks/schedule?data=one",
  "/blocks/schedule?data=many&view=month",
  "/blocks/assistant",
  "/blocks/assistant?data=empty",
  "/blocks/assistant?data=one",
  "/blocks/assistant?data=many",
  "/blocks/assistant?data=worst",
  "/blocks/assistant?data=streaming",
  "/blocks/assistant?data=error",
  "/blocks/assistant?data=load-error",
  "/blocks/settings",
  "/blocks/settings?data=worst",
  "/blocks/settings?data=one",
  "/blocks/settings/general",
  "/blocks/billing",
  "/blocks/sign-in",
  "/blocks/sign-up",
  "/blocks/sign-up?layout=image-right",
  "/blocks/sign-up?layout=image-left",
  "/blocks/reset-password",
  "/blocks/files",
  "/blocks/files?data=worst",
  "/blocks/files?data=empty",
  "/blocks/files?data=one",
  "/blocks/files?data=many",
  "/blocks/files?view=list",
  "/blocks/files?view=list&data=worst",
  "/blocks/files?view=list&data=worst&sort=modified&dir=desc",
  "/blocks/command-palette",
  "/blocks/command-palette?data=worst",
  "/blocks/command-palette?data=empty",
  "/blocks/command-palette?data=one",
  "/blocks/command-palette?data=many",
]
// AUDIT_DIR=rtl appends ?dir=rtl to every URL, so the same checks run mirrored.
// AUDIT_SHARD=2/4 audits every 4th page starting at the 2nd (CI runs 6 in parallel).
const RTL = process.env.AUDIT_DIR === "rtl"
const [shard, shards] = (process.env.AUDIT_SHARD ?? "1/1")
  .split("/")
  .map(Number)
const PAGES = (
  process.env.AUDIT_PAGES ? process.env.AUDIT_PAGES.split(",") : ALL_PAGES
).filter((_, i) => i % shards === shard - 1)
const VIEWPORTS = [
  { name: "mobile", width: 320, height: 800 },
  { name: "desktop", width: 1280, height: 900 },
]
const SCHEMES = ["light", "dark"]
const TOLERANCE = 0.5
// AUDIT_CONCURRENCY=n audits n pages at once (default: CPU count, max 12).
const CONCURRENCY = Math.max(
  1,
  Number(process.env.AUDIT_CONCURRENCY) ||
    Math.min(availableParallelism(), 12)
)

// Accessibility (axe-core, WCAG 2.2 A/AA), desktop only (structure doesn't
// change with the viewport; contrast does with the theme, so both schemes).
// Iframes are skipped: the pages they show are audited on their own.
async function a11yChecks(page) {
  // Let entrance fades finish so contrast isn't measured mid-animation.
  await page.waitForTimeout(600)
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude("iframe")
    // Base UI's zero-size focus-trap sentinels: aria-hidden and focusable by
    // design (they only bounce focus back into an open popup).
    .exclude("[data-base-ui-focus-guard]")
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
    for (
      let a = el.parentElement;
      a && a !== document.body;
      a = a.parentElement
    )
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
    // The open animation scales the popup; under load 350ms alone can end mid-animation.
    await popup.evaluate(async (el) => {
      await new Promise((r) => setTimeout(r, 350))
      const deadline = Date.now() + 3000
      for (;;) {
        await new Promise((r) => requestAnimationFrame(r))
        const running = el
          .getAnimations({ subtree: true })
          .some((a) => a.playState === "running" || a.playState === "pending")
        if (!running || Date.now() > deadline) break
      }
    })
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
        // Offset of the start edge (the right edge in RTL).
        left:
          getComputedStyle(t).direction === "rtl"
            ? tr.right - pr.right
            : pr.left - tr.left,
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

async function auditPage({ context, vp, path }) {
  const page = await context.newPage()
  try {
    const errors = []
    page.on("pageerror", (e) => errors.push(`uncaught: ${e.message}`))
    page.on(
      "console",
      (msg) =>
        msg.type() === "error" && errors.push(`console: ${msg.text()}`)
    )
    // Pages full of iframes (the blocks gallery) never go fully idle:
    // wait for load, then give the network a few seconds to settle.
    const target = RTL
      ? url + path + (path.includes("?") ? "&" : "?") + "dir=rtl"
      : url + path
    await page.goto(target, { waitUntil: "load" })
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => {})
    await page.evaluate(() => document.fonts.ready)

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
      // Dropdown menus: open each (up to 12 per page). Rendering their
      // content must not throw (e.g. a label outside its group).
      const menus = page.locator(
        // Skips menus inside hidden, inert regions (a bulk bar with no selection).
        "[data-slot=dropdown-menu-trigger]:visible:not([disabled]):not([data-disabled]):not([inert] *)"
      )
      const count = Math.min(await menus.count(), 12)
      for (let i = 0; i < count; i++) {
        try {
          await menus.nth(i).click({ timeout: 3000 })
        } catch (error) {
          const reason = error.message.split("\n")[0]
          issues.push(`menu #${i} could not be opened: ${reason}`)
          continue
        }
        await page.waitForTimeout(250)
        await page.keyboard.press("Escape")
        await page.waitForTimeout(250)
      }
    }
    if (vp.name === "desktop") {
      // Other popups: open the first few of each kind and run the layout
      // and axe checks while they're open (menus, panels, hover cards).
      const POPUPS = [
        ["menubar", "[data-slot=menubar-trigger]", "click"],
        ["navigation menu", "[data-slot=navigation-menu-trigger]", "click"],
        ["popover", "[data-slot=popover-trigger]", "click"],
        ["context menu", "[data-slot=context-menu-trigger]", "context"],
        ["preview card", "[data-slot=preview-card-trigger]", "hover"],
      ]
      for (const [label, slot, how] of POPUPS) {
        const triggers = page.locator(
          `${slot}:visible:not([disabled]):not([data-disabled]):not([inert] *)`
        )
        const count = Math.min(await triggers.count(), 3)
        for (let i = 0; i < count; i++) {
          const trigger = triggers.nth(i)
          try {
            if (how === "hover") await trigger.hover({ timeout: 3000 })
            else
              await trigger.click({
                timeout: 3000,
                button: how === "context" ? "right" : "left",
              })
          } catch (error) {
            const reason = error.message.split("\n")[0]
            issues.push(`${label} #${i} could not be opened: ${reason}`)
            continue
          }
          await page.waitForTimeout(how === "hover" ? 900 : 400)
          issues.push(
            ...(await page.evaluate(staticChecks, TOLERANCE)).map(
              (x) => `${label}: ${x}`
            ),
            ...(await a11yChecks(page)).map((x) => `${label}: ${x}`)
          )
          await page.keyboard.press("Escape")
          await page.mouse.move(0, 0)
          await page.waitForTimeout(300)
        }
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
    return issues
  } finally {
    await page.close()
  }
}

const url = await baseUrl()
const browser = await chromium.launch()
const failures = []
try {
  // Results flush in task order, so output matches a sequential run.
  const tasks = []
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
      for (const path of PAGES) tasks.push({ context, vp, scheme, path })
    }
  }
  const results = Array.from({ length: tasks.length })
  let next = 0
  let flushed = 0
  const flush = () => {
    while (flushed < tasks.length && results[flushed]) {
      const { issues, where } = results[flushed++]
      for (const issue of new Set(issues)) failures.push(`${where}: ${issue}`)
      console.log(`${issues.length ? "✗" : "✓"} ${where}`)
    }
  }
  const audit = (t) =>
    auditPage(t).catch((e) => [`audit crashed: ${e.message.split("\n")[0]}`])
  const where = (t) => `${t.path} · ${t.vp.name} · ${t.scheme}`
  const retries = []
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++
      const issues = await audit(tasks[i])
      if (issues.length) {
        retries.push(i)
        continue
      }
      results[i] = { issues, where: where(tasks[i]) }
      flush()
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, worker)
  )
  // A loaded runner can time out a click on a heavy page; a page that failed
  // beside others is audited again alone, and only that result counts.
  for (const i of retries) {
    results[i] = { issues: await audit(tasks[i]), where: where(tasks[i]) }
    flush()
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
