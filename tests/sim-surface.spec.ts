import { expect, test } from '@playwright/test'
import { createSimRng } from '../src/sim/sim-rng'
import { simPolicies } from '../src/sim/sim-policies'
import { simulateSurfaceVisit } from '../src/sim/sim-surface'

test('greedy cache earns more surface resources with more damage than survival', () => {
  const survival = simulateSurfaceVisit({
    archetype: 'cache',
    policy: simPolicies.survival,
    rng: createSimRng(50),
    seconds: 500,
    landingIndex: 1,
    luck: 0,
    survey: 0,
    difficulty: 'normal'
  })
  const greedy = simulateSurfaceVisit({
    archetype: 'cache',
    policy: simPolicies.greedyCache,
    rng: createSimRng(50),
    seconds: 500,
    landingIndex: 1,
    luck: 0,
    survey: 0,
    difficulty: 'normal'
  })

  expect(greedy.resources.scrap).toBeGreaterThan(survival.resources.scrap)
  expect(greedy.damageTaken).toBeGreaterThanOrEqual(survival.damageTaken)
})

test('opening landing returns a friendly scenario through the real encounter planner', () => {
  const visit = simulateSurfaceVisit({
    archetype: 'hostile',
    policy: simPolicies.balanced,
    rng: createSimRng(88),
    seconds: 40,
    landingIndex: 0,
    luck: 0,
    survey: 0,
    difficulty: 'normal'
  })

  expect(visit.scenario).toBe('friendly')
  expect(visit.resources.scrap).toBeGreaterThan(0)
})
