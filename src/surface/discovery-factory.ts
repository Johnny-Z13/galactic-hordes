import { hashString, TAU } from '../math-utils'
import { planetAlienCatalogVariants, surfaceRunBalance, type AlienGiftKind } from '../surface-balance'
import type { PlanetArchetype, SurfaceEventKind, SurfaceScenarioKind } from '../surface-encounters'
import type { Vec } from '../main-types'

export interface SurfaceDiscoveryPlanet {
  id: string
  name: string
  archetype: PlanetArchetype
}

export interface SurfaceAlienModel {
  x: number
  y: number
  radius: number
  phase: number
  color: string
  name: string
  gift: AlienGiftKind
  resolved: boolean
  sprite?: 'alienCatalog'
  spriteRow?: number
}

export interface SurfaceLoreSiteModel {
  x: number
  y: number
  radius: number
  phase: number
  kind: 'fossils' | 'pyramid' | 'grave' | 'machine' | 'choir'
  title: string
  copy: string
  resolved: boolean
}

const alienGiftFallbacks: AlienGiftKind[] = ['herb', 'idol', 'coin', 'map', 'beacon']
const alienCatalogRows = planetAlienCatalogVariants.length

export function createSurfaceAliens(input: {
  planet: SurfaceDiscoveryPlanet
  event: SurfaceEventKind
  threatCount: number
  scenario: SurfaceScenarioKind
  forcedCount?: number
  surfaceInterest: number
  time: number
  random: () => number
  randomRange: (min: number, max: number) => number
}): SurfaceAlienModel[] {
  if (input.forcedCount === 0) return []
  const quiet = input.threatCount === 0
  const chance =
    input.scenario === 'friendly' ? 1 :
    input.scenario === 'mixed' ? 0.62 + input.surfaceInterest * 0.24 :
    input.event === 'swarm' ? 0.06 :
    input.event === 'volatile' ? 0.22 :
    input.event === 'repair' ? 0.72 :
    input.event === 'standard' ? 0.58 :
    input.event === 'relic' ? 0.46 :
    0.28
  if (input.forcedCount === undefined && input.random() > chance + (quiet ? surfaceRunBalance.alien.quietBonusChance : 0)) return []
  const row = hashString(input.planet.id, Math.floor(input.time) + 17) % alienCatalogRows
  const variant = planetAlienCatalogVariants[row]
  return [{
    x: input.randomRange(260, 1340),
    y: input.randomRange(210, 960),
    radius: surfaceRunBalance.alien.radius,
    phase: input.randomRange(0, TAU),
    color: variant.color,
    name: variant.name,
    gift: input.random() < 0.42 ? variant.gift : alienGiftFallbacks[Math.floor(input.random() * alienGiftFallbacks.length)],
    resolved: false,
    sprite: 'alienCatalog',
    spriteRow: row
  }]
}

export function createSurfaceLoreSites(input: {
  planet: SurfaceDiscoveryPlanet
  scenario: SurfaceScenarioKind
  event: SurfaceEventKind
  forcedCount?: number
  planetsVisited: number
  random: () => number
  randomRange: (min: number, max: number) => number
  safePoint: (point: Vec, minDistance: number) => Vec
}): SurfaceLoreSiteModel[] {
  if (input.forcedCount === 0) return []
  if (input.forcedCount === undefined && input.scenario !== 'lore' && input.event !== 'relic' && input.planet.archetype !== 'strange') return []
  const count = input.forcedCount ?? (input.scenario === 'lore' ? 2 + Math.floor(input.random() * 3) : input.random() < 0.34 ? 1 : 0)
  const sites: SurfaceLoreSiteModel[] = []
  const library = loreLibrary(input.planet)
  for (let i = 0; i < count; i += 1) {
    const entry = library[(hashString(input.planet.id, i + input.planetsVisited * 11) + i) % library.length]
    const a = (i / Math.max(1, count)) * TAU + input.randomRange(-0.42, 0.42)
    const point = input.safePoint({
      x: 800 + Math.cos(a) * input.randomRange(260, 520),
      y: 590 + Math.sin(a) * input.randomRange(220, 420)
    }, 260)
    sites.push({
      x: point.x,
      y: point.y,
      radius: entry.kind === 'pyramid' ? 36 : 30,
      phase: input.randomRange(0, TAU),
      kind: entry.kind,
      title: entry.title,
      copy: entry.copy,
      resolved: false
    })
  }
  return sites
}

function loreLibrary(planet: SurfaceDiscoveryPlanet): Array<Pick<SurfaceLoreSiteModel, 'kind' | 'title' | 'copy'>> {
  const name = planet.name
  return [
    {
      kind: 'fossils',
      title: 'FOSSIL BED',
      copy: `The fossils are arranged in spirals, not by tide but by ritual. Whatever lived on ${name} learned to count the stars before it learned to leave.`
    },
    {
      kind: 'pyramid',
      title: 'VECTOR PYRAMID',
      copy: `The pyramid has no entrance, only a black seam humming under the dust. Your suit translates one repeated phrase: "We aimed the sky at ourselves."`
    },
    {
      kind: 'grave',
      title: 'GLASS GRAVES',
      copy: `Each grave marker contains a tiny preserved storm. The names are gone, but the weather inside them still remembers the dead.`
    },
    {
      kind: 'machine',
      title: 'SLEEPING MACHINE',
      copy: `A buried engine ticks once when your shadow crosses it. It is still waiting for pilots who became fossils long before your species had radios.`
    },
    {
      kind: 'choir',
      title: 'BONE CHOIR',
      copy: `Rib-like arches vibrate when you walk between them. The song is only two notes, but your ship answers from orbit.`
    }
  ]
}
