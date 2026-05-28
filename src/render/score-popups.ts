import { introHookConfig } from '../intro-hook'
import { scorePopupScreenPoint, type ScorePopupModel } from '../score-popups'
import type { Vec } from '../main-types'

export interface ScorePopupRenderView {
  ctx: CanvasRenderingContext2D
  popups: ScorePopupModel[]
  worldToScreen: (x: number, y: number) => Vec
  surfaceToScreen: (x: number, y: number) => Vec
}

export function renderScorePopups(view: ScorePopupRenderView) {
  const { ctx, popups, worldToScreen, surfaceToScreen } = view
  if (popups.length === 0) return
  ctx.save()
  ctx.font = `${introHookConfig.popup.fontPx}px Courier New`
  ctx.textAlign = 'center'
  ctx.fillStyle = introHookConfig.popup.color
  for (const popup of popups) {
    const screen = scorePopupScreenPoint(popup, { worldToScreen, surfaceToScreen })
    ctx.globalAlpha = Math.max(0, popup.life / popup.totalLife)
    ctx.fillText(popup.text, screen.x, screen.y)
  }
  ctx.globalAlpha = 1
  ctx.restore()
}
