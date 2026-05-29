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

export function followSurfaceCamera(input: {
  camera: Vec
  pilot: Vec
  world: SurfaceCameraWorld
  viewWidth: number
  viewHeight: number
  dt: number
}): Vec {
  const ease = clamp(input.dt * 7, 0, 1)
  const x = input.camera.x + (input.pilot.x - input.viewWidth / 2 - input.camera.x) * ease
  const y = input.camera.y + (input.pilot.y - input.viewHeight / 2 - input.camera.y) * ease
  return {
    x: clamp(x, 0, Math.max(0, input.world.width - input.viewWidth)),
    y: clamp(y, 0, Math.max(0, input.world.height - input.viewHeight))
  }
}
