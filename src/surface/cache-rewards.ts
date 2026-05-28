import { hashString } from '../math-utils'
import { powerupBalance } from '../powerup-balance'
import type { ArtifactRecord } from '../artifact-archive'
import type { SurfaceEventKind } from '../surface-encounters'

export interface SurfaceCacheBuildRanks {
  luck: number
  survey: number
  cargo: number
}

export interface SurfaceCacheReward {
  score: number
  scrap: number
  crystal: number
  cores: number
  relicIndex: number | null
  extraSignal: boolean
}

export function createSurfaceCacheArtifact(input: {
  event: SurfaceEventKind
  planet: { id: string; name: string }
  resource: { x: number; y: number }
  color: string
}): Omit<ArtifactRecord, 'count'> {
  return {
    id: 'cache:surface',
    kind: 'cache',
    title: 'Surface Cache',
    detail: `${input.event.toUpperCase()} cache cracked open.`,
    source: input.planet.name,
    color: input.color,
    icon: hashString(`${input.planet.id}:${input.resource.x}:${input.resource.y}`, 67) % 16
  }
}

export function resolveSurfaceCacheReward(input: {
  level: number
  build: SurfaceCacheBuildRanks
  missingRelicCount: number
  random: () => number
  randomRange: (min: number, max: number) => number
}): SurfaceCacheReward {
  const luck =
    input.build.luck * powerupBalance.planetCache.luckRelicChancePerRank
    + input.build.survey * powerupBalance.planetCache.surveyRelicChancePerRank
  const cargoBonus = 1 + input.build.cargo * powerupBalance.upgradeApply.cargoResourceBonusPerRank
  const relicChance = powerupBalance.planetCache.relicChanceBase + luck
  const extraSignalChance = powerupBalance.planetCache.extraSignalChanceBase + luck
  const score = Math.floor(
    (powerupBalance.planetCache.scoreBase + input.level * powerupBalance.planetCache.scorePerLevel)
    * (1 + input.build.cargo * powerupBalance.upgradeApply.cargoCacheScoreBonusPerRank)
  )
  const scrap = Math.ceil(input.randomRange(powerupBalance.planetCache.scrapMin, powerupBalance.planetCache.scrapMax) * cargoBonus)
  const crystal = Math.ceil(input.randomRange(powerupBalance.planetCache.crystalMin, powerupBalance.planetCache.crystalMax) * cargoBonus)
  const cores = powerupBalance.planetCache.coresBase + (input.build.cargo >= powerupBalance.upgradeApply.cargoCoreBonusThreshold ? powerupBalance.upgradeApply.cargoCoreBonus : 0)
  const relicIndex =
    input.missingRelicCount > 0 && input.random() < relicChance
      ? Math.floor(input.random() * input.missingRelicCount)
      : null
  return {
    score,
    scrap,
    crystal,
    cores,
    relicIndex,
    extraSignal: input.random() < extraSignalChance
  }
}

export function surfaceCacheAmbushChance(input: { surveyRank: number; hasStaticIdol: boolean }) {
  return Math.max(
    powerupBalance.planetCache.ambushChanceMin,
    powerupBalance.planetCache.ambushChanceBase
      - input.surveyRank * powerupBalance.planetCache.ambushChanceReductionPerSurveyRank
      + (input.hasStaticIdol ? powerupBalance.planetCache.staticIdolAmbushChancePenalty : 0)
  )
}
