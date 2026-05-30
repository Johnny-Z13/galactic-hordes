import type { ImpactPulse } from '../combat/impact-feedback'
import type { Vec } from '../main-types'
import { clamp, TAU } from '../math-utils'

export interface ImpactPulsesRenderView {
  ctx: CanvasRenderingContext2D
  pulses: ImpactPulse[]
  width: number
  height: number
  glow: boolean
  scale: number
  worldToScreen: (x: number, y: number) => Vec
}

export function renderImpactPulses(view: ImpactPulsesRenderView) {
  const { ctx, pulses, width, height, glow, scale, worldToScreen } = view
  if (pulses.length === 0) return
  ctx.save()
  ctx.globalCompositeOperation = glow ? 'lighter' : 'source-over'
  for (const pulse of pulses) {
    const screen = worldToScreen(pulse.x, pulse.y)
    if (screen.x < -120 || screen.x > width + 120 || screen.y < -120 || screen.y > height + 120) continue
    const alpha = clamp(pulse.life / pulse.maxLife, 0, 1)
    const progress = 1 - alpha
    const radius = pulse.radius * scale * (0.62 + progress * 0.72)
    ctx.save()
    ctx.globalAlpha = alpha * (pulse.kind === 'kill' ? 0.86 : 0.58)
    ctx.strokeStyle = pulse.kind === 'kill' ? '#ffedf1' : pulse.color
    ctx.shadowColor = pulse.color
    ctx.shadowBlur = glow ? (pulse.kind === 'kill' ? 24 : 12) : 0
    ctx.lineWidth = pulse.lineWidth
    ctx.beginPath()
    ctx.arc(screen.x, screen.y, radius, 0, TAU)
    ctx.stroke()
    if (pulse.kind === 'kill') {
      ctx.globalAlpha *= 0.5
      ctx.beginPath()
      ctx.arc(screen.x, screen.y, Math.max(8, radius * 0.42), 0, TAU)
      ctx.stroke()
    }
    ctx.restore()
  }
  ctx.restore()
}
