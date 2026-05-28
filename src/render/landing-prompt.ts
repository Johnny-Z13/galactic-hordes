import type { Vec } from '../main-types'
import { clamp } from '../math-utils'

export interface LandingPromptRenderView {
  ctx: CanvasRenderingContext2D
  width: number
  planetName: string
  anchor: Vec
}

export function renderLandingPrompt(view: LandingPromptRenderView) {
  const { ctx } = view
  ctx.save()
  ctx.fillStyle = '#fff27a'
  ctx.font = view.width < 560 ? '11px Courier New' : '13px Courier New'
  ctx.textAlign = 'center'
  ctx.shadowColor = '#fff27a'
  ctx.shadowBlur = 12
  const x = clamp(view.anchor.x, view.width < 560 ? 86 : 18, view.width - (view.width < 560 ? 86 : 18))
  if (view.width < 560) {
    ctx.fillText('PRESS E / Y TO LAND', x, view.anchor.y - 7, view.width - 24)
    ctx.fillText(view.planetName, x, view.anchor.y + 8, view.width - 24)
  } else {
    ctx.fillText(`PRESS E / Y TO LAND: ${view.planetName}`, x, view.anchor.y, view.width - 24)
  }
  ctx.restore()
}
