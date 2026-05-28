import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { powerupBalance } from '../src/powerup-balance'
import {
  createSurfaceCacheArtifact,
  resolveSurfaceCacheReward,
  surfaceCacheAmbushChance
} from '../src/surface/cache-rewards'

const middleRange = (min: number, max: number) => (min + max) / 2

test('surface cache artifact metadata stays deterministic per planet and resource', () => {
  const artifact = createSurfaceCacheArtifact({
    event: 'relic',
    planet: { id: 'planet:cache', name: 'GOLD WAKE' },
    resource: { x: 320, y: 540 },
    color: '#fff27a'
  })

  expect(artifact).toMatchObject({
    id: 'cache:surface',
    kind: 'cache',
    title: 'Surface Cache',
    detail: 'RELIC cache cracked open.',
    source: 'GOLD WAKE',
    color: '#fff27a'
  })
  expect(artifact.icon).toBeGreaterThanOrEqual(0)
  expect(artifact.icon).toBeLessThan(16)
})

test('surface cache reward helper applies cargo scaling and chooses relics before signals', () => {
  const reward = resolveSurfaceCacheReward({
    level: 4,
    build: { luck: 2, survey: 1, cargo: 3 },
    missingRelicCount: 5,
    random: () => 0.2,
    randomRange: middleRange
  })
  const cargoBonus = 1 + 3 * powerupBalance.upgradeApply.cargoResourceBonusPerRank

  expect(reward.score).toBe(Math.floor(
    (powerupBalance.planetCache.scoreBase + 4 * powerupBalance.planetCache.scorePerLevel)
    * (1 + 3 * powerupBalance.upgradeApply.cargoCacheScoreBonusPerRank)
  ))
  expect(reward.scrap).toBe(Math.ceil(((powerupBalance.planetCache.scrapMin + powerupBalance.planetCache.scrapMax) / 2) * cargoBonus))
  expect(reward.crystal).toBe(Math.ceil(((powerupBalance.planetCache.crystalMin + powerupBalance.planetCache.crystalMax) / 2) * cargoBonus))
  expect(reward.cores).toBe(powerupBalance.planetCache.coresBase + powerupBalance.upgradeApply.cargoCoreBonus)
  expect(reward.relicIndex).toBe(1)
  expect(reward.extraSignal).toBe(true)
})

test('surface cache reward helper falls back to mutation signal when relic roll misses', () => {
  const reward = resolveSurfaceCacheReward({
    level: 1,
    build: { luck: 0, survey: 0, cargo: 0 },
    missingRelicCount: 3,
    random: () => 0.99,
    randomRange: middleRange
  })

  expect(reward.relicIndex).toBeNull()
  expect(reward.extraSignal).toBe(false)
})

test('surface cache ambush chance respects survey mitigation and static idol risk', () => {
  expect(surfaceCacheAmbushChance({ surveyRank: 0, hasStaticIdol: false })).toBe(powerupBalance.planetCache.ambushChanceBase)
  expect(surfaceCacheAmbushChance({ surveyRank: 99, hasStaticIdol: false })).toBe(powerupBalance.planetCache.ambushChanceMin)
  expect(surfaceCacheAmbushChance({ surveyRank: 1, hasStaticIdol: true })).toBe(
    Math.max(
      powerupBalance.planetCache.ambushChanceMin,
      powerupBalance.planetCache.ambushChanceBase
        - powerupBalance.planetCache.ambushChanceReductionPerSurveyRank
        + powerupBalance.planetCache.staticIdolAmbushChancePenalty
    )
  )
})

test('main delegates surface cache reward math to the focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain("from './surface/cache-rewards'")
  expect(main).toContain('createSurfaceCacheArtifact({')
  expect(main).toContain('resolveSurfaceCacheReward({')
  expect(main).toContain('surfaceCacheAmbushChance({')
  expect(main).not.toContain('const luck = this.build.luck * powerupBalance.planetCache.luckRelicChancePerRank')
})
