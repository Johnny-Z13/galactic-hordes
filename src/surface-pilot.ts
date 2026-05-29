import { clamp, len, norm } from './math-utils'
import { powerupBalance } from './powerup-balance'

export const SURFACE_PILOT_SIZE_SCALE = 0.65
export const SURFACE_PILOT_BASE_COLLISION_RADIUS = 13
export const SURFACE_PILOT_BASE_SPAWN_KEEPOUT = 26
export const SURFACE_PILOT_BASE_MUZZLE_OFFSET = 19

export const surfacePilotSpriteScale = (baseScale: number) => baseScale * SURFACE_PILOT_SIZE_SCALE
export const surfacePilotCollisionRadius = () => Math.round(SURFACE_PILOT_BASE_COLLISION_RADIUS * SURFACE_PILOT_SIZE_SCALE)
export const surfacePilotSpawnKeepout = () => Math.round(SURFACE_PILOT_BASE_SPAWN_KEEPOUT * SURFACE_PILOT_SIZE_SCALE)
export const surfacePilotMuzzleOffset = () => Math.round(SURFACE_PILOT_BASE_MUZZLE_OFFSET * SURFACE_PILOT_SIZE_SCALE)

export interface SurfacePilotMotionState {
  x: number
  y: number
  vx: number
  vy: number
  facing: number
}

export interface SurfacePilotMotionInput {
  pilot: SurfacePilotMotionState
  ship: { x: number; y: number }
  move: { x: number; y: number }
  o2Returning: boolean
  engineRank: number
  dt: number
  world: { width: number; height: number }
}

export function updateSurfacePilotMotion(input: SurfacePilotMotionInput): SurfacePilotMotionState {
  const next = { ...input.pilot }
  const accel = powerupBalance.ship.surfaceAcceleration * input.dt
  next.vx += input.move.x * accel
  next.vy += input.move.y * accel
  if (input.o2Returning) {
    const toShip = norm(input.ship.x - next.x, input.ship.y - next.y)
    next.vx += toShip.x * powerupBalance.ship.surfaceReturnAcceleration * input.dt
    next.vy += toShip.y * powerupBalance.ship.surfaceReturnAcceleration * input.dt
    next.facing = Math.atan2(toShip.y, toShip.x)
  }
  const speed = len(next.vx, next.vy)
  const maxSpeed = powerupBalance.ship.surfaceMaxSpeedBase + input.engineRank * powerupBalance.ship.surfaceMaxSpeedPerEngineRank
  if (speed > maxSpeed) {
    next.vx = (next.vx / speed) * maxSpeed
    next.vy = (next.vy / speed) * maxSpeed
  }
  next.vx *= Math.pow(0.04, input.dt)
  next.vy *= Math.pow(0.04, input.dt)
  next.x = clamp(next.x + next.vx * input.dt, 40, input.world.width - 40)
  next.y = clamp(next.y + next.vy * input.dt, 40, input.world.height - 40)
  if (Math.abs(input.move.x) + Math.abs(input.move.y) > 0.05) next.facing = Math.atan2(input.move.y, input.move.x)
  return next
}
