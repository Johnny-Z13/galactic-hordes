import type { Bullet, Vec } from '../main-types'
import { norm, TAU } from '../math-utils'

export interface BulletSignatureView {
  pulseWake: boolean
  prismFins: boolean
}

export interface BulletsRenderView {
  ctx: CanvasRenderingContext2D
  bullets: Bullet[]
  width: number
  height: number
  glow: boolean
  scale: number
  signature: BulletSignatureView
  worldToScreen: (x: number, y: number) => Vec
}

export interface SimpleBulletsRenderView {
  ctx: CanvasRenderingContext2D
  bullets: Bullet[]
  width: number
  height: number
  scale: number
  worldToScreen: (x: number, y: number) => Vec
}

export function renderBullets(view: BulletsRenderView) {
  const { ctx, bullets, width, height, glow, scale, signature, worldToScreen } = view
  for (const bullet of bullets) {
    const point = worldToScreen(bullet.x, bullet.y)
    if (point.x < -80 || point.x > width + 80 || point.y < -80 || point.y > height + 80) continue
    ctx.save()
    ctx.strokeStyle = bullet.color
    ctx.shadowColor = bullet.color
    ctx.shadowBlur = glow ? bullet.rail ? 18 : bullet.option ? 16 : 10 : 0
    ctx.lineWidth = bullet.rail ? 3 : bullet.option ? 2.4 : 2
    ctx.beginPath()
    if (bullet.mine) {
      const radius = bullet.radius * scale
      ctx.arc(point.x, point.y, radius, 0, TAU)
      ctx.moveTo(point.x - radius, point.y)
      ctx.lineTo(point.x + radius, point.y)
    } else {
      const tail = norm(bullet.vx, bullet.vy)
      if (signature.pulseWake && !bullet.hostile) {
        ctx.globalAlpha = bullet.rail ? 0.35 : 0.28
        ctx.beginPath()
        ctx.arc(point.x - tail.x * 5 * scale, point.y - tail.y * 5 * scale, (bullet.radius + 5) * scale, 0, TAU)
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.beginPath()
      }
      if (signature.prismFins && !bullet.rail && !bullet.hostile) {
        const side = { x: -tail.y, y: tail.x }
        ctx.globalAlpha = 0.44
        ctx.moveTo(point.x - tail.x * 8 * scale + side.x * 5 * scale, point.y - tail.y * 8 * scale + side.y * 5 * scale)
        ctx.lineTo(point.x + tail.x * 3 * scale, point.y + tail.y * 3 * scale)
        ctx.moveTo(point.x - tail.x * 8 * scale - side.x * 5 * scale, point.y - tail.y * 8 * scale - side.y * 5 * scale)
        ctx.lineTo(point.x + tail.x * 3 * scale, point.y + tail.y * 3 * scale)
        ctx.globalAlpha = 1
      }
      if (bullet.option && !bullet.hostile) {
        ctx.globalAlpha = 0.62
        ctx.arc(point.x - tail.x * 3 * scale, point.y - tail.y * 3 * scale, (bullet.radius + 3.5) * scale, 0, TAU)
        ctx.moveTo(point.x - tail.x * 8 * scale - tail.y * 4 * scale, point.y - tail.y * 8 * scale + tail.x * 4 * scale)
        ctx.lineTo(point.x + tail.x * 4 * scale, point.y + tail.y * 4 * scale)
        ctx.moveTo(point.x - tail.x * 8 * scale + tail.y * 4 * scale, point.y - tail.y * 8 * scale - tail.x * 4 * scale)
        ctx.lineTo(point.x + tail.x * 4 * scale, point.y + tail.y * 4 * scale)
        ctx.globalAlpha = 1
      }
      ctx.moveTo(point.x - tail.x * (bullet.rail ? 26 : 12) * scale, point.y - tail.y * (bullet.rail ? 26 : 12) * scale)
      ctx.lineTo(point.x + tail.x * (bullet.rail ? 16 : 7) * scale, point.y + tail.y * (bullet.rail ? 16 : 7) * scale)
    }
    ctx.stroke()
    ctx.restore()
  }
}

export function renderBulletsSimple(view: SimpleBulletsRenderView) {
  const { ctx, bullets, width, height, scale, worldToScreen } = view
  ctx.save()
  ctx.shadowBlur = 0
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(215,255,247,0.82)'
  ctx.beginPath()
  for (const bullet of bullets) {
    const { x, y } = worldToScreen(bullet.x, bullet.y)
    if (x < -80 || x > width + 80 || y < -80 || y > height + 80) continue
    const mag = Math.hypot(bullet.vx, bullet.vy) || 1
    const tx = bullet.vx / mag
    const ty = bullet.vy / mag
    const rear = (bullet.rail ? 24 : 11) * scale
    const nose = (bullet.rail ? 15 : 7) * scale
    ctx.moveTo(x - tx * rear, y - ty * rear)
    ctx.lineTo(x + tx * nose, y + ty * nose)
  }
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255,242,122,0.86)'
  ctx.lineWidth = 3
  ctx.beginPath()
  for (const bullet of bullets) {
    if (!bullet.rail) continue
    const { x, y } = worldToScreen(bullet.x, bullet.y)
    if (x < -80 || x > width + 80 || y < -80 || y > height + 80) continue
    const mag = Math.hypot(bullet.vx, bullet.vy) || 1
    const tx = bullet.vx / mag
    const ty = bullet.vy / mag
    ctx.moveTo(x - tx * 28 * scale, y - ty * 28 * scale)
    ctx.lineTo(x + tx * 18 * scale, y + ty * 18 * scale)
  }
  ctx.stroke()
  ctx.restore()
}
