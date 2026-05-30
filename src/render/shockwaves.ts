import type { Vec } from '../main-types'
import { clamp, TAU } from '../math-utils'

export interface RenderShockwave {
  x: number
  y: number
  radius: number
  life: number
  maxLife: number
  color: string
  jag: number
}

export interface ShockwavesRenderView {
  ctx: CanvasRenderingContext2D
  shockwaves: RenderShockwave[]
  width: number
  height: number
  glow: boolean
  highLoad: boolean
  surfaceMode: boolean
  scale: number
  effectToScreen: (x: number, y: number) => Vec
}

export function renderShockwaves(view: ShockwavesRenderView) {
  const { ctx, shockwaves, width, height, glow, highLoad, surfaceMode, scale, effectToScreen } = view
  ctx.save()
  ctx.globalCompositeOperation = glow ? 'lighter' : 'source-over'
  for (const shockwave of shockwaves) {
    const screen = effectToScreen(shockwave.x, shockwave.y)
    const radius = shockwave.radius * (surfaceMode ? 1 : scale)
    if (screen.x + radius < -120 || screen.x - radius > width + 120 || screen.y + radius < -120 || screen.y - radius > height + 120) continue
    const alpha = clamp(shockwave.life / shockwave.maxLife, 0, 1)
    const points = highLoad ? 10 : glow ? 28 : 18
    ctx.save()
    ctx.globalAlpha = alpha * 0.92
    ctx.strokeStyle = shockwave.color
    ctx.shadowColor = shockwave.color
    ctx.shadowBlur = glow ? 42 : highLoad ? 0 : 22
    ctx.lineWidth = (glow ? 2.6 : 2) + alpha * (glow ? 4.6 : 3)
    ctx.beginPath()
    for (let i = 0; i <= points; i += 1) {
      const a = (i / points) * TAU
      const wobble = Math.sin(a * 5 + shockwave.jag) * 0.12 + Math.sin(a * 9 - shockwave.jag) * 0.06
      const r = radius * (1 + wobble)
      const x = screen.x + Math.cos(a) * r
      const y = screen.y + Math.sin(a) * r
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.globalAlpha = alpha * (glow ? 0.42 : 0.25)
    ctx.lineWidth = glow ? 12 : 8
    ctx.stroke()
    if (glow) {
      ctx.globalAlpha = alpha * 0.2
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let i = 0; i < 10; i += 1) {
        const a = (i / 10) * TAU + shockwave.jag
        ctx.moveTo(screen.x + Math.cos(a) * radius * 0.18, screen.y + Math.sin(a) * radius * 0.18)
        ctx.lineTo(screen.x + Math.cos(a) * radius * 0.96, screen.y + Math.sin(a) * radius * 0.96)
      }
      ctx.stroke()
    }
    ctx.restore()
  }
  ctx.restore()
}
