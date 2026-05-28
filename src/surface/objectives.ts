import { bossCacheValue, surfaceRunBalance, type SurfaceResourceKind } from '../surface-balance'
import type { SurfaceScenarioKind } from '../surface-encounters'
import { TAU } from '../math-utils'

export interface SurfaceObjectiveResource {
  kind: SurfaceResourceKind
  x: number
  y: number
  radius: number
  value: number
  color: string
  collected: boolean
}

export interface SurfaceObjectiveThreat {
  x: number
  y: number
  vx: number
  vy: number
  hp: number
  radius: number
  phase: number
  color: string
  hit: number
  behavior?: 'chaser'
}

export interface SurfacePoint {
  x: number
  y: number
}

export function collectTouchedSurfaceResources<T extends SurfaceObjectiveResource>(input: {
  resources: T[]
  pilot: SurfacePoint
}): T[] {
  const collected: T[] = []
  for (const resource of input.resources) {
    if (resource.collected) continue
    const rr = resource.radius + surfaceRunBalance.resource.collectionBonusRadius
    if ((resource.x - input.pilot.x) ** 2 + (resource.y - input.pilot.y) ** 2 > rr * rr) continue
    resource.collected = true
    collected.push(resource)
  }
  return collected
}

export function shouldPromptSurfaceReturn(input: {
  collected: number
  total: number
  nearShip: boolean
}): boolean {
  return input.collected >= input.total && !input.nearShip
}

export function createSurfaceBossCacheDrops(input: {
  count: number
  scenario: SurfaceScenarioKind
  level: number
  threat: { x: number; y: number; color: string }
  random: () => number
  safePoint: (point: SurfacePoint, minDistance?: number) => SurfacePoint
}): { resources: SurfaceObjectiveResource[]; message: string } {
  const resources: SurfaceObjectiveResource[] = []
  const bossCache = surfaceRunBalance.bossCache
  for (let i = 0; i < input.count; i += 1) {
    const a = (i / input.count) * TAU + randomRange(-0.2, 0.2, input.random)
    const r = randomRange(bossCache.scatterMin, bossCache.scatterMax, input.random)
    const point = input.safePoint({ x: input.threat.x + Math.cos(a) * r, y: input.threat.y + Math.sin(a) * r }, bossCache.safeDistance)
    resources.push({
      kind: i < 2 && input.scenario === 'horde' ? 'cache' : i === 0 ? 'cache' : input.random() < bossCache.crystalChance ? 'crystal' : 'scrap',
      x: point.x,
      y: point.y,
      radius: i === 0 ? surfaceRunBalance.resource.radius.cache : surfaceRunBalance.resource.radius.default,
      value: bossCacheValue(i, input.scenario, input.level),
      color: i === 0 ? '#fff27a' : i % 2 ? input.threat.color : '#70a8ff',
      collected: false
    })
  }
  return {
    resources,
    message: input.scenario === 'horde' ? 'HORDE VAULT DEFEATED. MASSIVE TREASURE SPILLED.' : 'BOSS SIGNAL BROKE OPEN. RICH CACHE SPILLED.'
  }
}

export function createSurfaceCacheAmbushThreats(input: {
  resource: SurfacePoint
  time: number
  count: number
  random: () => number
  safeThreatPoint: (point: SurfacePoint, clearance?: number, fallbackAngle?: number) => SurfacePoint
}): SurfaceObjectiveThreat[] {
  const ambush = surfaceRunBalance.cacheAmbush
  const threats: SurfaceObjectiveThreat[] = []
  for (let i = 0; i < input.count; i += 1) {
    const fallbackAngle = randomRange(0, TAU, input.random)
    const point = input.safeThreatPoint({
      x: input.resource.x + randomRange(-ambush.scatter, ambush.scatter, input.random),
      y: input.resource.y + randomRange(-ambush.scatter, ambush.scatter, input.random)
    }, ambush.clearance, fallbackAngle)
    threats.push({
      x: point.x,
      y: point.y,
      vx: 0,
      vy: 0,
      hp: ambush.hpBase + input.time * ambush.hpPerSecond,
      radius: ambush.radius,
      phase: input.random() * TAU,
      color: '#ff5d73',
      hit: 0,
      behavior: 'chaser'
    })
  }
  return threats
}

function randomRange(min: number, max: number, random: () => number): number {
  return min + random() * (max - min)
}
