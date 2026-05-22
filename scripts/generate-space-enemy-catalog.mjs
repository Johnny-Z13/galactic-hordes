import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const cell = 192
const columns = 4
const rows = 6
const width = cell * columns
const height = cell * rows
const pixels = new Uint8ClampedArray(width * height * 4)

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const rgba = (hex, alpha = 255) => {
  const n = Number.parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha]
}

const blend = (x, y, color, alphaScale = 1) => {
  const ix = Math.round(x)
  const iy = Math.round(y)
  if (ix < 0 || ix >= width || iy < 0 || iy >= height) return
  const idx = (iy * width + ix) * 4
  const alpha = clamp((color[3] / 255) * alphaScale, 0, 1)
  const inv = 1 - alpha
  pixels[idx] = pixels[idx] * inv + color[0] * alpha
  pixels[idx + 1] = pixels[idx + 1] * inv + color[1] * alpha
  pixels[idx + 2] = pixels[idx + 2] * inv + color[2] * alpha
  pixels[idx + 3] = clamp(pixels[idx + 3] + color[3] * alphaScale, 0, 255)
}

const dot = (x, y, radius, color, alphaScale = 1) => {
  const r = Math.ceil(radius)
  for (let yy = -r; yy <= r; yy += 1) {
    for (let xx = -r; xx <= r; xx += 1) {
      const d = Math.hypot(xx, yy)
      if (d <= radius) blend(x + xx, y + yy, color, alphaScale * (1 - d / (radius + 0.1)))
    }
  }
}

const line = (x1, y1, x2, y2, color, thickness = 1.4, glow = true) => {
  const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 1.7))
  if (glow) {
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps
      const x = x1 + (x2 - x1) * t
      const y = y1 + (y2 - y1) * t
      dot(x, y, thickness + 5, color, 0.08)
      dot(x, y, thickness + 2, color, 0.14)
    }
  }
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    dot(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, thickness, color, 0.92)
  }
}

const poly = (points, color, thickness = 1.4) => {
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    line(a[0], a[1], b[0], b[1], color, thickness)
  }
}

const arc = (cx, cy, radius, start, end, color, thickness = 1.4) => {
  const steps = Math.max(8, Math.ceil(Math.abs(end - start) * radius * 0.9))
  let px = cx + Math.cos(start) * radius
  let py = cy + Math.sin(start) * radius
  for (let i = 1; i <= steps; i += 1) {
    const a = start + (end - start) * (i / steps)
    const x = cx + Math.cos(a) * radius
    const y = cy + Math.sin(a) * radius
    line(px, py, x, y, color, thickness)
    px = x
    py = y
  }
}

const local = (row, col, x, y) => [col * cell + x, row * cell + y]

const drawRazor = (row, col) => {
  const cyan = rgba('#57fff3')
  const blue = rgba('#70a8ff')
  const magenta = rgba('#ff61d8')
  const yellow = rgba('#fff27a')
  const pulse = Math.sin(col * 1.7) * 5
  const [cx, cy] = local(row, col, 96, 96)
  poly([[cx + 54, cy], [cx - 46, cy - 23], [cx - 22, cy], [cx - 46, cy + 23]], cyan, 1.7)
  line(cx - 8, cy, cx + 64 + pulse, cy, yellow, 1.1)
  line(cx - 20, cy - 10, cx + 30, cy, blue, 1.2)
  line(cx - 20, cy + 10, cx + 30, cy, blue, 1.2)
  poly([[cx - 22, cy - 10], [cx - 70, cy - 48 - pulse], [cx - 44, cy - 8]], cyan, 1.3)
  poly([[cx - 22, cy + 10], [cx - 70, cy + 48 + pulse], [cx - 44, cy + 8]], cyan, 1.3)
  line(cx - 48, cy - 18, cx - 88 - pulse * 2, cy - 31, magenta, 1.1)
  line(cx - 48, cy + 18, cx - 88 - pulse * 2, cy + 31, magenta, 1.1)
  dot(cx - 4, cy, 7 + col % 2, magenta, 0.85)
  dot(cx + 38, cy, 3, yellow, 0.9)
}

