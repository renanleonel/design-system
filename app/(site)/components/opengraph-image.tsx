import { getComponents } from "@/lib/docs"
import { ogImage } from "@/lib/og"

export { contentType, size } from "@/lib/og"
export const alt = "renanleonel/ui components"

export default function Image() {
  return ogImage({
    kicker: ["Base UI", "Tailwind v4", "shadcn registry"],
    title: `${getComponents().length} components`,
    description:
      "Every state covered, keyboard hotkeys and touch-sized controls.",
  })
}
