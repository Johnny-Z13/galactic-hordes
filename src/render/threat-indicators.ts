import type { Vec } from '../main-types'

export interface ThreatIndicatorTarget {
  x: number
  y: number
  color: string
  radius: number
  hp?: number
}

export interface ThreatIndicatorMarker {
  x: number
  y: number
  angle: number
  color: string
  giant: boolean
  distanceSq: number
}

export interface ThreatIndicatorMarkerInput {
  targets: ThreatIndicatorTarget[]
  player: Vec
  width: number
  height: number
  margin: number
  maxMarkers: number
  worldToScreen: (x: number, y: number) => Vec
}

export interface ThreatIndicatorRenderView extends Omit<ThreatIndicatorMarkerInput, 'margin' | 'maxMarkers'> {
  ctx: CanvasRenderingContext2D
  glow: boolean
}

export function threatIndicatorMarkers(input: ThreatIndicatorMarkerInput): ThreatIndicatorMarker[] {
  const center = { x: input.width / 2, y: input.height / 2 }
  return input.targets
    .map((target) => {
      if (target.hp !== undefined && target.hp <= 0) return null
      const screen = input.worldToScreen(target.x, target.y)
      const offscreen =
        screen.x < input.margin
        || screen.x > input.width - input.margin
        || screen.y < input.margin
        || screen.y > input.height - input.margin
      if (!offscreen) return null
      return {
        x: clamp(screen.x, input.margin, input.width - input.margin),
        y: clamp(screen.y, input.margin, input.height - input.margin),
        angle: Math.atan2(screen.y - center.y, screen.x - center.x),
        color: target.color,
        giant: target.radius >= 44,
        distanceSq: (target.x - input.player.x) ** 2 + (target.y - input.player.y) ** 2
      }
    })
    .filter((marker): marker is ThreatIndicatorMarker => marker !== null)
    .sort((a, b) => a.distanceSq - b.distanceSq)
    .slice(0, input.maxMarkers)
}

export function renderThreatIndicators(view: ThreatIndicatorRenderView) {
  const markers = threatIndicatorMarkers({
    targets: view.targets,
    player: view.player,
    width: view.width,
    height: view.height,
    margin: 42,
    maxMarkers: 4,
    worldToScreen: view.worldToScreen
  })
  if (!markers.length) return
  view.ctx.save()
  view.ctx.globalCompositeOperation = view.glow ? 'lighter' : 'source-over'
  for (const marker of markers) {
    view.ctx.save()
    view.ctx.translate(marker.x, marker.y)
    view.ctx.rotate(marker.angle)
    view.ctx.globalAlpha = marker.giant ? 0.94 : 0.72
    view.ctx.fillStyle = marker.color
    view.ctx.strokeStyle = marker.giant ? '#ffedf1' : marker.color
    view.ctx.shadowColor = marker.color
    view.ctx.shadowBlur = view.glow ? (marker.giant ? 24 : 14) : 0
    view.ctx.lineWidth = marker.giant ? 2.4 : 1.8
    const size = marker.giant ? 18 : 14
    view.ctx.beginPath()
    view.ctx.moveTo(size, 0)
    view.ctx.lineTo(-size * 0.48, -size * 0.58)
    view.ctx.lineTo(-size * 0.2, 0)
    view.ctx.lineTo(-size * 0.48, size * 0.58)
    view.ctx.closePath()
    view.ctx.fill()
    view.ctx.stroke()
    view.ctx.restore()
  }
  view.ctx.restore()
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
