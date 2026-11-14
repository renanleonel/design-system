import { getBlocks, highlight, readSource, registryItem } from "@/lib/docs"

// A block's highlighted source, prerendered at build time. /blocks fetches it
// when a Code tab opens, so the index page doesn't carry every file up front.
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return [...new Set(getBlocks().map((b) => b.registry))].map((registry) => ({
    registry,
  }))
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/block-source/[registry]">
) {
  const { registry } = await params
  const files = await Promise.all(
    (registryItem(registry)?.files ?? []).map(async (f) => {
      const code = readSource(f.path)
      return { path: f.path, code, html: await highlight(code) }
    })
  )
  return Response.json({ files })
}
