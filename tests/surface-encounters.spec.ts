import { expect, test } from '@playwright/test'
import { introHookConfig } from '../src/intro-hook'
import { planSurfaceEncounter, rollPlanetArchetype } from '../src/surface-encounters'

test('curates the first planet landing as friendly focused and inspectable', () => {
  const profile = planSurfaceEncounter({
    planetArchetype: 'cache',
    firstRunLanding: true,
    firstVisitToPlanet: true,
    interest: 0,
    time: 0,
    random: () => 0.99
  })

  expect(profile.event).toBe('relic')
  expect(profile.scenario).toBe('friendly')
  expect(profile.resourceCount).toBeGreaterThanOrEqual(Math.round(9 * introHookConfig.firstPlanetPayoff.cacheMultiplier))
  expect(profile.resourceCount).toBeLessThanOrEqual(Math.round(12 * introHookConfig.firstPlanetPayoff.cacheMultiplier))
  expect(profile.threatCount).toBeGreaterThanOrEqual(2)
  expect(profile.threatCount).toBeLessThanOrEqual(3)
  expect(profile.alienCount).toBe(1)
  expect(profile.loreSiteCount).toBe(1 + introHookConfig.firstPlanetPayoff.extraLoreSites)
})

test('keeps horde planets procedural and unavailable as the opening planet type', () => {
  expect(rollPlanetArchetype({ chunkX: 0, chunkY: 0, index: 0, random: () => 0.99 })).toBe('cache')

  const profile = planSurfaceEncounter({
    planetArchetype: 'horde',
    firstRunLanding: false,
    firstVisitToPlanet: true,
    interest: 1,
    time: 420,
    random: () => 0.1
  })

  expect(profile.event).toBe('horde')
  expect(profile.scenario).toBe('horde')
  expect(profile.resourceCount).toBeGreaterThanOrEqual(34)
  expect(profile.threatCount).toBeGreaterThanOrEqual(22)
  expect(profile.bossCount).toBe(1)
  expect(profile.bossCacheCount).toBeGreaterThanOrEqual(10)
})
