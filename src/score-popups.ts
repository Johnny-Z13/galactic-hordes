import type { Vec } from './main-types'

export type ScorePopupLayer = 'space' | 'surface'

export interface ScorePopupModel {
  x: number
  y: number
  vy: number
  life: number
  totalLife: number
  text: string
  layer: ScorePopupLayer
}

export function createScorePopup(input: {
  x: number
  y: number
  value: number
  layer: ScorePopupLayer
  riseSpeed: number
  lifeSeconds: number
}): ScorePopupModel {
  return {
    x: input.x,
    y: input.y,
    vy: -input.riseSpeed,
    life: input.lifeSeconds,
    totalLife: input.lifeSeconds,
    text: `+${Math.round(input.value)}`,
    layer: input.layer
  }
}

export function scorePopupScreenPoint(
  popup: ScorePopupModel,
  projectors: {
    worldToScreen: (x: number, y: number) => Vec
    surfaceToScreen: (x: number, y: number) => Vec
  }
) {
  return popup.layer === 'surface'
    ? projectors.surfaceToScreen(popup.x, popup.y)
    : projectors.worldToScreen(popup.x, popup.y)
}

export function advanceScorePopups(popups: ScorePopupModel[], dt: number) {
  for (let i = popups.length - 1; i >= 0; i -= 1) {
    const popup = popups[i]
    popup.life -= dt
    popup.y += popup.vy * dt
    if (popup.life <= 0) popups.splice(i, 1)
  }
}
