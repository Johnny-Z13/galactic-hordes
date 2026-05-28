import { scaledSurfaceHp, surfaceThreatBalance } from '../game-balance'
import { hashString, TAU } from '../math-utils'
import {
  planetBossCatalogVariants,
  surfaceRunBalance,
  surfaceThreatMotionBalance,
  type SurfaceThreatBehavior
} from '../surface-balance'
import type { SurfaceEventKind } from '../surface-encounters'
import { safeSurfaceThreatPoint, type SurfaceThreatKeepout } from './threat-placement'

export interface SurfaceThreatModel {
  x: number
  y: number
  vx: number
  vy: number
  hp: number
  radius: number
  phase: number
  color: string
  hit: number
  sprite?: 'glassMiteOracle' | 'bossCatalog'
  spriteRow?: number
  boss?: boolean
  behavior?: SurfaceThreatBehavior
  behaviorCooldown?: number
}

export interface SurfaceThreatDiscovery {
  id: string
  title: string
  detail: string
  source: string
  color: string
}

interface SurfaceThreatPlanet {
  id: string
  name: string
}

type RandomRange = (min: number, max: number) => number

export function createGenericSurfaceThreat(input: {
  planet: SurfaceThreatPlanet
  event: SurfaceEventKind
  index: number
  total: number
  keepouts: SurfaceThreatKeepout[]
  time: number
  randomRange: RandomRange
}): { threat: SurfaceThreatModel; discovery: SurfaceThreatDiscovery } {
  const { planet, event, index, total, keepouts, time, randomRange } = input
  const a = (index / Math.max(1, total)) * TAU + randomRange(-0.25, 0.25)
  const placement = surfaceRunBalance.threatPlacement
  const r = event === 'horde'
    ? randomRange(placement.hordeDistanceMin, placement.hordeDistanceMax)
    : event === 'swarm'
      ? randomRange(placement.swarmDistanceMin, placement.swarmDistanceMax)
      : randomRange(placement.defaultDistanceMin, placement.defaultDistanceMax)
  const point = safeSurfaceThreatPoint({
    x: surfaceRunBalance.world.ship.x + 20 + Math.cos(a) * r,
    y: surfaceRunBalance.world.ship.y + Math.sin(a) * r
  }, keepouts, event === 'swarm' || event === 'horde' ? placement.swarmClearance : placement.defaultClearance, a)
  const id = event === 'horde'
    ? 'enemy:surface:horde'
    : event === 'swarm'
      ? 'enemy:surface:swarm'
      : planet.name === 'NULL CATHEDRAL'
        ? 'enemy:surface:null-cathedral'
        : 'enemy:surface:standard'
  const title = event === 'horde'
    ? 'Horde Larva'
    : event === 'swarm'
      ? 'Swarm Skitterer'
      : planet.name === 'NULL CATHEDRAL'
        ? 'Cathedral Sentinel'
        : 'Surface Crawler'
  const color = event === 'horde' ? '#ff61d8' : planet.name === 'RED MERCY' || planet.name === 'NULL CATHEDRAL' ? '#ff5d73' : '#fff27a'
  return {
    discovery: {
      id,
      title,
      detail: `${planet.name} surface contact.`,
      source: 'Planet surface telemetry',
      color
    },
    threat: {
      x: point.x,
      y: point.y,
      vx: 0,
      vy: 0,
      hp: scaledSurfaceHp(
        event === 'horde'
          ? surfaceThreatBalance.generic.hordeBaseHp + time * surfaceThreatBalance.generic.hordeHpPerSecond
          : event === 'swarm'
            ? surfaceThreatBalance.generic.swarmBaseHp + time * surfaceThreatBalance.generic.swarmHpPerSecond
            : planet.name === 'NULL CATHEDRAL'
              ? surfaceThreatBalance.generic.specialBaseHp
              : surfaceThreatBalance.generic.baseHp
      ),
      radius: event === 'horde'
        ? surfaceThreatBalance.generic.hordeRadius
        : event === 'swarm'
          ? surfaceThreatBalance.generic.swarmRadius
          : planet.name === 'NULL CATHEDRAL'
            ? surfaceThreatBalance.generic.specialRadius
            : surfaceThreatBalance.generic.radius,
      phase: randomRange(0, TAU),
      color,
      hit: 0,
      behavior: 'chaser'
    }
  }
}

export function createPlanetBossThreat(input: {
  planet: SurfaceThreatPlanet
  crowded: boolean
  keepouts: SurfaceThreatKeepout[]
  time: number
  level: number
  planetsVisited: number
  randomRange: RandomRange
}): { threat: SurfaceThreatModel; discovery: SurfaceThreatDiscovery } {
  const { planet, crowded, keepouts, time, level, planetsVisited, randomRange } = input
  const seed = hashString(planet.id, planetsVisited + Math.floor(time / 60))
  const row = seed % planetBossCatalogVariants.length
  const variant = planetBossCatalogVariants[row]
  const angle = ((seed >>> 4) / 0xfffffff) * TAU
  const distance = crowded ? randomRange(280, 420) : randomRange(170, 320)
  const point = safeSurfaceThreatPoint({
    x: surfaceRunBalance.world.ship.x + 20 + Math.cos(angle) * distance,
    y: surfaceRunBalance.world.ship.y + Math.sin(angle) * distance
  }, keepouts, surfaceRunBalance.threatPlacement.bossClearance, angle)
  return {
    discovery: {
      id: `enemy:surface:boss:${row}`,
      title: variant.title,
      detail: `${planet.name} ${variant.note}.`,
      source: 'Boss catalog telemetry',
      color: variant.color
    },
    threat: {
      x: point.x,
      y: point.y,
      vx: 0,
      vy: 0,
      hp: scaledSurfaceHp(surfaceThreatBalance.boss.baseHp + time * surfaceThreatBalance.boss.hpPerSecond + level * surfaceThreatBalance.boss.hpPerLevel),
      radius: surfaceThreatBalance.boss.radius,
      phase: randomRange(0, TAU),
      color: variant.color,
      hit: 0,
      sprite: 'bossCatalog',
      spriteRow: row,
      boss: true,
      behavior: variant.behavior,
      behaviorCooldown: randomRange(surfaceThreatMotionBalance.blink.cooldownMin, surfaceThreatMotionBalance.blink.cooldownMax)
    }
  }
}

export function createGlassMiteOracleThreat(input: {
  keepouts: SurfaceThreatKeepout[]
  time: number
  randomRange: RandomRange
}): { threat: SurfaceThreatModel; discovery: SurfaceThreatDiscovery } {
  const { keepouts, time, randomRange } = input
  const point = safeSurfaceThreatPoint(
    { x: randomRange(990, 1080), y: randomRange(760, 880) },
    keepouts,
    surfaceRunBalance.threatPlacement.oracleClearance,
    Math.PI * 0.25
  )
  return {
    discovery: {
      id: 'enemy:surface:oracle',
      title: 'Glass Mite Oracle',
      detail: 'Rare crystalline oracle encountered on a strange surface.',
      source: 'Planet surface telemetry',
      color: '#57fff3'
    },
    threat: {
      x: point.x,
      y: point.y,
      vx: 0,
      vy: 0,
      hp: scaledSurfaceHp(surfaceThreatBalance.oracle.baseHp + time * surfaceThreatBalance.oracle.hpPerSecond),
      radius: surfaceThreatBalance.oracle.radius,
      phase: randomRange(0, TAU),
      color: '#57fff3',
      hit: 0,
      sprite: 'glassMiteOracle',
      behavior: 'chaser'
    }
  }
}
