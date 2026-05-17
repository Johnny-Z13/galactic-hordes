export interface ReturnBeaconEligibilityInput {
  time: number
  planetsVisited: number
  activeBeacon: boolean
  nextBeaconAt: number
}

export const FIRST_BEACON_TIME = 300
export const BEACON_INTERVAL = 240
export const BEACON_HOLD_SECONDS = 3.2

export const returnBeaconEligible = (input: ReturnBeaconEligibilityInput) => {
  if (input.activeBeacon) return false
  if (input.planetsVisited < 1) return false
  if (input.time < FIRST_BEACON_TIME) return false
  if (input.nextBeaconAt > 0 && input.time < input.nextBeaconAt) return false
  return true
}

export const nextBeaconWindow = (currentTime: number) => currentTime + BEACON_INTERVAL

export const beaconExtractionBonus = (skippedBeacons: number) => (
  1 + Math.min(0.3, Math.max(0, skippedBeacons) * 0.1)
)

export const beaconSpawnDistance = (skippedBeacons: number) => (
  760 + Math.min(420, Math.max(0, skippedBeacons) * 110)
)
