import { surfaceRunBalance } from '../surface-balance'
import type { Vec } from '../main-types'
import { clamp, TAU } from '../math-utils'

export function safeSurfaceResourcePoint(
  point: Vec,
  randomRange: (min: number, max: number) => number,
  minDistance = 210
): Vec {
  const world = surfaceRunBalance.world
  const ship = world.ship
  const pilot = world.pilotStart
  let x = clamp(point.x, world.resourceSafeMinX, world.resourceSafeMaxX)
  let y = clamp(point.y, world.resourceSafeMinY, world.resourceSafeMaxY)
  for (let pass = 0; pass < 3; pass += 1) {
    for (const anchor of [ship, pilot]) {
      const dx = x - anchor.x
      const dy = y - anchor.y
      const distance = Math.hypot(dx, dy)
      if (distance >= minDistance) continue
      const angle = distance > 1 ? Math.atan2(dy, dx) : randomRange(0, TAU)
      const push = minDistance + randomRange(18, 96)
      x = clamp(anchor.x + Math.cos(angle) * push, world.resourceSafeMinX, world.resourceSafeMaxX)
      y = clamp(anchor.y + Math.sin(angle) * push, world.resourceSafeMinY, world.resourceSafeMaxY)
    }
  }
  return { x, y }
}
