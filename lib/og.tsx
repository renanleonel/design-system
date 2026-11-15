import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Satori resolves neither CSS variables nor oklch, so these are the dark theme
// of app/globals.css as hex.
const C = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  muted: "#a1a1a1",
  card: "#141414",
  border: "rgba(255,255,255,0.09)",
  strong: "#e5e5e5",
  mid: "#737373",
  low: "#333333",
}

// Satori reads TTF/OTF only, so next/font's WOFF2 files can't be reused.
const font = (file: string) =>
  readFile(join(process.cwd(), "assets/fonts", file))
const fonts = Promise.all([
  font("Geist-Medium.ttf"),
  font("Geist-SemiBold.ttf"),
])

const TILE = 160
const PITCH = TILE + 16
// The wall is taller and wider than the canvas so it bleeds off three edges.
const WALL = { left: 712, top: -29 }
const SLOT = { col: 1, row: 2 }

function Bar({ w, color = C.low }: { w: number; color?: string }) {
  return (
    <div style={{ width: w, height: 8, borderRadius: 4, background: color }} />
  )
}

const GLYPHS = [
  <div
    key="button"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 100,
      height: 40,
      borderRadius: 12,
      background: C.strong,
    }}
  >
    <Bar w={44} color={C.card} />
  </div>,
  <div
    key="input"
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      width: 112,
      height: 40,
      padding: "0 12px",
      borderRadius: 12,
      border: `2px solid ${C.low}`,
    }}
  >
    <Bar w={40} color={C.mid} />
    <div style={{ width: 2, height: 18, background: C.strong }} />
  </div>,
  <div
    key="switch"
    style={{
      display: "flex",
      justifyContent: "flex-end",
      width: 72,
      height: 40,
      padding: 4,
      borderRadius: 20,
      background: C.strong,
    }}
  >
    <div
      style={{ width: 32, height: 32, borderRadius: 16, background: C.card }}
    />
  </div>,
  <div
    key="checklist"
    style={{ display: "flex", flexDirection: "column", gap: 12 }}
  >
    {[64, 44, 56].map((w, i) => (
      <div key={w} style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            background: i < 2 ? C.strong : "transparent",
            border: `2px solid ${i < 2 ? C.strong : C.low}`,
          }}
        />
        <Bar w={w} color={i < 2 ? C.mid : C.low} />
      </div>
    ))}
  </div>,
  <div
    key="tabs"
    style={{
      display: "flex",
      width: 120,
      height: 40,
      padding: 4,
      borderRadius: 12,
      background: "#262626",
    }}
  >
    {[C.strong, C.mid, C.mid].map((color, i) => (
      <div
        key={i}
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: i === 0 ? "#404040" : "transparent",
        }}
      >
        <Bar w={18} color={color} />
      </div>
    ))}
  </div>,
  <div
    key="calendar"
    style={{ display: "flex", flexWrap: "wrap", gap: 10, width: 78 }}
  >
    {Array.from({ length: 16 }, (_, i) => (
      <div
        key={i}
        style={{
          width: 12,
          height: 12,
          borderRadius: i === 6 ? 4 : 6,
          background: i === 6 ? C.strong : C.low,
        }}
      />
    ))}
  </div>,
  <div key="avatars" style={{ display: "flex" }}>
    {[C.mid, C.muted, C.strong].map((color, i) => (
      <div
        key={color}
        style={{
          width: 48,
          height: 48,
          marginLeft: i ? -14 : 0,
          borderRadius: 24,
          background: color,
          border: `4px solid ${C.card}`,
        }}
      />
    ))}
  </div>,
  null,
  <svg key="spinner" width="56" height="56" viewBox="0 0 56 56">
    <circle cx="28" cy="28" r="22" fill="none" stroke={C.low} strokeWidth="8" />
    <circle
      cx="28"
      cy="28"
      r="22"
      fill="none"
      stroke={C.strong}
      strokeWidth="8"
      strokeLinecap="round"
      strokeDasharray="48 138"
      transform="rotate(-90 28 28)"
    />
  </svg>,
  <div
    key="slider"
    style={{
      display: "flex",
      alignItems: "center",
      width: 112,
      height: 24,
      position: "relative",
    }}
  >
    <Bar w={112} />
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 68,
        height: 8,
        borderRadius: 4,
        background: C.strong,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 56,
        width: 24,
        height: 24,
        borderRadius: 12,
        background: C.foreground,
        border: `4px solid ${C.card}`,
      }}
    />
  </div>,
  <div
    key="badge"
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: 34,
      padding: "0 14px",
      borderRadius: 17,
      border: `2px solid ${C.low}`,
    }}
  >
    <div
      style={{ width: 10, height: 10, borderRadius: 5, background: C.strong }}
    />
    <Bar w={44} color={C.mid} />
  </div>,
  <div key="chart" style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
    {[28, 46, 36, 64, 52].map((h) => (
      <div
        key={h}
        style={{
          width: 14,
          height: h,
          borderRadius: 4,
          background: h === 64 ? C.strong : C.low,
        }}
      />
    ))}
  </div>,
]

