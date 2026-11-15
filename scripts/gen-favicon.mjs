// Packs app/icon.svg into app/favicon.ico. Run `pnpm favicon` after editing
// the SVG and commit the result; app/apple-icon.tsx repeats the same geometry.
import { readFileSync, realpathSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"

// sharp is Next's dependency, not ours; pnpm only exposes it next to Next's
// real path, so resolve it from there instead of adding a second copy.
const require = createRequire(realpathSync("node_modules/next/package.json"))
const sharp = require("sharp")

const SIZES = [16, 32, 48]
const svg = readFileSync("app/icon.svg")
const pngs = await Promise.all(
  SIZES.map((size) =>
    // Rasterize at 8x, then downscale: librsvg alone blurs the 16px edges.
    sharp(svg, { density: (72 * size * 8) / 32 })
      .resize(size, size)
      .png()
      .toBuffer()
  )
)

// ICO: 6-byte header, one 16-byte directory entry per image, then the PNGs.
const header = Buffer.alloc(6)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(SIZES.length, 4)
let offset = header.length + 16 * SIZES.length
const entries = pngs.map((png, i) => {
  const entry = Buffer.alloc(16)
  entry.writeUInt8(SIZES[i], 0)
  entry.writeUInt8(SIZES[i], 1)
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(offset, 12)
  offset += png.length
  return entry
})

writeFileSync("app/favicon.ico", Buffer.concat([header, ...entries, ...pngs]))
console.log(`app/favicon.ico: ${SIZES.join(", ")}px`)
