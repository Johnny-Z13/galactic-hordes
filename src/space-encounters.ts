import type { SpaceEnemyKind } from './game-balance'

export type SpaceEncounterKind = 'meteorFront' | 'hunterWing' | 'derelictCache'
export type EncounterPlanetArchetype = 'hostile' | 'repair' | 'relic' | 'cache' | 'strange' | 'lore' | 'horde'

interface PlayerMotion {
  x: number
  y: number
  vx: number
  vy: number
  angle: number
}

interface EncounterContext {
  time: number
  planetsVisited: number
  nearbyPlanetArchetype?: EncounterPlanetArchetype
}

export interface EncounterWeights {
  meteorFront: number
  hunterWing: number
  derelictCache: number
}

export interface MeteorAsteroidPlan {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  spin: number
  life: number
}

export interface HunterWingPoint {
  kind: Extract<SpaceEnemyKind, 'razor' | 'skimmer' | 'lancer'>
  x: number
  y: number
}

export interface DerelictCacheSignal {
  x: number
  y: number
  guardians: SpaceEnemyKind[]
  pickupKind: 'chest'
}

const ENCOUNTER_MIN_GAP_SECONDS = 55
const ENCOUNTER_RANDOM_GAP_SECONDS = 30
const METEOR_FRONT_COUNT = 7
const HUNTER_WING_KINDS: HunterWingPoint['kind'][] = ['razor', 'skimmer', 'lancer', 'razor', 'skimmer']

export const nextSpaceEncounterTime = (now: number, random: () => number = Math.random) => (
  now + ENCOUNTER_MIN_GAP_SECONDS + Math.round(random() * ENCOUNTER_RANDOM_GAP_SECONDS)
)

export const spaceEncounterWeights = (context: EncounterContext): EncounterWeights => {
  const pressure = Math.min(2.2, 1 + context.time / 420 + context.planetsVisited * 0.12)
  const weights: EncounterWeights = {
    meteorFront: 1.15 * pressure,
    hunterWing: 1 * pressure,
    derelictCache: 0.9 + context.planetsVisited * 0.16
  }

  if (context.nearbyPlanetArchetype === 'hostile' || context.nearbyPlanetArchetype === 'horde') weights.hunterWing += 2.1
  if (context.nearbyPlanetArchetype === 'cache' || context.nearbyPlanetArchetype === 'repair') weights.derelictCache += 2.2
  if (context.nearbyPlanetArchetype === 'strange' || context.nearbyPlanetArchetype === 'relic' || context.nearbyPlanetArchetype === 'lore') weights.meteorFront += 1.85

  return weights
}

export const chooseSpaceEncounter = (context: EncounterContext, random: () => number = Math.random): SpaceEncounterKind => {
  const weights = spaceEncounterWeights(context)
  const entries: Array<[SpaceEncounterKind, number]> = [
    ['hunterWing', weights.hunterWing],
    ['derelictCache', weights.derelictCache],
    ['meteorFront', weights.meteorFront]
  ]
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = random() * total
  for (const [kind, weight] of entries) {
    roll -= weight
    if (roll <= 0) return kind
  }
  return 'meteorFront'
}

const travelAngle = (player: PlayerMotion) => {
  const speed = Math.hypot(player.vx, player.vy)
  return speed > 24 ? Math.atan2(player.vy, player.vx) : player.angle
}

export const meteorFrontAsteroids = ({
  player,
  random = Math.random
}: {
  player: PlayerMotion
  random?: () => number
}): MeteorAsteroidPlan[] => {
  const angle = travelAngle(player)
  const forward = { x: Math.cos(angle), y: Math.sin(angle) }
  const side = { x: -forward.y, y: forward.x }
  const centerDistance = 860
  const spacing = 178
  const driftSpeed = 115 + random() * 50
  const baseX = player.x + forward.x * centerDistance
  const baseY = player.y + forward.y * centerDistance

  return Array.from({ length: METEOR_FRONT_COUNT }, (_, index) => {
    const offset = (index - (METEOR_FRONT_COUNT - 1) / 2) * spacing
    const jitter = (random() - 0.5) * 54
    const radius = 54 + random() * 40
    return {
      x: baseX + side.x * (offset + jitter),
      y: baseY + side.y * (offset + jitter),
      vx: -forward.x * 38 + side.x * driftSpeed,
      vy: -forward.y * 38 + side.y * driftSpeed,
      radius,
      spin: (random() - 0.5) * 1.8,
      life: 18
    }
  })
}

export const hunterWingFormation = ({
  player,
  random = Math.random
}: {
  player: PlayerMotion
  random?: () => number
}): HunterWingPoint[] => {
  const angle = travelAngle(player)
  const forward = { x: Math.cos(angle), y: Math.sin(angle) }
  const side = { x: -forward.y, y: forward.x }
  const centerDistance = 780
  const spread = 145
  const arc = 56
  return HUNTER_WING_KINDS.map((kind, index) => {
    const offset = index - (HUNTER_WING_KINDS.length - 1) / 2
    const jitter = (random() - 0.5) * 28
    const distance = centerDistance + Math.abs(offset) * arc
    return {
      kind,
      x: player.x + forward.x * distance + side.x * (offset * spread + jitter),
      y: player.y + forward.y * distance + side.y * (offset * spread + jitter)
    }
  })
}

export const derelictCacheSignal = ({
  player,
  random = Math.random
}: {
  player: PlayerMotion
  random?: () => number
}): DerelictCacheSignal => {
  const angle = travelAngle(player)
  const forward = { x: Math.cos(angle), y: Math.sin(angle) }
  const sideSign = random() < 0.5 ? -1 : 1
  const side = { x: -forward.y * sideSign, y: forward.x * sideSign }
  const distance = 900 + random() * 180
  const lateral = 300 + random() * 170
  return {
    x: player.x + forward.x * distance + side.x * lateral,
    y: player.y + forward.y * distance + side.y * lateral,
    guardians: ['mine', 'shooter', 'brute'],
    pickupKind: 'chest'
  }
}
