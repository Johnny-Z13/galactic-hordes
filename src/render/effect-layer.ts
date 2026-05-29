import type { GameState } from '../game-states'
import type { Vec } from '../main-types'

export interface SurfaceEffectModeInput {
  hasSurface: boolean
  state: GameState | string
  transitionProgress: number
}

export function surfaceEffectMode({ hasSurface, state, transitionProgress }: SurfaceEffectModeInput) {
  if (!hasSurface) return false
  return state === 'surface' || state === 'takeoff' || (state === 'landing' && transitionProgress > 0.58)
}

export interface EffectLayerCameraInput {
  surfaceMode: boolean
  surfaceCamera: Vec | null
  spaceCamera: Vec
}

export function effectLayerCamera({ surfaceMode, surfaceCamera, spaceCamera }: EffectLayerCameraInput) {
  return surfaceMode && surfaceCamera ? surfaceCamera : spaceCamera
}