const drawSkimmer = (row, col) => {
  const yellow = rgba('#ffe66d')
  const violet = rgba('#b990ff')
  const cyan = rgba('#57fff3')
  const green = rgba('#8fff7d')
  const sway = Math.sin(col * 1.4) * 7
  const [cx, cy] = local(row, col, 96, 96)
  poly([[cx + 46, cy - 24], [cx - 8, cy - 54 + sway], [cx - 63, cy - 20], [cx - 43, cy + 26], [cx + 34, cy + 32]], yellow, 1.8)
  line(cx - 52, cy - 12, cx + 32, cy - 22, violet, 1.1)
  line(cx - 48, cy + 16, cx + 31, cy + 18, violet, 1.1)
  arc(cx - 7, cy + 9, 45, 0.15, Math.PI - 0.28, cyan, 1.2)
  arc(cx - 7, cy + 10, 33, 0.05, Math.PI - 0.18, cyan, 1.1)
  dot(cx - 32, cy - 8, 8, yellow, 0.9)
  dot(cx + 12, cy - 2, 7, yellow, 0.9)
  dot(cx - 12 + sway * 0.4, cy + 20, 4, green, 0.8)
  line(cx - 58, cy + 26, cx - 82, cy + 47 + sway, violet, 1)
  line(cx - 35, cy + 31, cx - 41, cy + 62 - sway, violet, 1)
  line(cx - 12, cy + 31, cx + 4, cy + 58 + sway, violet, 1)
}

const drawBulwark = (row, col) => {
  const magenta = rgba('#f46cff')
  const cyan = rgba('#57fff3')
  const yellow = rgba('#fff27a')
  const violet = rgba('#b990ff')
  const phase = col * 0.42
  const [cx, cy] = local(row, col, 96, 96)
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2 + phase
    const r1 = 46
    const r2 = i % 2 ? 63 : 56
    line(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, magenta, 1.2)
  }
  arc(cx, cy, 55, 0, Math.PI * 2, magenta, 1.7)
  arc(cx, cy, 37, 0.2 + phase, Math.PI * 2 + phase, cyan, 1.3)
  poly([[cx, cy - 30], [cx + 24, cy], [cx, cy + 30], [cx - 24, cy]], yellow, 1.2)
  line(cx - 42, cy, cx + 42, cy, violet, 1)
  line(cx, cy - 42, cx, cy + 42, violet, 1)
  dot(cx, cy, 10 + (col % 2) * 3, yellow, 0.7)
  dot(cx, cy, 4, rgba('#ffffff'), 0.95)
}

const drawSiphon = (row, col) => {
  const green = rgba('#8fff7d')
  const cyan = rgba('#57fff3')
  const blue = rgba('#70a8ff')
  const violet = rgba('#b990ff')
  const white = rgba('#f6fffe')
  const pulse = Math.sin(col * 1.6) * 7
  const [cx, cy] = local(row, col, 96, 96)
  for (let i = 0; i < 5; i += 1) {
    const a = -1.25 + i * 0.62 + pulse * 0.012
    line(cx - 24, cy, cx - 78 + Math.cos(a) * 26, cy + Math.sin(a) * 62, i % 2 ? blue : violet, 1.15)
    line(cx - 42, cy + Math.sin(a) * 10, cx - 92 + Math.cos(a) * 18, cy + Math.sin(a) * 45, green, 0.85)
  }
  arc(cx, cy, 55 + pulse * 0.4, -0.62, Math.PI * 2 - 0.9, green, 1.7)
  arc(cx + 3, cy, 40 - pulse * 0.25, 0.15, Math.PI * 2 + 0.8, cyan, 1.35)
  arc(cx + 5, cy, 24 + pulse * 0.2, -1.4, Math.PI * 1.7, blue, 1)
  poly([[cx + 70, cy], [cx + 32, cy - 30], [cx - 12, cy - 24], [cx - 48, cy - 9], [cx - 62, cy], [cx - 48, cy + 9], [cx - 12, cy + 24], [cx + 32, cy + 30]], green, 1.55)
  poly([[cx + 54, cy - 18], [cx + 86 + pulse, cy - 36], [cx + 68, cy - 2]], cyan, 1.05)
  poly([[cx + 54, cy + 18], [cx + 86 + pulse, cy + 36], [cx + 68, cy + 2]], cyan, 1.05)
  line(cx - 58, cy - 18, cx + 46, cy + 20, violet, 0.9)
  line(cx - 58, cy + 18, cx + 46, cy - 20, violet, 0.9)
  dot(cx + 2, cy, 18, green, 0.58)
  dot(cx + 9, cy, 9, cyan, 0.76)
  dot(cx + 15, cy, 4, white, 0.95)
}

