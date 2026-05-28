import type { SimPolicyId } from './sim-types'

export interface SimBalanceTarget {
  medianSurvivalMin: number
  medianSurvivalMax: number
  destroyedRateMax: number
  averagePlanetsMin: number
  zeroPlanetRunRateMax: number
  averageNodesMin: number
  medianFinalClearMin: number
  routeTemplateVarietyMin: number
  planetArchetypeVarietyMin: number
}

export const simBalanceTargets: Record<SimPolicyId, SimBalanceTarget> = {
  balanced: {
    medianSurvivalMin: 240,
    medianSurvivalMax: 1200,
    destroyedRateMax: 0.65,
    averagePlanetsMin: 1.2,
    zeroPlanetRunRateMax: 0.2,
    averageNodesMin: 1.5,
    medianFinalClearMin: 720,
    routeTemplateVarietyMin: 4,
    planetArchetypeVarietyMin: 3
  },
  survival: {
    medianSurvivalMin: 360,
    medianSurvivalMax: 1500,
    destroyedRateMax: 0.5,
    averagePlanetsMin: 0.8,
    zeroPlanetRunRateMax: 0.45,
    averageNodesMin: 1.5,
    medianFinalClearMin: 720,
    routeTemplateVarietyMin: 4,
    planetArchetypeVarietyMin: 2
  },
  planetHunter: {
    medianSurvivalMin: 240,
    medianSurvivalMax: 1200,
    destroyedRateMax: 0.7,
    averagePlanetsMin: 2.5,
    zeroPlanetRunRateMax: 0.08,
    averageNodesMin: 1.2,
    medianFinalClearMin: 660,
    routeTemplateVarietyMin: 4,
    planetArchetypeVarietyMin: 4
  },
  greedyCache: {
    medianSurvivalMin: 180,
    medianSurvivalMax: 1100,
    destroyedRateMax: 0.8,
    averagePlanetsMin: 1.8,
    zeroPlanetRunRateMax: 0.2,
    averageNodesMin: 1,
    medianFinalClearMin: 660,
    routeTemplateVarietyMin: 4,
    planetArchetypeVarietyMin: 3
  },
  routeRusher: {
    medianSurvivalMin: 220,
    medianSurvivalMax: 1200,
    destroyedRateMax: 0.7,
    averagePlanetsMin: 0.3,
    zeroPlanetRunRateMax: 0.55,
    averageNodesMin: 2,
    medianFinalClearMin: 600,
    routeTemplateVarietyMin: 4,
    planetArchetypeVarietyMin: 2
  },
  stress: {
    medianSurvivalMin: 60,
    medianSurvivalMax: 900,
    destroyedRateMax: 1,
    averagePlanetsMin: 0.2,
    zeroPlanetRunRateMax: 0.65,
    averageNodesMin: 0.8,
    medianFinalClearMin: 0,
    routeTemplateVarietyMin: 3,
    planetArchetypeVarietyMin: 2
  }
}
