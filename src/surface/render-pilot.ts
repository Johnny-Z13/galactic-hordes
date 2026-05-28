import type { Vec } from '../main-types'
import { len, TAU } from '../math-utils'
import { SURFACE_PILOT_SIZE_SCALE, surfacePilotSpriteScale } from '../surface-pilot'

export interface SurfacePilotRenderModel {
  x: number
  y: number
  vx: number
  vy: number
  facing: number
  gunCd: number
  invuln: number
}

export interface SurfacePilotRenderView {
  ctx: CanvasRenderingContext2D
  pilot: SurfacePilotRenderModel
  time: number
  allowGlow: boolean
  surfaceSpacemanSheet: HTMLImageElement
  surfaceToScreen: (x: number, y: number) => Vec
}

export function renderSurfacePilot(view: SurfacePilotRenderView) {
  const p = view.surfaceToScreen(view.pilot.x, view.pilot.y)
  const sheet = view.surfaceSpacemanSheet
  if (sheet.complete && sheet.naturalWidth > 0) {
    const frameCount = 8
    const moving = len(view.pilot.vx, view.pilot.vy) > 12
    const frame = moving ? Math.floor(view.time * 11) % frameCount : 0
    const sw = sheet.naturalWidth / frameCount
    const sh = sheet.naturalHeight
    const scale = surfacePilotSpriteScale(view.pilot.invuln > 0 ? 0.45 : 0.42)
    const dw = sw * scale
    const dh = sh * scale
    const flip = Math.cos(view.pilot.facing) < 0 ? -1 : 1
    const bob = moving ? Math.sin(view.time * 18) * 1.5 : Math.sin(view.time * 3) * 0.8
    view.ctx.save()
    view.ctx.translate(p.x, p.y + bob)
    view.ctx.scale(flip, 1)
    view.ctx.globalCompositeOperation = 'lighter'
    view.ctx.globalAlpha = view.pilot.invuln > 0 ? 1 : 0.96
    view.ctx.shadowColor = view.pilot.invuln > 0 ? '#fff27a' : '#57fff3'
    view.ctx.shadowBlur = view.allowGlow ? 14 : 5
    view.ctx.drawImage(sheet, frame * sw, 0, sw, sh, -dw / 2, -dh * 0.62, dw, dh)
    view.ctx.restore()
    return
  }
  renderFallbackSurfacePilot(view, p)
}

function renderFallbackSurfacePilot(view: SurfacePilotRenderView, p: Vec) {
  const { ctx, pilot, time } = view
  const step = Math.sin(time * 11) * 4
  const facing = Math.sign(Math.cos(pilot.facing)) || 1
  const aim = pilot.facing
  const gunKick = Math.max(0, pilot.gunCd) * 18
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.scale(SURFACE_PILOT_SIZE_SCALE, SURFACE_PILOT_SIZE_SCALE)
  ctx.strokeStyle = pilot.invuln > 0 ? '#fff27a' : '#d7fff7'
  ctx.shadowColor = '#57fff3'
  ctx.shadowBlur = 10
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, -16, 5, 0, TAU)
  ctx.moveTo(0, -11)
  ctx.lineTo(0, 6)
  ctx.moveTo(0, -5)
  ctx.lineTo(Math.cos(aim) * 11, Math.sin(aim) * 11 - 3)
  ctx.moveTo(0, -4)
  ctx.lineTo(facing * -8, 2)
  ctx.moveTo(0, 6)
  ctx.lineTo(-7, 20 + step)
  ctx.moveTo(0, 6)
  ctx.lineTo(7, 20 - step)
  ctx.stroke()
  ctx.strokeStyle = '#fff27a'
  ctx.shadowColor = '#fff27a'
  ctx.beginPath()
  ctx.moveTo(Math.cos(aim) * 8, Math.sin(aim) * 8 - 3)
  ctx.lineTo(Math.cos(aim) * (22 - gunKick), Math.sin(aim) * (22 - gunKick) - 3)
  ctx.stroke()
  ctx.restore()
}
