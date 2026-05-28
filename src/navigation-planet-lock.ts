export interface PlanetCourseTarget {
  id: string
  name: string
  x: number
  y: number
}

export interface PlanetCourseLockInput {
  navRank: number
  pendingUpgrades: number
  navPlanetLockRank: number
  hasLockedPlanet: boolean
  stationAvailable: boolean
  planetCount: number
}

export function canLockPlanetCourse(input: PlanetCourseLockInput) {
  if (input.hasLockedPlanet || input.stationAvailable || input.planetCount <= 0) return false
  return input.pendingUpgrades > 0 || input.navRank >= input.navPlanetLockRank
}

export function nearestPlanetCourseTarget<T extends PlanetCourseTarget>(planets: T[], origin: { x: number; y: number }) {
  let best: T | null = null
  let bestD = Number.POSITIVE_INFINITY
  for (const planet of planets) {
    const dx = planet.x - origin.x
    const dy = planet.y - origin.y
    const d = dx * dx + dy * dy
    if (d < bestD) {
      bestD = d
      best = planet
    }
  }
  return best
}

export function planetCourseLockToast(input: { pendingUpgrades: number; planetName: string }) {
  return input.pendingUpgrades > 0
    ? `SIGNAL COURSE LOCKED: ${input.planetName}`
    : `NAV GHOST LOCKED: ${input.planetName}`
}
