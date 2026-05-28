import { pickSurfaceResourceKind, surfaceResourceValue, surfaceRunBalance, type SurfaceResourceKind } from '../surface-balance'
import type { SurfaceEventKind, SurfaceScenarioKind } from '../surface-encounters'

export interface SurfaceResourceNode {
  kind: SurfaceResourceKind
  x: number
  y: number
  radius: number
  value: number
  color: string
  collected: boolean
}

export interface SurfacePoint {
  x: number
  y: number
}

export function createSurfaceResourceNodes(input: {
  count: number
  event: SurfaceEventKind
  firstVisit: boolean
  openingLanding: boolean
  planetColor: string
  roll: () => number
  eventPoint: (index: number, count: number) => SurfacePoint
  safePoint: (point: SurfacePoint, minDistance?: number) => SurfacePoint
}): SurfaceResourceNode[] {
  const resources: SurfaceResourceNode[] = []
  for (let i = 0; i < input.count; i += 1) {
    const kind = pickSurfaceResourceKind({
      index: i,
      firstVisit: input.firstVisit,
      openingLanding: input.openingLanding,
      event: input.event,
      roll: input.roll()
    })
    const cluster = input.safePoint(
      input.eventPoint(i, input.count),
      kind === 'cache' ? surfaceRunBalance.resource.cacheSafeDistance : surfaceRunBalance.resource.defaultSafeDistance
    )
    resources.push({
      kind,
      x: cluster.x,
      y: cluster.y,
      radius: kind === 'cache' ? surfaceRunBalance.resource.radius.cache : surfaceRunBalance.resource.radius.default,
      value: surfaceResourceValue(kind, input.event),
      color: surfaceResourceColor(kind, input.planetColor),
      collected: false
    })
  }
  return resources
}

function surfaceResourceColor(kind: SurfaceResourceKind, planetColor: string): string {
  if (kind === 'cache') return '#fff27a'
  if (kind === 'crystal') return planetColor
  if (kind === 'scrap') return '#70a8ff'
  return '#8fff7d'
}

export function surfaceEventMessage(event: SurfaceEventKind, first: boolean, scenario?: SurfaceScenarioKind): string {
  if (scenario === 'lore') return 'QUIET RUINS BELOW. INSPECT THE OLD SIGNALS.'
  if (scenario === 'boss') return 'LARGE BIO-SIGNAL BELOW. KILL IT OR RUN.'
  if (scenario === 'friendly') return 'SINGLE LIFEFORM HAILING YOUR SUIT. APPROACH CAREFULLY.'
  if (scenario === 'mixed') return 'WEIRD SURFACE. CONTACTS AND A RARE SIGNAL SHARE THE SAME GROUND.'
  if (scenario === 'horde') return 'HORDE VAULT BELOW. SURVIVE IT AND THE TREASURE BREAKS OPEN.'
  if (event === 'jackpot') return 'SIGNAL JACKPOT. GRAB EVERYTHING.'
  if (event === 'horde') return 'HORDE VAULT. THE LOOT IS REAL. SO ARE THEY.'
  if (event === 'swarm') return 'BAD PLANET. CONTACTS EVERYWHERE.'
  if (event === 'relic') return 'RELIC SIGNATURES BELOW. CACHE HUNT.'
  if (event === 'repair') return 'QUIET DOCK. PATCH UP AND SCAVENGE.'
  if (event === 'volatile') return 'VOLATILE CACHE FIELD. EXPECT TROUBLE.'
  return first ? 'UNKNOWN SURFACE. MINE THE SIGNAL CACHE.' : 'OLD LANDING SITE. QUICK SALVAGE ONLY.'
}
