import { surfaceRunBalance, surfaceResourceValue } from '../surface-balance'
import { planSurfaceEncounter, type PlanetArchetype, type SurfaceEventKind, type SurfaceScenarioKind } from '../surface-encounters'
import type { SimRng } from './sim-rng'
import type { SimDifficulty, SimEconomyState } from './sim-types'
import type { SimPolicy } from './sim-policies'

export interface SimSurfaceVisitResult {
  event: SurfaceEventKind
  scenario: SurfaceScenarioKind
  damageTaken: number
  resources: SimEconomyState
  discoveries: number
  threatCount: number
}

const difficultySurfacePressure = {
  testEasy: 0.7,
  normal: 1,
  stress: 1.28
} as const satisfies Record<SimDifficulty, number>

export function simulateSurfaceVisit(input: {
  archetype: PlanetArchetype
  policy: SimPolicy
  rng: SimRng
  seconds: number
  landingIndex: number
  luck: number
  survey: number
  difficulty: SimDifficulty
}): SimSurfaceVisitResult {
  const profile = planSurfaceEncounter({
    planetArchetype: input.archetype,
    firstRunLanding: input.landingIndex === 0,
    firstVisitToPlanet: true,
    interest: Math.min(1, input.seconds / surfaceRunBalance.interest.timeDivisor + input.landingIndex * surfaceRunBalance.interest.perPlanet),
    time: input.seconds,
    luck: input.luck,
    survey: input.survey,
    random: input.rng.next
  })

  const cacheValue = profile.event === 'jackpot' ? 1.4 : profile.event === 'horde' ? 1.8 : profile.event === 'relic' ? 1.2 : 1
  const greedValue = 0.75 + input.policy.cacheGreed * 0.55
  const resources = {
    scrap: Math.round(profile.resourceCount * surfaceResourceValue('scrap', profile.event) * 0.09 * cacheValue * greedValue),
    crystal: Math.round(profile.resourceCount * surfaceResourceValue('crystal', profile.event) * 0.12 * cacheValue),
    cores: profile.bossCacheCount > 0 && input.rng.chance(0.08 + input.policy.cacheGreed * 0.08) ? 1 : 0,
    mutationSignals: input.rng.chance(0.28 + input.policy.cacheGreed * 0.25 + input.survey * 0.02) ? 1 : 0
  }
  const threatPressure = (profile.threatCount + profile.bossCount * 4) * difficultySurfacePressure[input.difficulty]
  const damageTaken = Math.max(0, Math.round(threatPressure * (1.25 + input.policy.cacheGreed * 1.05 - input.policy.survivalUpgradeBias * 0.55)))
  const discoveries = 1 + profile.alienCount + profile.loreSiteCount + profile.bossCount

  return {
    event: profile.event,
    scenario: profile.scenario,
    damageTaken,
    resources,
    discoveries,
    threatCount: profile.threatCount + profile.bossCount
  }
}
