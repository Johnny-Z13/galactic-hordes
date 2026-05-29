import { clamp } from '../math-utils'
import type { Vec } from '../main-types'

export interface SurfaceCameraWorld {
  width: number
  height: number
}

export function initialSurfaceCamera(input: {
  pilot: Vec
  world: SurfaceCameraWorld
  viewWidth: number
  viewHeight: number
}): Vec {
  return {
    x: clamp(input.pilot.x - input.viewWidth / 2, 0, Math.max(0, input.world.width - input.viewWidth)),
    y: clamp(input.pilot.y - input.viewHeight / 2, 0, Math.max(0, input.world.height - input.viewHeight))
  }
}
