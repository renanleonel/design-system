// Smoke test for the design-system MCP endpoint: connects with a real MCP
// client over Streamable HTTP, lists the tools and calls each one (plus an
// unknown-item error). Start the app first (`pnpm build && pnpm start`).
//   pnpm mcp:smoke [url]      default http://localhost:3000/mcp (or MCP_URL)
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client"

const url = process.argv[2] ?? process.env.MCP_URL ?? "http://localhost:3000/mcp"
const client = new Client({ name: "mcp-smoke", version: "1.0.0" })
await client.connect(new StreamableHTTPClientTransport(new URL(url)))

let failures = 0
const expectTools = [
  "list_items",
  "search",
  "get_item",
  "get_examples",
  "get_rules",
  "get_tokens",
  "get_changelog",
]

const { tools } = await client.listTools()
console.log(`tools (${tools.length}): ${tools.map((t) => t.name).join(", ")}`)
for (const n of expectTools)
  if (!tools.some((t) => t.name === n)) {
    console.log(`FAIL missing tool ${n}`)
    failures++
  }

// [tool, args, substring the text must contain, expect isError]
const calls = [
  ["list_items", {}, "button"],
  ["list_items", { type: "block" }, "app-shell"],
  ["list_items", { type: "nope" }, "No items", true],
  ["search", { query: "date picker" }, "calendar"],
  ["search", { query: "zzzzqq" }, "No matches"],
  ["get_item", { name: "button" }, "npx shadcn add @renanleonel/button"],
  ["get_item", { name: "app-shell" }, "app-shell"],
  ["get_item", { name: "buton" }, "Closest: button", true],
  ["get_examples", { name: "button" }, "```tsx"],
  ["get_examples", { name: "nope" }, "No registry item", true],
  ["get_rules", {}, "rules/"],
  ["get_rules", { topic: "motion" }, "Motion"],
  ["get_rules", { topic: "zzz" }, "No topic", true],
  ["get_tokens", {}, "--ds-"],
  ["get_changelog", {}, "entries"],
  ["get_changelog", { name: "button" }, "20"],
  ["get_changelog", { name: "nope" }, "No registry item", true],
]

for (const [name, args, want, wantError = false] of calls) {
  const res = await client.callTool({ name, arguments: args })
  const out = res.content.map((c) => c.text ?? "").join("\n")
  const ok = out.includes(want) && Boolean(res.isError) === wantError
  if (!ok) failures++
  const preview = out.replace(/\s+/g, " ").slice(0, 90)
  console.log(
    `${ok ? "ok  " : "FAIL"} ${name}(${JSON.stringify(args)}) ${out.length}ch${res.isError ? " [error]" : ""} ${preview}`
  )
}

await client.close()
if (failures) {
  console.error(`${failures} failure(s)`)
  process.exit(1)
}
console.log("all good")
