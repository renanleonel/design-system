import { notFound } from "next/navigation"

import { getComponents } from "@/lib/docs"
import { ogImage } from "@/lib/og"

export { contentType, size } from "@/lib/og"
export const alt = "A renanleonel/ui component"

// Rendered on the first request and cached from then on: prerendering one
// image per component tripled the build.
export function generateStaticParams() {
  return []
}

export default async function Image({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const entry = getComponents().find((c) => c.name === name)
  if (!entry) notFound()
  return ogImage({
    kicker: ["Components", entry.group],
    title: entry.title,
    // Geist has no ⌘ glyph and Satori's font fallback fails at build time.
    description: entry.description.replaceAll("⌘", "Cmd+"),
  })
}
