import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// Same geometry as icon.svg, full-bleed (iOS rounds the corners itself) and
// inset by the viewBox so the mark clears that mask.
export default function Icon() {
  return new ImageResponse(
    <div style={{ display: "flex", background: "#0a0a0a" }}>
      <svg width="180" height="180" viewBox="-3 -3 38 38" fill="#fafafa">
        <rect x="4" y="4" width="10" height="10" rx="2.75" />
        <rect x="18" y="4" width="10" height="10" rx="2.75" />
        <rect x="4" y="18" width="10" height="10" rx="2.75" />
        <rect
          x="19"
          y="19"
          width="8"
          height="8"
          rx="2.2"
          transform="rotate(45 23 23)"
        />
      </svg>
    </div>,
    size
  )
}
