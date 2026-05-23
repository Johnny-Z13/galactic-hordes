import type { SurfaceEventKind, SurfaceScenarioKind } from './surface-encounters'

export type SurfaceResourceKind = 'crystal' | 'scrap' | 'repair' | 'cache'

export interface SurfacePoint {
  x: number
  y: number
}

export const surfaceRunBalance = {
  world: {
    width: 1600,
    height: 1180,
    pilotStart: { x: 840, y: 660 },
    ship: { x: 780, y: 590 },
    edgePadding: 40,
    resourceSafeMinX: 110,
    resourceSafeMaxX: 1490,
    resourceSafeMinY: 110,
    resourceSafeMaxY: 1070,
    threatMinX: 40,
    threatMaxX: 1560,
    threatMinY: 40,
    threatMaxY: 1140
  },
  interest: {
    timeDivisor: 420,
    perPlanet: 0.075,
    perLevel: 0.012
  },
  resource: {
    radius: {
      cache: 18,
      default: 12
    },
    collectionBonusRadius: 18,
    cacheSafeDistance: 240,
    defaultSafeDistance: 210,
    openingScrapChance: 0.42,
    openingCrystalChance: 0.78,
    hordeGuaranteedCaches: 5,
    relicGuaranteedCaches: 3,
    jackpotCacheChance: 0.16,
    hordeCacheChance: 0.2,
    repairRepairChance: 0.55,
    volatileCacheChance: 0.24,
    crystalChance: 0.58,
    scrapChance: 0.84,
    values: {
      crystal: {
        default: 8,
        jackpot: 12,
        horde: 18
      },
      scrap: {
        default: 120,
        jackpot: 165,
        horde: 260
      },
      repair: {
        default: 18,
        repairEvent: 28
      },
      cache: 1
    }
  },
  threatPlacement: {
    defaultClearance: 132,
    swarmClearance: 150,
    bossClearance: 170,
    oracleClearance: 150,
    safeDefaultClearance: 120,
    shipKeepoutRadius: 34,
    hordeDistanceMin: 240,
    hordeDistanceMax: 620,
    swarmDistanceMin: 260,
    swarmDistanceMax: 520,
    defaultDistanceMin: 120,
    defaultDistanceMax: 440
  },
  bossCache: {
    scatterMin: 22,
    scatterMax: 96,
    safeDistance: 190,
    crystalChance: 0.65,
    hordeCrystalBase: 22,
    hordeScrapBase: 300,
    hordeScrapPerLevel: 12,
    crystalBase: 12,
    scrapBase: 150,
    scrapPerLevel: 8
  },
  cacheAmbush: {
    baseCount: 2,
    timeDivisor: 90,
    scatter: 180,
    clearance: 132,
    hpBase: 24,
    hpPerSecond: 0.25,
    radius: 14
  },
  lore: {
    crystalReward: 1,
    interactionRadiusBonus: 30
  },
  alien: {
    interactionRadiusBonus: 34,
    quietBonusChance: 0.18,
    radius: 28,
    goodGift: {
      herbHullRepair: 34,
      herbCrystals: 4,
      idolCores: 1,
      mapScore: 650,
      coinScrap: 180,
      coinCores: 1,
      coinScore: 900,
      beaconCrystals: 6,
      beaconScore: 720
    },
    badGift: {
      herbDamage: 18,
      idolDamage: 9,
      idolThreatCount: 3,
      idolThreatScatter: 150,
      idolThreatHpBase: 22,
      idolThreatHpPerSecond: 0.1,
      idolThreatRadius: 13,
      mapCrystalLoss: 8,
      coinScrapLoss: 120,
      coinDamage: 12,
      beaconDamage: 10,
      beaconOxygenLoss: 12,
      beaconMinOxygen: 6,
      beaconThreatCount: 2,
      beaconThreatScatter: 190,
      beaconThreatHpBase: 28,
      beaconThreatHpPerSecond: 0.12,
      beaconThreatRadius: 15
    }
  }
} as const

