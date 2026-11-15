import { getBlocks } from "@/lib/docs"
import { ogImage } from "@/lib/og"

export { contentType, size } from "@/lib/og"
export const alt = "renanleonel/ui blocks"

export default function Image() {
  const blocks = new Set(getBlocks().map((b) => b.registry))
  return ogImage({
    kicker: ["Router-agnostic", "State in the URL"],
    title: `${blocks.size} blocks`,
    description:
      "Full screens built only from renanleonel/ui components. Install one and wire your data in.",
  })
}
