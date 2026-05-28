import type { Vec } from '../main-types'
import { TAU } from '../math-utils'
import { pickupBalance } from '../powerup-balance'

export type RenderPickupKind = 'xp' | 'repair' | 'magnet' | 'core' | 'chest'

export interface RenderPickup {
  kind: RenderPickupKind
  x: number
  y: number
  value: number
  radius: number
  color: string
}

export interface PickupsRenderView {
  ctx: CanvasRenderingContext2D
  pickups: RenderPickup[]
  width: number
  height: number
  highLoad: boolean
  glow: boolean
  scale: number
  time: number
  worldToScreen: (x: number, y: number) => Vec
}

export function renderPickups(view: PickupsRenderView) {
  const { ctx, pickups, width, height, highLoad, glow, scale, time, worldToScreen } = view
  for (const pickup of pickups) {
    const screen = worldToScreen(pickup.x, pickup.y)
    if (screen.x < -60 || screen.x > width + 60 || screen.y < -60 || screen.y > height + 60) continue
    ctx.save()
    ctx.translate(screen.x, screen.y)
    ctx.strokeStyle = pickup.color
    ctx.fillStyle = pickup.color
    ctx.shadowColor = pickup.color
    ctx.shadowBlur = highLoad ? 0 : glow ? 18 : 10
    ctx.lineWidth = 2
    const pulse = 1 + Math.sin(time * 5 + pickup.value) * 0.08
    const r = pickup.radius * pulse * scale
    const outerGlow = pickup.kind === 'xp' ? r + pickupBalance.xp.radius : r + pickupBalance.defaultRadius
    ctx.globalAlpha = 0.28
    ctx.beginPath()
    ctx.arc(0, 0, outerGlow, 0, TAU)
    ctx.stroke()
    ctx.globalAlpha = 0.95
    ctx.beginPath()
    if (pickup.kind === 'xp') {
      ctx.arc(0, 0, Math.max(4, r * 0.55), 0, TAU)
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.moveTo(-r - 3, 0)
      ctx.lineTo(r + 3, 0)
      ctx.moveTo(0, -r - 3)
      ctx.lineTo(0, r + 3)
    } else if (pickup.kind === 'chest') {
      ctx.roundRect(-r, -r * 0.72, r * 2, r * 1.44, 4)
      ctx.moveTo(-r, -r * 0.18)
      ctx.lineTo(r, -r * 0.18)
      ctx.moveTo(0, -r * 0.72)
      ctx.lineTo(0, r * 0.72)
    } else if (pickup.kind === 'repair') {
      ctx.arc(0, 0, r, 0, TAU)
      ctx.moveTo(-r * 0.58, 0)
      ctx.lineTo(r * 0.58, 0)
      ctx.moveTo(0, -r * 0.58)
      ctx.lineTo(0, r * 0.58)
    } else if (pickup.kind === 'magnet') {
      ctx.arc(0, 0, r, Math.PI * 0.18, Math.PI * 0.82)
      ctx.moveTo(-r * 0.82, r * 0.18)
      ctx.lineTo(-r * 0.82, r * 0.76)
      ctx.moveTo(r * 0.82, r * 0.18)
      ctx.lineTo(r * 0.82, r * 0.76)
    } else {
      ctx.arc(0, 0, r, 0, TAU)
    }
    ctx.stroke()
    if (pickup.kind === 'xp') {
      ctx.globalAlpha = 0.42
      ctx.beginPath()
      ctx.arc(0, 0, r + pickupBalance.xp.outerHalo, 0, TAU)
      ctx.stroke()
    }
    ctx.restore()
  }
}
