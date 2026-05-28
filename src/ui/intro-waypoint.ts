import { introHookConfig } from '../intro-hook'

export interface IntroWaypointView {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  targetScreen: { x: number; y: number }
  planetName: string
}

export interface IntroWaypointLabelAnchorInput {
  width: number
  height: number
  targetScreen: { x: number; y: number }
  fontPx: number
  label: string
  sublabel: string
}

export function introWaypointLabelAnchor(input: IntroWaypointLabelAnchorInput) {
  const margin = 36
  const cx = input.width / 2
  const cy = input.height / 2
  const dx = input.targetScreen.x - cx
  const dy = input.targetScreen.y - cy
  const angle = Math.atan2(dy, dx)
  const halfW = input.width / 2 - margin
  const halfH = input.height / 2 - margin
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const scale = Math.min(halfW / Math.max(Math.abs(cos), 0.0001), halfH / Math.max(Math.abs(sin), 0.0001))
  const arrowX = cx + cos * scale
  const arrowY = cy + sin * scale
  const longest = Math.max(input.label.length, input.sublabel.length)
  const maxTextWidth = Math.min(input.width - 16, Math.max(96, longest * input.fontPx * 0.68))
  const textX = Math.max(maxTextWidth / 2 + 8, Math.min(input.width - maxTextWidth / 2 - 8, arrowX))
  const lineGap = input.fontPx + 2
  const descent = Math.max(4, input.fontPx * 0.3)
  const bottomLimit = input.height - 18
  const minTextY = input.width < 560 ? 96 : 92
  const maxTextY = bottomLimit - lineGap - descent
  const preferredTextY = sin > 0.45
    ? arrowY - 22 - lineGap
    : arrowY + 22
  const textY = Math.max(minTextY, Math.min(maxTextY, preferredTextY))
  return { arrowX, arrowY, textX, textY, textBottom: textY + lineGap + descent, angle, maxTextWidth }
}

export function introWaypointOnscreenLabelAnchor(input: IntroWaypointLabelAnchorInput) {
  const longest = Math.max(input.label.length, input.sublabel.length)
  const maxTextWidth = Math.min(input.width - 16, Math.max(96, longest * input.fontPx * 0.68))
  const textX = Math.max(maxTextWidth / 2 + 8, Math.min(input.width - maxTextWidth / 2 - 8, input.targetScreen.x))
  const lineGap = input.fontPx + 2
  const descent = Math.max(4, input.fontPx * 0.3)
  const topReserve = input.width < 560 ? 96 : 92
  const maxTextY = input.height - 18 - lineGap - descent
  const preferredTextY = input.targetScreen.y - 28
  const textY = Math.max(topReserve, Math.min(maxTextY, preferredTextY))
  return { textX, textY, textBottom: textY + lineGap + descent, maxTextWidth }
}

export function renderIntroArrow(view: IntroWaypointView): void {
  const { ctx, width, height, targetScreen, planetName } = view
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
    const anchor = introWaypointOnscreenLabelAnchor({
      width,
      height,
      targetScreen,
      fontPx: introHookConfig.waypoint.fontPx,
      label: 'LAND HERE',
      sublabel: planetName
    })
    ctx.fillText('LAND HERE', anchor.textX, anchor.textY, anchor.maxTextWidth)
    ctx.fillText(planetName, anchor.textX, anchor.textY + introHookConfig.waypoint.fontPx + 2, anchor.maxTextWidth)
  } else {
    const anchor = introWaypointLabelAnchor({
      width,
      height,
      targetScreen,
      fontPx: introHookConfig.waypoint.fontPx,
      label: 'LAND HERE',
      sublabel: planetName
    })
    ctx.translate(anchor.arrowX, anchor.arrowY)
    ctx.save()
    ctx.rotate(anchor.angle)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-18, -9)
    ctx.lineTo(-14, 0)
    ctx.lineTo(-18, 9)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    ctx.fillText('LAND HERE', anchor.textX - anchor.arrowX, anchor.textY - anchor.arrowY, anchor.maxTextWidth)
    ctx.fillText(planetName, anchor.textX - anchor.arrowX, anchor.textY - anchor.arrowY + introHookConfig.waypoint.fontPx + 2, anchor.maxTextWidth)
  }
  ctx.restore()
}
