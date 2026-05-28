import { introHookConfig } from '../intro-hook'

export interface IntroWaypointView {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  targetScreen: { x: number; y: number }
  planetName: string
}

export function renderIntroArrow(view: IntroWaypointView): void {
  const { ctx, width, height, targetScreen, planetName } = view
  const margin = 36 // px inset from canvas edge for off-screen arrow
  const onScreen =
    targetScreen.x >= 0 && targetScreen.x <= width &&
    targetScreen.y >= 0 && targetScreen.y <= height
  ctx.save()
  ctx.fillStyle = introHookConfig.waypoint.color
  ctx.strokeStyle = introHookConfig.waypoint.color
  ctx.font = `${introHookConfig.waypoint.fontPx}px Courier New`
  ctx.textAlign = 'center'
  ctx.shadowColor = introHookConfig.waypoint.color
  ctx.shadowBlur = 8
  if (onScreen) {
    // Small label near the planet.
    ctx.fillText('LAND HERE', targetScreen.x, targetScreen.y - 28)
    ctx.fillText(planetName, targetScreen.x, targetScreen.y - 14)
  } else {
    // Off-screen: draw an arrow at the playfield edge pointing at the target.
    const cx = width / 2
    const cy = height / 2
    const dx = targetScreen.x - cx
    const dy = targetScreen.y - cy
    const angle = Math.atan2(dy, dx)
    const halfW = width / 2 - margin
    const halfH = height / 2 - margin
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    // clamp-to-rect-edge: pick the axis that hits the bounding box first
    const scale = Math.min(halfW / Math.max(Math.abs(cos), 0.0001), halfH / Math.max(Math.abs(sin), 0.0001))
    const ax = cx + cos * scale
    const ay = cy + sin * scale
    ctx.translate(ax, ay)
    ctx.save()
    ctx.rotate(angle)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-18, -9)
    ctx.lineTo(-14, 0)
    ctx.lineTo(-18, 9)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    ctx.fillText('LAND HERE', 0, 22)
    ctx.fillText(planetName, 0, 22 + introHookConfig.waypoint.fontPx + 2)
  }
  ctx.restore()
}
