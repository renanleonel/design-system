import { getBlocks, getComponents } from "@/lib/docs"
import { ogImage } from "@/lib/og"

export { contentType, size } from "@/lib/og"
export const alt =
  "renanleonel/ui: components and blocks for shipping SaaS fast"

export default function Image() {
  const blocks = new Set(getBlocks().map((b) => b.registry))
  return ogImage({
    kicker: [
      `${getComponents().length} components`,
      `${blocks.size} blocks`,
      "Base UI",
    ],
    title: "Components and blocks for shipping SaaS fast.",
  })
}
