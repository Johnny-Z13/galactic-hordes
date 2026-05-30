import type { Vec } from '../main-types'
import { clamp, dist2, TAU } from '../math-utils'

export interface RenderReturnBeacon {
  x: number
  y: number
  radius: number
  hold: number
  phase: number
}

export interface RenderNavigationTarget {
  x: number
  y: number
  radius: number
}

export interface ReturnBeaconRenderView {
  ctx: CanvasRenderingContext2D
  beacon: RenderReturnBeacon | null
  player: Vec
  width: number
  height: number
  glow: boolean
  scale: number
  holdSeconds: number
  worldToScreen: (x: number, y: number) => Vec
}

export interface AutopilotRenderView {
  ctx: CanvasRenderingContext2D
  active: boolean
  player: Vec
  target: RenderNavigationTarget | null
  beaconTarget: RenderNavigationTarget | null
  level: number
  scale: number
  color: string
  glow: boolean
  alpha: number
  heading: number
  worldToScreen: (x: number, y: number) => Vec
  time: number
}

export function renderReturnBeacon(view: ReturnBeaconRenderView) {
  const { ctx, beacon, player, width, height, glow, scale, holdSeconds, worldToScreen } = view
  if (!beacon) return
  const point = worldToScreen(beacon.x, beacon.y)
  const distance = Math.floor(Math.sqrt(dist2(beacon, player)))
  const margin = 34
  const topMargin = 92
  const onScreen = point.x >= margin && point.x <= width - margin && point.y >= topMargin && point.y <= height - margin
  if (!onScreen) {
    renderOffscreenBeaconPointer({ ctx, point, distance, width, height, glow, margin, topMargin })
    return
  }

  const pulse = Math.sin(beacon.phase * 4) * 0.5 + 0.5
  const radius = beacon.radius * scale
  const stationRadius = radius * 0.72
  const dockRadius = radius * 0.34
  ctx.save()
  ctx.translate(point.x, point.y)
  ctx.strokeStyle = '#fff27a'
  ctx.fillStyle = 'rgba(87,255,243,0.12)'
  ctx.shadowColor = '#fff27a'
  ctx.shadowBlur = glow ? 24 : 8
  ctx.lineWidth = 2 + pulse
  ctx.beginPath()
  for (let i = 0; i < 8; i += 1) {
    const a = -Math.PI / 8 + (i / 8) * TAU
    if (i === 0) ctx.moveTo(Math.cos(a) * stationRadius, Math.sin(a) * stationRadius)
    else ctx.lineTo(Math.cos(a) * stationRadius, Math.sin(a) * stationRadius)
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = '#57fff3'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let i = 0; i < 6; i += 1) {
    const a = Math.PI / 6 + (i / 6) * TAU
    if (i === 0) ctx.moveTo(Math.cos(a) * dockRadius, Math.sin(a) * dockRadius)
    else ctx.lineTo(Math.cos(a) * dockRadius, Math.sin(a) * dockRadius)
  }
  ctx.closePath()
  ctx.stroke()
  ctx.strokeStyle = '#fff27a'
  ctx.beginPath()
  ctx.moveTo(-stationRadius * 1.12, 0)
  ctx.lineTo(-dockRadius, 0)
  ctx.moveTo(dockRadius, 0)
  ctx.lineTo(stationRadius * 1.12, 0)
  ctx.moveTo(0, -stationRadius * 1.12)
  ctx.lineTo(0, -dockRadius)
  ctx.moveTo(0, dockRadius)
  ctx.lineTo(0, stationRadius * 1.12)
  ctx.stroke()
  ctx.strokeStyle = '#57fff3'
  ctx.beginPath()
  ctx.arc(0, 0, radius * clamp(beacon.hold / holdSeconds, 0, 1), 0, TAU)
  ctx.stroke()
  ctx.shadowBlur = 0
  ctx.fillStyle = '#fff27a'
  ctx.font = '12px Courier New'
  ctx.textAlign = 'center'
  ctx.fillText(`STATION ${distance}`, 0, -radius - 16)
  ctx.fillText('DOCKING', 0, radius + 24)
  ctx.restore()
}

export function renderAutopilot(view: AutopilotRenderView) {
  const { ctx, active, player, target, beaconTarget, level, scale, color, glow, alpha, heading, worldToScreen, time } = view
  if (!active) return
  const point = worldToScreen(player.x, player.y)
  ctx.save()
  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = glow ? 14 : 0
  ctx.lineWidth = 1.2
  ctx.globalAlpha = alpha
  ctx.setLineDash([10, 10])
  ctx.beginPath()
  ctx.moveTo(point.x, point.y)
  if (target) {
    const targetPoint = worldToScreen(target.x, target.y)
    ctx.lineTo(targetPoint.x, targetPoint.y)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 0.78
    ctx.beginPath()
    ctx.arc(targetPoint.x, targetPoint.y, target.radius * scale + 16 * scale + Math.sin(time * 5) * 3 * scale, 0, TAU)
    ctx.stroke()
  } else if (beaconTarget) {
    const targetPoint = worldToScreen(beaconTarget.x, beaconTarget.y)
    ctx.lineTo(targetPoint.x, targetPoint.y)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 0.78
    ctx.beginPath()
    ctx.arc(targetPoint.x, targetPoint.y, beaconTarget.radius * scale + 12 * scale + Math.sin(time * 5) * 4 * scale, 0, TAU)
    ctx.stroke()
  } else {
    const length = (62 + level * 13) * scale
    ctx.lineTo(point.x + Math.cos(heading) * length, point.y + Math.sin(heading) * length)
    ctx.stroke()
  }
  ctx.restore()
}

interface OffscreenBeaconPointerView {
  ctx: CanvasRenderingContext2D
  point: Vec
  distance: number
  width: number
  height: number
  glow: boolean
  margin: number
  topMargin: number
}

function renderOffscreenBeaconPointer(view: OffscreenBeaconPointerView) {
  const { ctx, point, distance, width, height, glow, margin, topMargin } = view
  const edge = {
    x: clamp(point.x, margin, width - margin),
    y: clamp(point.y, topMargin, height - margin)
  }
  const angle = Math.atan2(point.y - height / 2, point.x - width / 2)
  ctx.save()
  ctx.translate(edge.x, edge.y)
  ctx.rotate(angle)
  ctx.fillStyle = '#fff27a'
  ctx.strokeStyle = '#111827'
  ctx.shadowColor = '#fff27a'
  ctx.shadowBlur = glow ? 14 : 0
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(18, 0)
  ctx.lineTo(-10, -12)
  ctx.lineTo(-5, 0)
  ctx.lineTo(-10, 12)
  ctx.closePath()
  ctx.stroke()
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.fillStyle = '#fff27a'
  ctx.font = '12px Courier New'
  ctx.textAlign = edge.x > width - 120 ? 'right' : edge.x < 120 ? 'left' : 'center'
  const labelX = clamp(edge.x, 64, width - 64)
  const labelY = clamp(edge.y - 20, topMargin, height - 52)
  ctx.fillText(`STATION ${distance}`, labelX, labelY)
  ctx.restore()
}
