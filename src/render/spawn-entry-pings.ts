import { spawnEntryPingScreenPoint, type SpawnEntryPing } from '../spawn-entry-feedback'
import { clamp, TAU } from '../math-utils'
import type { Vec } from '../main-types'

export interface SpawnEntryPingsRenderView {
  ctx: CanvasRenderingContext2D
  pings: SpawnEntryPing[]
  width: number
  height: number
  glow: boolean
  scale: number
  worldToScreen: (x: number, y: number) => Vec
}

export function renderSpawnEntryPings(view: SpawnEntryPingsRenderView) {
  const { ctx, pings, width, height, glow, scale, worldToScreen } = view
  if (pings.length === 0) return
  ctx.save()
  ctx.globalCompositeOperation = glow ? 'lighter' : 'source-over'
  for (const ping of pings) {
    const screen = worldToScreen(ping.x, ping.y)
    const point = spawnEntryPingScreenPoint({
      screen,
      width,
      height,
      margin: ping.giant ? 36 : 28
    })
    const alpha = clamp(ping.life / ping.maxLife, 0, 1)
    const progress = 1 - alpha
    const radius = ping.radius * (point.offscreen ? 0.58 : scale) * (0.62 + progress * 0.76)
    ctx.save()
    ctx.globalAlpha = alpha * (ping.giant ? 0.95 : 0.78)
    ctx.strokeStyle = ping.giant ? '#ffedf1' : ping.color
    ctx.fillStyle = ping.color
    ctx.shadowColor = ping.color
    ctx.shadowBlur = glow ? (ping.giant ? 28 : 16) : 0
    ctx.lineWidth = ping.giant ? 2.6 : 1.8
    ctx.beginPath()
    ctx.arc(point.x, point.y, radius, 0, TAU)
    ctx.stroke()
    ctx.globalAlpha *= 0.62
    ctx.beginPath()
    ctx.arc(point.x, point.y, Math.max(7, radius * 0.38), 0, TAU)
    ctx.stroke()
    if (point.offscreen) {
      const angle = Math.atan2(point.y - height / 2, point.x - width / 2)
      ctx.translate(point.x, point.y)
      ctx.rotate(angle)
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.moveTo(16, 0)
      ctx.lineTo(-7, -8)
      ctx.lineTo(-3, 0)
      ctx.lineTo(-7, 8)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()
  }
  ctx.restore()
}
