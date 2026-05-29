import type { Vec } from '../main-types'
import { hash32, rngFrom, TAU } from '../math-utils'

export interface SpaceBackgroundStar {
  x: number
  y: number
}

export interface SpaceBackgroundSector {
  x: number
  y: number
}

export interface SpaceBackgroundRenderView {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  camera: Vec
  stars: SpaceBackgroundStar[]
  sector: SpaceBackgroundSector
  chunkSize: number
  spaceScale: number
  glow: boolean
  worldToScreen: (x: number, y: number) => Vec
}

const spaceFeatureColors = [
  [87, 255, 243],
  [143, 255, 125],
  [185, 144, 255],
  [255, 242, 122],
  [112, 168, 255],
  [255, 93, 115]
]

export function renderSpaceBackground(view: SpaceBackgroundRenderView) {
  const { ctx } = view
  ctx.save()
  renderNebulaBands(view)
  renderSectorLandmarks(view)
  ctx.strokeStyle = 'rgba(87,255,243,0.08)'
  ctx.lineWidth = 1
  const grid = 240
  const viewRight = view.camera.x + view.width / view.spaceScale
  const viewBottom = view.camera.y + view.height / view.spaceScale
  const startX = Math.floor(view.camera.x / grid) * grid
  const startY = Math.floor(view.camera.y / grid) * grid
  for (let x = startX; x < viewRight + grid; x += grid) {
    const sx = (x - view.camera.x) * view.spaceScale
    ctx.beginPath()
    ctx.moveTo(sx, 0)
    ctx.lineTo(sx, view.height)
    ctx.stroke()
  }
  for (let y = startY; y < viewBottom + grid; y += grid) {
    const sy = (y - view.camera.y) * view.spaceScale
    ctx.beginPath()
    ctx.moveTo(0, sy)
    ctx.lineTo(view.width, sy)
    ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(255,242,122,0.16)'
  ctx.fillStyle = 'rgba(255,242,122,0.42)'
  ctx.font = '11px Courier New'
  const chunkStartX = Math.floor(view.camera.x / view.chunkSize) * view.chunkSize
  const chunkStartY = Math.floor(view.camera.y / view.chunkSize) * view.chunkSize
  for (let x = chunkStartX; x < viewRight + view.chunkSize; x += view.chunkSize) {
    const sx = (x - view.camera.x) * view.spaceScale
    ctx.beginPath()
    ctx.moveTo(sx, 0)
    ctx.lineTo(sx, view.height)
    ctx.stroke()
  }
  for (let y = chunkStartY; y < viewBottom + view.chunkSize; y += view.chunkSize) {
    const sy = (y - view.camera.y) * view.spaceScale
    ctx.beginPath()
    ctx.moveTo(0, sy)
    ctx.lineTo(view.width, sy)
    ctx.stroke()
  }
  ctx.fillText(`SECTOR ${view.sector.x}:${view.sector.y}`, 14, view.height - 18)
  for (const star of view.stars) {
    const p = view.worldToScreen(star.x, star.y)
    if (p.x < -10 || p.x > view.width + 10 || p.y < -10 || p.y > view.height + 10) continue
    const h = hash32(Math.floor(star.x), Math.floor(star.y), 23)
    const alpha = 0.34 + (h % 50) / 100
    const size = h % 17 === 0 ? 2.2 : h % 7 === 0 ? 1.7 : 1.15
    const palette = h % 11 === 0 ? '255,242,122' : h % 5 === 0 ? '185,144,255' : h % 3 === 0 ? '143,255,125' : '215,255,247'
    ctx.fillStyle = `rgba(${palette},${alpha})`
    ctx.fillRect(p.x, p.y, size, size)
  }
  ctx.restore()
}

function renderSectorLandmarks(view: SpaceBackgroundRenderView) {
  const { ctx } = view
  const landmarkGrid = 820
  const viewRight = view.camera.x + view.width / view.spaceScale
  const viewBottom = view.camera.y + view.height / view.spaceScale
  const minX = Math.floor((view.camera.x - landmarkGrid) / landmarkGrid)
  const maxX = Math.floor((viewRight + landmarkGrid) / landmarkGrid)
  const minY = Math.floor((view.camera.y - landmarkGrid) / landmarkGrid)
  const maxY = Math.floor((viewBottom + landmarkGrid) / landmarkGrid)
  ctx.save()
  ctx.globalCompositeOperation = view.glow ? 'screen' : 'source-over'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let gx = minX; gx <= maxX; gx += 1) {
    for (let gy = minY; gy <= maxY; gy += 1) {
      const rng = rngFrom(hash32(gx, gy, 177))
      if (rng() < 0.16) continue
      const color = spaceFeatureColors[Math.floor(rng() * spaceFeatureColors.length)]
      const accent = spaceFeatureColors[Math.floor(rng() * spaceFeatureColors.length)]
      const alpha = view.glow ? 0.22 : 0.13
      const landmarkCount = 1 + Math.floor(rng() * 2)
      for (let i = 0; i < landmarkCount; i += 1) {
        const worldX = gx * landmarkGrid + rng() * landmarkGrid
        const worldY = gy * landmarkGrid + rng() * landmarkGrid
        const p = view.worldToScreen(worldX, worldY)
        const kind = Math.floor(rng() * 4)
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(rng() * TAU)
        ctx.shadowColor = `rgba(${color[0]},${color[1]},${color[2]},0.34)`
        ctx.shadowBlur = view.glow ? 12 : 0
        if (kind === 0) {
          const radius = 62 + rng() * 110
          ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha * 0.72})`
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.ellipse(0, 0, radius * (1.3 + rng() * 0.7), radius * (0.18 + rng() * 0.18), 0, 0, TAU)
          ctx.stroke()
          ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${alpha * 0.42})`
          ctx.beginPath()
          ctx.arc(0, 0, radius * 0.32, rng() * TAU, rng() * TAU + TAU * (0.34 + rng() * 0.3))
          ctx.stroke()
        } else if (kind === 1) {
          const length = 160 + rng() * 280
          ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha * 0.62})`
          ctx.lineWidth = 1 + rng() * 1.4
          ctx.beginPath()
          ctx.moveTo(-length / 2, 0)
          ctx.lineTo(length / 2, 0)
          ctx.stroke()
          ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${alpha * 0.36})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(-length * 0.36, 16)
          ctx.lineTo(length * 0.42, 16)
          ctx.stroke()
        } else if (kind === 2) {
          const radius = 54 + rng() * 88
          ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha * 0.54})`
          ctx.lineWidth = 1
          for (let j = 0; j < 3; j += 1) {
            ctx.beginPath()
            ctx.arc(0, 0, radius * (0.48 + j * 0.24), rng() * TAU, rng() * TAU + TAU * (0.18 + rng() * 0.24))
            ctx.stroke()
          }
        } else {
          const points = 7 + Math.floor(rng() * 8)
          ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha * 0.56})`
          for (let j = 0; j < points; j += 1) {
            const a = rng() * TAU
            const d = rng() * 90
            const size = 1 + rng() * 1.8
            ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d, size, size)
          }
        }
        ctx.restore()
      }
    }
  }
  ctx.restore()
}

function renderNebulaBands(view: SpaceBackgroundRenderView) {
  const { ctx } = view
  const viewRight = view.camera.x + view.width / view.spaceScale
  const viewBottom = view.camera.y + view.height / view.spaceScale
  const minX = Math.floor((view.camera.x - view.chunkSize) / view.chunkSize)
  const maxX = Math.floor((viewRight + view.chunkSize) / view.chunkSize)
  const minY = Math.floor((view.camera.y - view.chunkSize) / view.chunkSize)
  const maxY = Math.floor((viewBottom + view.chunkSize) / view.chunkSize)
  ctx.save()
  ctx.globalCompositeOperation = view.glow ? 'screen' : 'source-over'
  for (let cx = minX; cx <= maxX; cx += 1) {
    for (let cy = minY; cy <= maxY; cy += 1) {
      const rng = rngFrom(hash32(cx, cy, 91))
      if (rng() < 0.46) continue
      const color = spaceFeatureColors[Math.floor(rng() * spaceFeatureColors.length)]
      const accent = spaceFeatureColors[Math.floor(rng() * spaceFeatureColors.length)]
      const worldX = cx * view.chunkSize + rng() * view.chunkSize
      const worldY = cy * view.chunkSize + rng() * view.chunkSize
      const p = view.worldToScreen(worldX, worldY)
      const length = view.chunkSize * (0.8 + rng() * 0.75)
      const breadth = 150 + rng() * 260
      const angle = rng() * TAU
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(angle)
      ctx.filter = `blur(${view.glow ? 34 : 24}px)`
      const gradient = ctx.createLinearGradient(-length / 2, 0, length / 2, 0)
      const alpha = view.glow ? 0.075 : 0.045
      gradient.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},0)`)
      gradient.addColorStop(0.36, `rgba(${color[0]},${color[1]},${color[2]},${alpha})`)
      gradient.addColorStop(0.62, `rgba(${accent[0]},${accent[1]},${accent[2]},${alpha * 0.55})`)
      gradient.addColorStop(1, `rgba(${accent[0]},${accent[1]},${accent[2]},0)`)
      ctx.fillStyle = gradient
      ctx.fillRect(-length / 2, -breadth / 2, length, breadth)
      if (view.glow && rng() > 0.55) {
        ctx.globalAlpha = 0.24
        ctx.fillRect(-length * 0.35, -breadth * 0.06, length * 0.72, breadth * 0.12)
      }
      ctx.restore()
    }
  }
  ctx.restore()
}
