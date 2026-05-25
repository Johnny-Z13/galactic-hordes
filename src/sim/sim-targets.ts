import type { SimPolicyId } from './sim-types'

export interface SimBalanceTarget {
  medianSurvivalMin: number
  medianSurvivalMax: number
  destroyedRateMax: number
  averagePlanetsMin: number
  averageNodesMin: number
  routeTemplateVarietyMin: number
  planetArchetypeVarietyMin: number
}

export const simBalanceTargets: Record<SimPolicyId, SimBalanceTarget> = {
  balanced: {
    medianSurvivalMin: 240,
    medianSurvivalMax: 1200,
    destroyedRateMax: 0.65,
    averagePlanetsMin: 1.2,
    averageNodesMin: 1.5,
    routeTemplateVarietyMin: 4,
    planetArchetypeVarietyMin: 3
  },
  survival: {
    medianSurvivalMin: 360,
    medianSurvivalMax: 1500,
    destroyedRateMax: 0.5,
    averagePlanetsMin: 0.8,
    averageNodesMin: 1.5,
    routeTemplateVarietyMin: 4,
    planetArchetypeVarietyMin: 2
  },
  planetHunter: {
    medianSurvivalMin: 240,
    medianSurvivalMax: 1200,
    destroyedRateMax: 0.7,
    averagePlanetsMin: 2.5,
    averageNodesMin: 1.2,
    routeTemplateVarietyMin: 4,
    planetArchetypeVarietyMin: 4
  },
  greedyCache: {
    medianSurvivalMin: 180,
    medianSurvivalMax: 1100,
    destroyedRateMax: 0.8,
    averagePlanetsMin: 1.8,
    averageNodesMin: 1,
    routeTemplateVarietyMin: 4,
    planetArchetypeVarietyMin: 3
  },
  routeRusher: {
    medianSurvivalMin: 220,
    medianSurvivalMax: 1200,
    destroyedRateMax: 0.7,
    averagePlanetsMin: 0.3,
    averageNodesMin: 2,
    routeTemplateVarietyMin: 4,
    planetArchetypeVarietyMin: 2
  },
  stress: {
    medianSurvivalMin: 60,
    medianSurvivalMax: 900,
    destroyedRateMax: 0.95,
    averagePlanetsMin: 0.2,
    averageNodesMin: 0.8,
    routeTemplateVarietyMin: 3,
    planetArchetypeVarietyMin: 2
  }
}
