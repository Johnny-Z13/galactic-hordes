import type { Vec } from '../main-types'
import { TAU } from '../math-utils'

export interface OrbitalsRenderView {
  ctx: CanvasRenderingContext2D
  center: Vec
  count: number
  radius: number
  scale: number
  evolved: boolean
  glow: boolean
  highLoad: boolean
  angleForOrb: (index: number, count: number) => number
}

export function renderOrbitals(view: OrbitalsRenderView) {
  const { ctx, center, count, radius, scale, evolved, glow, highLoad, angleForOrb } = view
  if (count <= 0) return
  const color = evolved ? '#fff27a' : '#8fff7d'
  ctx.save()
  ctx.globalCompositeOperation = glow ? 'lighter' : 'source-over'
  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = glow ? 28 : highLoad ? 0 : 14
  ctx.globalAlpha = highLoad ? 0.18 : 0.26
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(center.x, center.y, radius, 0, TAU)
  ctx.stroke()
  ctx.globalAlpha = 1
  for (let i = 0; i < count; i += 1) {
    const a = angleForOrb(i, count)
    const x = center.x + Math.cos(a) * radius
    const y = center.y + Math.sin(a) * radius
    const orbRadius = (evolved ? 7.2 : 6.2) * scale
    const coreRadius = (evolved ? 2.8 : 2.2) * scale
    const side = { x: -Math.sin(a), y: Math.cos(a) }
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, a - 0.52, a - 0.12)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x, y, orbRadius, 0, TAU)
    ctx.moveTo(x - side.x * orbRadius * 1.45, y - side.y * orbRadius * 1.45)
    ctx.lineTo(x + side.x * orbRadius * 1.45, y + side.y * orbRadius * 1.45)
    ctx.moveTo(x + Math.cos(a) * coreRadius, y + Math.sin(a) * coreRadius)
    ctx.arc(x, y, coreRadius, 0, TAU)
    ctx.stroke()
    if (glow) {
      ctx.globalAlpha = 0.28
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.arc(x, y, orbRadius * 1.18, 0, TAU)
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.lineWidth = 1
    }
  }
  ctx.restore()
}
