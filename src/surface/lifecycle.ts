import { runBalance } from '../run-balance'

export type SurfaceInteractionAction = 'takeoff' | 'inspectLore' | 'openAlien' | null

export function advanceSurfaceOxygen(input: {
  oxygen: number
  maxOxygen: number
  o2Returning: boolean
  dt: number
  lowOxygenRatio: number
}): { oxygen: number; o2Returning: boolean; lowTriggered: boolean; depleted: boolean } {
  const oxygen = Math.max(0, input.oxygen - input.dt)
  const o2Returning = input.o2Returning || oxygen <= input.maxOxygen * input.lowOxygenRatio
  return {
    oxygen,
    o2Returning,
    lowTriggered: o2Returning && !input.o2Returning,
    depleted: oxygen <= 0
  }
}

export function surfaceInteractionAction(input: {
  o2Returning: boolean
  nearShip: boolean
  interact: boolean
  nearbyLore: boolean
  nearbyAlien: boolean
}): SurfaceInteractionAction {
  if (input.o2Returning && input.nearShip) return 'takeoff'
  if (!input.interact) return null
  if (input.nearbyLore) return 'inspectLore'
  if (input.nearbyAlien) return 'openAlien'
  if (input.nearShip) return 'takeoff'
  return null
}

export function surfaceTakeoffRequest(input: {
  pendingUpgrades: number
  urgent?: boolean
  skipWorkbench?: boolean
}): { action: 'openWorkbench' } | { action: 'startTakeoff'; duration: number; toast: string } {
  if (input.pendingUpgrades > 0 && !input.urgent && !input.skipWorkbench) return { action: 'openWorkbench' }
  return {
    action: 'startTakeoff',
    duration: 1.2,
    toast: input.urgent ? 'O2 LOW - RETURNING TO SHIP' : 'RETURNING TO ORBIT'
  }
}

export function surfaceTransitionProgress(input: {
  timer: number
  duration: number
}): { snapToOrbit: boolean; complete: boolean } {
  return {
    snapToOrbit: input.timer >= input.duration * 0.5,
    complete: input.timer >= input.duration
  }
}

export function surfaceExtractionScore(input: {
  firstVisit: boolean
  collected: number
}): number {
  return input.firstVisit
    ? runBalance.landing.surfaceExtractScoreBase + input.collected * runBalance.landing.surfaceExtractScorePerResource
    : input.collected * runBalance.landing.surfaceRevisitScorePerResource
}
