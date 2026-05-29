import type { Vec } from '../main-types'

export interface SurfaceShipRenderModel {
  x: number
  y: number
}

export interface SurfaceShipRenderView {
  ctx: CanvasRenderingContext2D
  ship: SurfaceShipRenderModel
  time: number
  surfaceToScreen: (x: number, y: number) => Vec
}

export function renderSurfaceShip(view: SurfaceShipRenderView) {
  const { ctx } = view
  const p = view.surfaceToScreen(view.ship.x, view.ship.y)
  const pulse = Math.sin(view.time * 3) * 0.06
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.strokeStyle = '#57fff3'
  ctx.shadowColor = '#57fff3'
  ctx.shadowBlur = 20
  ctx.lineWidth = 2
  ctx.rotate(-Math.PI / 2)
  ctx.scale(2.35 + pulse, 2.35 + pulse)
  ctx.beginPath()
  ctx.moveTo(24, 0)
  ctx.lineTo(-15, -13)
  ctx.lineTo(-8, 0)
  ctx.lineTo(-15, 13)
  ctx.closePath()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-16, -8)
  ctx.lineTo(-30, 0)
  ctx.lineTo(-16, 8)
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.strokeStyle = '#fff27a'
  ctx.shadowColor = '#fff27a'
  ctx.shadowBlur = 14
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-22, 28)
  ctx.lineTo(-46, 50)
  ctx.moveTo(22, 28)
  ctx.lineTo(46, 50)
  ctx.moveTo(-32, 50)
  ctx.lineTo(32, 50)
  ctx.stroke()
  ctx.restore()
}
