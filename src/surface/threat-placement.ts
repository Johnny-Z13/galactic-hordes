import type { Vec } from '../main-types'
import { surfaceRunBalance } from '../surface-balance'
import { surfacePilotSpawnKeepout } from '../surface-pilot'
import { surfaceThreatSpawnPoint } from '../surface-spawn'

export interface SurfaceThreatKeepout {
  x: number
  y: number
  radius: number
}

export function surfaceThreatKeepouts(pilot: Vec, ship: Vec): SurfaceThreatKeepout[] {
  return [
    { x: pilot.x, y: pilot.y, radius: surfacePilotSpawnKeepout() },
    { x: ship.x, y: ship.y, radius: surfaceRunBalance.threatPlacement.shipKeepoutRadius }
  ]
}

export function safeSurfaceThreatPoint(
  candidate: Vec,
  keepouts: SurfaceThreatKeepout[],
  clearance: number = surfaceRunBalance.threatPlacement.safeDefaultClearance,
  fallbackAngle = 0
) {
  const world = surfaceRunBalance.world
  return surfaceThreatSpawnPoint(
    candidate,
    keepouts,
    { minX: world.threatMinX, maxX: world.threatMaxX, minY: world.threatMinY, maxY: world.threatMaxY },
    clearance,
    fallbackAngle
  )
}