export const pickSurfaceResourceKind = ({
  index,
  firstVisit,
  openingLanding,
  event,
  roll
}: {
  index: number
  firstVisit: boolean
  openingLanding: boolean
  event: SurfaceEventKind
  roll: number
}): SurfaceResourceKind => {
  const resource = surfaceRunBalance.resource
  if (index === 0 && firstVisit) return 'cache'
  if (openingLanding) return roll < resource.openingScrapChance ? 'scrap' : roll < resource.openingCrystalChance ? 'crystal' : 'repair'
  if (event === 'horde' && index < resource.hordeGuaranteedCaches) return 'cache'
  if (event === 'relic' && index < resource.relicGuaranteedCaches) return 'cache'
  if (event === 'jackpot' && roll < resource.jackpotCacheChance) return 'cache'
  if (event === 'horde' && roll < resource.hordeCacheChance) return 'cache'
  if (event === 'repair' && roll < resource.repairRepairChance) return 'repair'
  if (event === 'volatile' && roll < resource.volatileCacheChance) return 'cache'
  if (roll < resource.crystalChance) return 'crystal'
  if (roll < resource.scrapChance) return 'scrap'
  return 'repair'
}

export const surfaceResourceValue = (kind: SurfaceResourceKind, event: SurfaceEventKind) => {
  const values = surfaceRunBalance.resource.values
  if (kind === 'cache') return values.cache
  if (kind === 'crystal') return event === 'horde' ? values.crystal.horde : event === 'jackpot' ? values.crystal.jackpot : values.crystal.default
  if (kind === 'scrap') return event === 'horde' ? values.scrap.horde : event === 'jackpot' ? values.scrap.jackpot : values.scrap.default
  return event === 'repair' ? values.repair.repairEvent : values.repair.default
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const surfaceEventPoint = (
  event: SurfaceEventKind,
  index: number,
  count: number,
  random: (min: number, max: number) => number
): SurfacePoint => {
  const world = surfaceRunBalance.world
  const center = surfaceRunBalance.world.ship
  if (event === 'jackpot') {
    const angle = (index / count) * Math.PI * 2 * 3
    const radius = 60 + index * 8
    return {
      x: clamp(center.x + 20 + Math.cos(angle) * radius + random(-18, 18), world.resourceSafeMinX, world.resourceSafeMaxX),
      y: clamp(center.y + Math.sin(angle) * radius + random(-18, 18), world.resourceSafeMinY, world.resourceSafeMaxY)
    }
  }
  if (event === 'horde') {
    const angle = (index / Math.max(1, count)) * Math.PI * 2 * 2.4
    const radius = 120 + index * 7
    return {
      x: clamp(center.x + 20 + Math.cos(angle) * radius + random(-32, 32), 120, 1480),
      y: clamp(center.y + Math.sin(angle) * radius + random(-32, 32), 120, 1060)
    }
  }
  if (event === 'swarm') return { x: random(220, 1380), y: random(190, 990) }
  if (event === 'repair') return { x: random(560, 1040), y: random(400, 780) }
  if (event === 'relic') {
    const angle = (index / Math.max(1, count)) * Math.PI * 2
    return {
      x: clamp(center.x + 20 + Math.cos(angle) * random(80, 360), 130, 1470),
      y: clamp(center.y + Math.sin(angle) * random(80, 360), 130, 1050)
    }
  }
  return { x: random(180, 1420), y: random(170, 1010) }
}

export const bossCacheValue = (index: number, scenario: SurfaceScenarioKind, level: number) => {
  const bossCache = surfaceRunBalance.bossCache
  if (index === 0) return surfaceRunBalance.resource.values.cache
  if (scenario === 'horde') return index % 2 ? bossCache.hordeCrystalBase + level : bossCache.hordeScrapBase + level * bossCache.hordeScrapPerLevel
  return index % 2 ? bossCache.crystalBase + level : bossCache.scrapBase + level * bossCache.scrapPerLevel
}
