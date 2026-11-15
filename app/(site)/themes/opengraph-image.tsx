import { ogImage } from "@/lib/og"

export { contentType, size } from "@/lib/og"
export const alt = "renanleonel/ui themes"

export default function Image() {
  return ogImage({
    kicker: ["tweakcn compatible"],
    title: "Themes",
    description:
      "Edit colors, radius and fonts with a live preview and contrast check, then export JSON or CSS.",
  })
}
