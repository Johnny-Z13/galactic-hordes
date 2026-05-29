import { damageFeedbackConfig } from './combat/damage-feedback'

export const introHookConfig = {
  waypoint: {
    durationSeconds: 30,
    showOffscreenArrow: true,
    fontPx: 14,
    color: '#fff27a'
  },
  popup: { lifeSeconds: 0.6, riseSpeed: 40, fontPx: 13, cap: 60, color: '#fff27a' },
  hitFlash: damageFeedbackConfig.hitFlash,
  hitstop: { durationSeconds: 0.04, giantKindsOnly: true },
  magnetGlint: { frameInterval: 6, particleSpeed: 18, color: '#57fff3' },
  safeDriftFirstNode: { spawnMultiplier: 1.25, extraStartingSpawns: 2 },
  firstPlanetPayoff: { cacheMultiplier: 1.4, guaranteedRelic: true, extraLoreSites: 1 }
} as const

export { hitFlashColor } from './combat/damage-feedback'

export function introSafeDriftStartingSpawns<T>(base: readonly T[]): T[] {
  const spawns = [...base]
  if (base.length === 0) return spawns
  for (let i = 0; i < introHookConfig.safeDriftFirstNode.extraStartingSpawns; i += 1) {
    spawns.push(base[i % base.length])
  }
  return spawns
}

export function introSafeDriftSpawnMultiplier(base: number): number {
  return base * introHookConfig.safeDriftFirstNode.spawnMultiplier
}

export interface IsFirstEverRunInput {
  planets: number
  hasDebrief: boolean
}

export function isFirstEverRun(input: IsFirstEverRunInput): boolean {
  return input.planets === 0 && !input.hasDebrief
}

export interface WaypointPlanetCandidate {
  id: string
  x: number
  y: number
}

export function pickWaypointTarget<T extends WaypointPlanetCandidate>(
  planets: readonly T[],
  player: { x: number; y: number }
): T | null {
  if (planets.length === 0) return null
  let best: T | null = null
  let bestD = Number.POSITIVE_INFINITY
  for (const p of planets) {
    const dx = p.x - player.x
    const dy = p.y - player.y
    const d2 = dx * dx + dy * dy
    if (d2 < bestD) {
      bestD = d2
      best = p
    }
  }
  return best
}
