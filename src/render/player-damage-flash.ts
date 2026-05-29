import type { PlayerDamageFlash } from '../combat/player-damage-feedback'
import { clamp } from '../math-utils'

export function renderPlayerDamageFlash(
  ctx: CanvasRenderingContext2D,
  flash: PlayerDamageFlash | null,
  width: number,
  height: number
) {
  if (!flash) return
  const alpha = clamp(flash.life / flash.maxLife, 0, 1) * flash.alpha
  const edge = Math.max(width, height) * (flash.kind === 'critical' ? 0.22 : 0.16)
  const color = flash.kind === 'shield' ? '87,255,243' : '255,93,115'
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.max(24, Math.min(width, height) * 0.32),
    width / 2,
    height / 2,
    Math.max(width, height) * 0.72
  )
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(0.55, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, `rgba(${color},${alpha})`)
  ctx.save()
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  ctx.globalAlpha = alpha * 0.72
  ctx.strokeStyle = flash.color
  ctx.lineWidth = edge
  ctx.strokeRect(-edge / 2, -edge / 2, width + edge, height + edge)
  ctx.restore()
}
