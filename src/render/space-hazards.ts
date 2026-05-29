import type { Vec } from '../main-types'
import { clamp, hash32, TAU } from '../math-utils'

export interface SpaceHazardRenderModel {
  x: number
  y: number
  radius: number
  phase: number
}

export interface DerelictSignalRenderModel {
  x: number
  y: number
  phase: number
}

export interface SpaceHazardRenderView {
  ctx: CanvasRenderingContext2D
  hazards: SpaceHazardRenderModel[]
  width: number
  height: number
  scale: number
  glow: boolean
  worldToScreen: (x: number, y: number) => Vec
}

export interface DerelictSignalRenderView {
  ctx: CanvasRenderingContext2D
  signals: DerelictSignalRenderModel[]
  width: number
  height: number
  scale: number
  glow: boolean
  worldToScreen: (x: number, y: number) => Vec
}

export function renderSpaceHazards(view: SpaceHazardRenderView) {
  if (!view.hazards.length) return
  const { ctx } = view
  ctx.save()
  ctx.lineJoin = 'round'
  for (const hazard of view.hazards) {
    const p = view.worldToScreen(hazard.x, hazard.y)
    const radius = hazard.radius * view.scale
    if (p.x < -radius - 80 || p.x > view.width + radius + 80 || p.y < -radius - 80 || p.y > view.height + radius + 80) continue
    const points = 10
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(hazard.phase)
    ctx.shadowColor = '#fff27a'
    ctx.shadowBlur = view.glow ? 18 : 4
    ctx.strokeStyle = 'rgba(255,242,122,0.82)'
    ctx.fillStyle = 'rgba(88,62,38,0.42)'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i < points; i += 1) {
      const a = (i / points) * TAU
      const wobble = 0.82 + ((hash32(Math.floor(hazard.x), Math.floor(hazard.y), i) % 34) / 100)
      const x = Math.cos(a) * radius * wobble
      const y = Math.sin(a) * radius * wobble
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.globalAlpha = 0.34
    ctx.beginPath()
    ctx.arc(0, 0, radius * 1.28, 0, TAU)
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
}

export function renderDerelictSignals(view: DerelictSignalRenderView) {
  if (!view.signals.length) return
  const { ctx } = view
  ctx.save()
  for (const signal of view.signals) {
    const p = view.worldToScreen(signal.x, signal.y)
    if (p.x < 34 || p.x > view.width - 34 || p.y < 92 || p.y > view.height - 34) {
      const edge = {
        x: clamp(p.x, 34, view.width - 34),
        y: clamp(p.y, 92, view.height - 34)
      }
      const angle = Math.atan2(p.y - view.height / 2, p.x - view.width / 2)
      ctx.save()
      ctx.translate(edge.x, edge.y)
      ctx.rotate(angle)
      ctx.strokeStyle = '#fff27a'
      ctx.fillStyle = 'rgba(255,242,122,0.2)'
      ctx.shadowColor = '#fff27a'
      ctx.shadowBlur = view.glow ? 14 : 0
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(18, 0)
      ctx.lineTo(-10, -10)
      ctx.lineTo(-4, 0)
      ctx.lineTo(-10, 10)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.restore()
      ctx.save()
      ctx.fillStyle = '#fff27a'
      ctx.font = '12px Courier New'
      ctx.textAlign = edge.x > view.width - 140 ? 'right' : edge.x < 140 ? 'left' : 'center'
      ctx.fillText('DERELICT', clamp(edge.x, 62, view.width - 62), clamp(edge.y - 18, 92, view.height - 48))
      ctx.restore()
      continue
    }
    const pulse = 1 + Math.sin(signal.phase * 5) * 0.08
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(signal.phase * 0.45)
    ctx.strokeStyle = '#fff27a'
    ctx.fillStyle = 'rgba(255,242,122,0.1)'
    ctx.shadowColor = '#fff27a'
    ctx.shadowBlur = view.glow ? 22 : 6
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.rect(-34 * view.scale * pulse, -18 * view.scale * pulse, 68 * view.scale * pulse, 36 * view.scale * pulse)
    ctx.moveTo(-46 * view.scale * pulse, 0)
    ctx.lineTo(-70 * view.scale * pulse, -16 * view.scale * pulse)
    ctx.moveTo(46 * view.scale * pulse, 0)
    ctx.lineTo(70 * view.scale * pulse, 16 * view.scale * pulse)
    ctx.fill()
    ctx.stroke()
    ctx.setLineDash([7, 7])
    ctx.beginPath()
    ctx.arc(0, 0, 96 * view.scale, 0, TAU)
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.fillStyle = '#fff27a'
    ctx.font = '12px Courier New'
    ctx.textAlign = 'center'
    ctx.fillText('DERELICT CACHE', p.x, p.y - 78 * view.scale)
    ctx.restore()
  }
  ctx.restore()
}
