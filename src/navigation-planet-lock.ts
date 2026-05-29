export interface PlanetCourseTarget {
  id: string
  name: string
  x: number
  y: number
}

export interface LandablePlanetCourseTarget extends PlanetCourseTarget {
  radius: number
}

export interface PlanetCourseLockInput {
  navRank: number
  pendingUpgrades: number
  navPlanetLockRank: number
  hasLockedPlanet: boolean
  stationAvailable: boolean
  planetCount: number
}

export type LandingIntent<T extends LandablePlanetCourseTarget> =
  | { action: 'land'; planet: T }
  | { action: 'returnBeacon' }
  | { action: 'lockPlanetCourse'; target: T }
  | { action: 'noSignal' }

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

export function resolveLandingIntent<T extends LandablePlanetCourseTarget>(input: {
  player: { x: number; y: number }
  planets: T[]
  returnBeaconAvailable: boolean
  navRank: number
  pendingUpgrades: number
  navPlanetLockRank: number
  hasLockedPlanet: boolean
  landingPadding?: number
}): LandingIntent<T> {
  const landingPadding = input.landingPadding ?? 86
  const planet = input.planets.find((candidate) => {
    const dx = candidate.x - input.player.x
    const dy = candidate.y - input.player.y
    const range = candidate.radius + landingPadding
    return dx * dx + dy * dy < range * range
  })
  if (planet) return { action: 'land', planet }
  if (input.returnBeaconAvailable) return { action: 'returnBeacon' }
  if (canLockPlanetCourse({
    navRank: input.navRank,
    pendingUpgrades: input.pendingUpgrades,
    navPlanetLockRank: input.navPlanetLockRank,
    hasLockedPlanet: input.hasLockedPlanet,
    stationAvailable: input.returnBeaconAvailable,
    planetCount: input.planets.length
  })) {
    const target = nearestPlanetCourseTarget(input.planets, input.player)
    if (target) return { action: 'lockPlanetCourse', target }
  }
  return { action: 'noSignal' }
}

export function planetCourseLockToast(input: { pendingUpgrades: number; planetName: string }) {
  return input.pendingUpgrades > 0
    ? `SIGNAL COURSE LOCKED: ${input.planetName}`
    : `NAV GHOST LOCKED: ${input.planetName}`
}