const drawDreadnought = (row, col) => {
  const red = rgba('#ff5d73')
  const orange = rgba('#ff9d5c')
  const yellow = rgba('#fff27a')
  const violet = rgba('#b990ff')
  const cyan = rgba('#57fff3')
  const recoil = Math.sin(col * 1.35) * 6
  const [cx, cy] = local(row, col, 96, 96)
  poly([[cx + 76, cy], [cx + 42, cy - 35], [cx - 28, cy - 58], [cx - 73, cy - 36], [cx - 84, cy], [cx - 73, cy + 36], [cx - 28, cy + 58], [cx + 42, cy + 35]], red, 2.1)
  poly([[cx + 47, cy - 17], [cx + 91 + recoil, cy - 10], [cx + 92 + recoil, cy + 10], [cx + 47, cy + 17]], orange, 1.75)
  poly([[cx + 13, cy - 44], [cx + 43, cy - 70], [cx + 26, cy - 26]], red, 1.25)
  poly([[cx + 13, cy + 44], [cx + 43, cy + 70], [cx + 26, cy + 26]], red, 1.25)
  for (let i = 0; i < 4; i += 1) {
    const y = cy - 35 + i * 23
    line(cx - 52, y, cx + 30, y * 0.12 + cy * 0.88, i % 2 ? yellow : orange, 0.95)
  }
  line(cx - 66, cy - 34, cx - 101, cy - 61 - recoil, violet, 1.35)
  line(cx - 66, cy + 34, cx - 101, cy + 61 + recoil, violet, 1.35)
  line(cx - 83, cy, cx - 116, cy, red, 1.6)
  arc(cx - 17, cy, 54, 0.14, Math.PI * 2 - 0.14, red, 1.3)
  arc(cx + 11, cy, 36, -1.72, 1.72, yellow, 1.25)
  arc(cx - 22, cy, 22, 0.4, Math.PI * 2 + 0.4, cyan, 0.85)
  dot(cx + 51, cy, 10 + col % 2, yellow, 0.9)
  dot(cx - 14, cy, 7, orange, 0.85)
}

const drawCathedral = (row, col) => {
  const white = rgba('#d7fff7')
  const cyan = rgba('#57fff3')
  const violet = rgba('#b990ff')
  const yellow = rgba('#fff27a')
  const phase = col * 0.55
  const [cx, cy] = local(row, col, 96, 96)
  for (let i = 0; i < 12; i += 1) {
    const a = phase + (i / 12) * Math.PI * 2
    line(cx + Math.cos(a) * 28, cy + Math.sin(a) * 28, cx + Math.cos(a) * (i % 3 ? 72 : 84), cy + Math.sin(a) * (i % 3 ? 72 : 84), i % 2 ? white : cyan, i % 2 ? 0.95 : 1.25)
  }
  poly([[cx, cy - 84], [cx + 42, cy - 38], [cx + 35, cy + 45], [cx, cy + 82], [cx - 35, cy + 45], [cx - 42, cy - 38]], white, 1.9)
  poly([[cx, cy - 55], [cx + 28, cy], [cx, cy + 55], [cx - 28, cy]], cyan, 1.35)
  poly([[cx - 47, cy - 26], [cx - 71, cy - 55], [cx - 55, cy + 8]], violet, 1.05)
  poly([[cx + 47, cy - 26], [cx + 71, cy - 55], [cx + 55, cy + 8]], violet, 1.05)
  arc(cx, cy, 68, phase, Math.PI * 2 + phase, violet, 1.25)
  arc(cx, cy, 44, -phase * 1.2, Math.PI * 2 - phase * 1.2, cyan, 1)
  arc(cx, cy, 25, -phase, Math.PI * 2 - phase, yellow, 1.15)
  line(cx - 66, cy - 15, cx + 66, cy + 15, violet, 1)
  line(cx - 66, cy + 15, cx + 66, cy - 15, violet, 1)
  line(cx, cy - 78, cx, cy + 78, white, 0.95)
  dot(cx, cy, 14 + (col % 2) * 2, white, 0.65)
  dot(cx, cy, 5, yellow, 0.95)
}

for (let col = 0; col < columns; col += 1) {
  drawRazor(0, col)
  drawSkimmer(1, col)
  drawBulwark(2, col)
  drawSiphon(3, col)
  drawDreadnought(4, col)
  drawCathedral(5, col)
}

const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n += 1) {
  let c = n
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[n] = c >>> 0
}

const crc32 = (buffers) => {
  let c = 0xffffffff
  for (const buffer of buffers) {
    for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

const chunk = (type, data) => {
  const name = Buffer.from(type)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32([name, data]))
  return Buffer.concat([length, name, data, crc])
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(width, 0)
ihdr.writeUInt32BE(height, 4)
ihdr[8] = 8
ihdr[9] = 6
ihdr[10] = 0
ihdr[11] = 0
ihdr[12] = 0

const raw = Buffer.alloc((width * 4 + 1) * height)
for (let y = 0; y < height; y += 1) {
  const rowStart = y * (width * 4 + 1)
  raw[rowStart] = 0
  for (let x = 0; x < width * 4; x += 1) raw[rowStart + 1 + x] = Math.round(pixels[y * width * 4 + x])
}

writeFileSync(
  'src/assets/space-enemy-catalog-alpha.png',
  Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
)