/** The logo at poster scale: a wall of components with one piece being placed. */
function Wall() {
  const slotX = SLOT.col * PITCH + TILE / 2
  const slotY = SLOT.row * PITCH + TILE / 2
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        left: WALL.left,
        top: WALL.top,
        width: PITCH * 3,
        height: PITCH * 4,
      }}
    >
      {GLYPHS.map((glyph, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            left: (i % 3) * PITCH,
            top: Math.floor(i / 3) * PITCH,
            width: TILE,
            height: TILE,
            borderRadius: 44,
            ...(glyph
              ? { background: C.card, border: `1px solid ${C.border}` }
              : { border: `2px dashed ${C.low}` }),
          }}
        >
          {glyph}
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: slotX - 300,
          top: slotY - 300,
          width: 600,
          height: 600,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.1), rgba(255,255,255,0) 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: slotX - 64,
          top: slotY - 64,
          width: 128,
          height: 128,
          borderRadius: 36,
          background: C.foreground,
          transform: "rotate(45deg)",
          boxShadow: "0 0 80px rgba(255,255,255,0.18)",
        }}
      />
    </div>
  )
}

/** `LogoMark` from components/docs as static SVG; the last block is at rest. */
function Mark({ size: px }: { size: number }) {
  return (
    <svg width={px} height={px} viewBox="0 0 24 24" fill={C.foreground}>
      <rect x="2" y="2" width="9" height="9" rx="2.5" />
      <rect x="13" y="2" width="9" height="9" rx="2.5" />
      <rect x="2" y="13" width="9" height="9" rx="2.5" />
      <rect
        x="13.9"
        y="13.9"
        width="7.2"
        height="7.2"
        rx="2"
        transform="rotate(45 17.5 17.5)"
      />
    </svg>
  )
}

export async function ogImage({
  kicker,
  title,
  description,
}: {
  kicker: string[]
  title: string
  description?: string
}) {
  const [medium, semibold] = await fonts
  const titleSize = title.length > 22 ? 60 : 76
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: C.background,
        color: C.foreground,
        fontFamily: "Geist",
        fontWeight: 500,
      }}
    >
      <Wall />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 664,
          padding: "64px 0 68px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: -0.6,
          }}
        >
          <Mark size={38} />
          renanleonel/ui
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Separators are drawn: Satori sets "·" off-center between its spaces. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 24,
              color: C.muted,
            }}
          >
            {kicker.flatMap((part, i) => [
              i > 0 && (
                <div
                  key={`dot-${part}`}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    background: C.mid,
                  }}
                />
              ),
              <div key={part}>{part}</div>,
            ])}
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: titleSize,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: titleSize * -0.04,
              textWrap: "balance",
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                marginTop: 24,
                fontSize: 27,
                lineHeight: 1.4,
                color: C.muted,
              }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Geist", data: medium, weight: 500, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
      ],
    }
  )
}
