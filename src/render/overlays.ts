import type { Vec } from '../main-types'
import { clamp, TAU } from '../math-utils'

export interface TransitionOverlayRenderView {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  t: number
  label: string
}

export interface DeathOverlayRenderView {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  deathTimer: number
  playerScreen: Vec
}

export function renderTransitionOverlay(view: TransitionOverlayRenderView) {
  const { ctx } = view
  const pulse = Math.sin(view.t * Math.PI)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.strokeStyle = '#57fff3'
  ctx.shadowColor = '#57fff3'
  ctx.shadowBlur = 24
  ctx.lineWidth = 2
  for (let i = 0; i < 9; i += 1) {
    const r = (i + 1) * 70 + pulse * 120
    ctx.beginPath()
    ctx.arc(view.width / 2, view.height / 2, r, 0, TAU)
    ctx.stroke()
  }
  ctx.fillStyle = `rgba(0,0,0,${0.18 + pulse * 0.32})`
  ctx.fillRect(0, 0, view.width, view.height)
  ctx.fillStyle = '#d7fff7'
  ctx.font = '18px Courier New'
  ctx.textAlign = 'center'
  ctx.fillText(view.label, view.width / 2, view.height / 2)
  ctx.restore()
}

export function renderDeathOverlay(view: DeathOverlayRenderView) {
  const { ctx } = view
  const t = clamp(view.deathTimer / 2.35, 0, 1)
  const flash = Math.max(0, 1 - view.deathTimer * 2.6)
  const p = view.playerScreen
  ctx.save()
  ctx.fillStyle = `rgba(0,0,0,${0.2 + t * 0.52})`
  ctx.fillRect(0, 0, view.width, view.height)
  ctx.globalCompositeOperation = 'lighter'
  const boom = clamp(view.deathTimer / 1.1, 0, 1)
  for (let i = 0; i < 4; i += 1) {
    const ring = boom * (70 + i * 38)
    const alpha = Math.max(0, 0.52 - boom * 0.42 - i * 0.06)
    ctx.strokeStyle = i % 2 === 0 ? `rgba(255,93,115,${alpha})` : `rgba(255,242,122,${alpha})`
    ctx.shadowColor = i % 2 === 0 ? '#ff5d73' : '#fff27a'
    ctx.shadowBlur = 22
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(p.x, p.y, ring, 0, TAU)
    ctx.stroke()
  }
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * TAU + view.deathTimer * 0.9
    const length = 54 + boom * 120
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(255,242,122,0.46)' : 'rgba(87,255,243,0.34)'
    ctx.beginPath()
    ctx.moveTo(p.x + Math.cos(a) * 18, p.y + Math.sin(a) * 18)
    ctx.lineTo(p.x + Math.cos(a) * length, p.y + Math.sin(a) * length)
    ctx.stroke()
  }
  ctx.globalCompositeOperation = 'source-over'
  if (flash > 0) {
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = `rgba(255,242,122,${flash * 0.42})`
    ctx.fillRect(0, 0, view.width, view.height)
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.textAlign = 'center'
  ctx.shadowColor = '#ff5d73'
  ctx.shadowBlur = 26
  ctx.fillStyle = '#ffedf1'
  ctx.font = '24px Courier New'
  ctx.fillText('YOU DIED', view.width / 2, view.height * 0.42)
  ctx.shadowColor = '#57fff3'
  ctx.shadowBlur = 18
  ctx.fillStyle = '#d7fff7'
  ctx.font = '13px Courier New'
  ctx.fillText('BLACK BOX TRANSMITTING TO MOTHERSHIP', view.width / 2, view.height * 0.42 + 34)
  const barWidth = Math.min(320, view.width - 52)
  const x = (view.width - barWidth) / 2
  const y = view.height * 0.42 + 58
  ctx.strokeStyle = 'rgba(87,255,243,0.62)'
  ctx.strokeRect(x, y, barWidth, 7)
  ctx.fillStyle = '#57fff3'
  ctx.fillRect(x, y, barWidth * t, 7)
  ctx.restore()
}
