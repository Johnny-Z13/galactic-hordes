import type { Vec } from '../main-types'
import { TAU } from '../math-utils'

export interface RenderParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  angle?: number
  sides?: number
  length?: number
  glow?: number
}

export interface ParticlesRenderView {
  ctx: CanvasRenderingContext2D
  particles: RenderParticle[]
  width: number
  height: number
  glow: boolean
  surfaceMode: boolean
  scale: number
  visibleBudget: number
  effectToScreen: (x: number, y: number) => Vec
}

export interface SimpleParticlesRenderView {
  ctx: CanvasRenderingContext2D
  particles: RenderParticle[]
  width: number
  height: number
  surfaceMode: boolean
  scale: number
  cameraX: number
  cameraY: number
  worldToScreen: (x: number, y: number) => Vec
}

export function renderParticles(view: ParticlesRenderView) {
  const { ctx, particles, width, height, glow, surfaceMode, scale, visibleBudget, effectToScreen } = view
  ctx.save()
  ctx.globalCompositeOperation = glow ? 'lighter' : 'source-over'
  let drawn = 0
  for (const particle of particles) {
    const screen = effectToScreen(particle.x, particle.y)
    if (screen.x < -80 || screen.x > width + 80 || screen.y < -80 || screen.y > height + 80) continue
    if (drawn++ > visibleBudget) break
    ctx.save()
    ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1)
    ctx.strokeStyle = particle.color
    ctx.shadowColor = particle.color
    ctx.shadowBlur = glow ? particle.glow ?? 10 : 0
    ctx.lineWidth = particle.sides ? 1.5 : clamp(particle.size, 1, 3)
    ctx.translate(screen.x, screen.y)
    ctx.rotate(particle.angle ?? 0)
    if (!surfaceMode) ctx.scale(scale, scale)
    ctx.beginPath()
    if (particle.sides && particle.sides > 2) {
      for (let i = 0; i < particle.sides; i += 1) {
        const a = (i / particle.sides) * TAU
        const r = particle.size * (i % 2 ? 0.55 : 1)
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
    } else {
      const length = particle.length ?? Math.hypot(particle.vx, particle.vy) * 0.04
      ctx.moveTo(0, 0)
      ctx.lineTo(-length, 0)
    }
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
}

export function renderParticlesSimple(view: SimpleParticlesRenderView) {
  const { ctx, particles, width, height, surfaceMode, scale, cameraX, cameraY, worldToScreen } = view
  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 0.78
  ctx.strokeStyle = 'rgba(215,255,247,0.76)'
  ctx.lineWidth = 1
  ctx.beginPath()
  let drawn = 0
  for (const particle of particles) {
    const screen = surfaceMode ? { x: particle.x - cameraX, y: particle.y - cameraY } : worldToScreen(particle.x, particle.y)
    const x = screen.x
    const y = screen.y
    if (x < -80 || x > width + 80 || y < -80 || y > height + 80) continue
    if (drawn++ > 140) break
    const alpha = clamp(particle.life / particle.maxLife, 0, 1)
    const length = Math.max(3, (particle.length ?? Math.hypot(particle.vx, particle.vy) * 0.035) * alpha * (surfaceMode ? 1 : scale))
    const mag = Math.hypot(particle.vx, particle.vy) || 1
    ctx.moveTo(x, y)
    ctx.lineTo(x - (particle.vx / mag) * length, y - (particle.vy / mag) * length)
  }
  ctx.stroke()
  ctx.restore()
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
