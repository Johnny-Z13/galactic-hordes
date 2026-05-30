import type { Vec } from '../main-types'
import { clamp, TAU } from '../math-utils'
import { surfaceWaveDirectorBalance } from '../surface-balance'

export interface SurfaceBulletRenderModel {
  x: number
  y: number
  vx: number
  vy: number
}

export interface SurfaceWaveTelegraphRenderModel {
  x: number
  y: number
  life: number
  maxLife: number
}

export interface SurfaceProjectileRenderView {
  ctx: CanvasRenderingContext2D
  bullets: SurfaceBulletRenderModel[]
  time: number
  allowGlow: boolean
  surfaceToScreen: (x: number, y: number) => Vec
}

export interface SurfaceWaveTelegraphRenderView {
  ctx: CanvasRenderingContext2D
  telegraphs: SurfaceWaveTelegraphRenderModel[]
  time: number
  allowGlow: boolean
  surfaceToScreen: (x: number, y: number) => Vec
}

export function renderSurfaceBullets(view: SurfaceProjectileRenderView) {
  const { ctx, bullets, allowGlow, surfaceToScreen } = view
  ctx.save()
  ctx.strokeStyle = '#fff27a'
  ctx.fillStyle = '#fff27a'
  ctx.shadowColor = '#fff27a'
  ctx.shadowBlur = allowGlow ? 4 : 0
  ctx.lineWidth = 1.1
  ctx.globalAlpha = 0.58
  for (const bullet of bullets) {
    const p = surfaceToScreen(bullet.x, bullet.y)
    const angle = Math.atan2(bullet.vy, bullet.vx)
    ctx.beginPath()
    ctx.moveTo(p.x - Math.cos(angle) * 7, p.y - Math.sin(angle) * 7)
    ctx.lineTo(p.x + Math.cos(angle) * 6, p.y + Math.sin(angle) * 6)
    ctx.stroke()
  }
  ctx.restore()
}

export function renderSurfaceWaveTelegraphs(view: SurfaceWaveTelegraphRenderView) {
  const { ctx, telegraphs, time, allowGlow, surfaceToScreen } = view
  for (const telegraph of telegraphs) {
    const p = surfaceToScreen(telegraph.x, telegraph.y)
    const progress = clamp(1 - telegraph.life / telegraph.maxLife, 0, 1)
    const pulse = Math.sin(time * 12) * surfaceWaveDirectorBalance.telegraph.pulseRadius * (0.35 + progress)
    const radius = surfaceWaveDirectorBalance.telegraph.radius + pulse
    ctx.save()
    ctx.globalAlpha = 0.35 + progress * 0.45
    ctx.strokeStyle = progress > 0.62 ? '#ff5d73' : '#ff9f4a'
    ctx.shadowColor = ctx.strokeStyle
    ctx.shadowBlur = allowGlow ? 24 : 0
    ctx.lineWidth = 2 + progress * 2
    ctx.beginPath()
    ctx.arc(p.x, p.y, radius, 0, TAU)
    ctx.stroke()
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.arc(p.x, p.y, Math.max(14, radius * 0.58), -Math.PI / 2, -Math.PI / 2 + TAU * progress)
    ctx.stroke()
    ctx.restore()
  }
}
