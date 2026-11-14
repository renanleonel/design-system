// Size budget for every registry item in public/r: gzip bytes of the shipped
// source (file contents plus css/cssVars) and the count of npm dependencies,
// checked against registry/size-budget.json.
//   node scripts/check-size.mjs           fail when an item is over budget
//   node scripts/check-size.mjs --write   add budgets for items without one
//                                         (current size + 15%); never lowers or
//                                         raises an existing budget
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { gzipSync } from "node:zlib"

const DIR = "public/r"
const BUDGET_PATH = "registry/size-budget.json"
const HEADROOM = 1.15
const write = process.argv.includes("--write")

const budgets = existsSync(BUDGET_PATH)
  ? JSON.parse(readFileSync(BUDGET_PATH, "utf8"))
  : {}

const measured = {}
for (const f of readdirSync(DIR).filter((f) => f.endsWith(".json")).sort()) {
  if (f === "registry.json") continue
  const item = JSON.parse(readFileSync(`${DIR}/${f}`, "utf8"))
  const source = [
    ...(item.files ?? []).map((x) => x.content ?? ""),
    item.css ? JSON.stringify(item.css) : "",
    item.cssVars ? JSON.stringify(item.cssVars) : "",
  ].join("\n")
  measured[item.name] = {
    gzip: gzipSync(source, { level: 9 }).length,
    deps: (item.dependencies ?? []).length,
  }
}

const failures = []
const unbudgeted = []
for (const [name, m] of Object.entries(measured)) {
  const b = budgets[name]
  if (!b) {
    unbudgeted.push(name)
    continue
  }
  if (m.gzip > b.gzip)
    failures.push(`${name}: ${m.gzip} B gzip exceeds budget ${b.gzip} B`)
  if (m.deps > b.deps)
    failures.push(`${name}: ${m.deps} npm deps exceeds budget ${b.deps}`)
}
const stale = Object.keys(budgets).filter((n) => !(n in measured))

if (write) {
  for (const name of unbudgeted) {
    const m = measured[name]
    budgets[name] = {
      gzip: Math.ceil((m.gzip * HEADROOM) / 10) * 10,
      deps: Math.ceil(m.deps * HEADROOM),
    }
  }
  for (const name of stale) delete budgets[name]
  const ordered = Object.fromEntries(
    Object.keys(budgets).sort().map((k) => [k, budgets[k]])
  )
  writeFileSync(BUDGET_PATH, JSON.stringify(ordered, null, 2) + "\n")
  console.log(
    `${BUDGET_PATH}: added ${unbudgeted.length}, removed ${stale.length}`
  )
  process.exit(0)
}

for (const name of unbudgeted)
  console.warn(
    `warn: ${name} has no size budget (${measured[name].gzip} B gzip, ${measured[name].deps} deps); run 'pnpm check:size --write'`
  )
for (const name of stale)
  console.warn(`warn: size budget for "${name}" matches no registry item`)

if (failures.length) {
  for (const f of failures) console.error(`error: ${f}`)
  console.error(
    "Shrink the item, or raise its entry in registry/size-budget.json on purpose."
  )
  process.exit(1)
}
console.log(
  `size budget ok: ${Object.keys(measured).length - unbudgeted.length} items within budget, ${unbudgeted.length} without one`
)
