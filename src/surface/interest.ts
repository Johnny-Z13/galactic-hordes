import { clamp } from '../math-utils'
import { surfaceRunBalance } from '../surface-balance'

export interface SurfaceInterestState {
  time: number
  planets: number
  level: number
}

export function surfaceRunInterest(state: SurfaceInterestState) {
  return clamp(
    state.time / surfaceRunBalance.interest.timeDivisor
      + state.planets * surfaceRunBalance.interest.perPlanet
      + state.level * surfaceRunBalance.interest.perLevel,
    0,
    1
  )
}
