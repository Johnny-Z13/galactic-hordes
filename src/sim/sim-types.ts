import type { UpgradeId } from '../powerup-balance'
import type { SectorNodeTemplateId } from '../sector-map'
import type { PlanetArchetype, SurfaceEventKind, SurfaceScenarioKind } from '../surface-encounters'

export type SimPolicyId = 'balanced' | 'survival' | 'planetHunter' | 'greedyCache' | 'routeRusher' | 'stress'
export type SimDifficulty = 'normal' | 'testEasy' | 'stress'
export type SimOutcome = 'destroyed' | 'extracted' | 'finalCleared' | 'timeLimit'
export type SimDeathCause = 'contact' | 'projectile' | 'hazard' | 'surface' | 'attrition' | 'none'

export interface SimRunOptions {
  seed: number
  policy: SimPolicyId
  maxSeconds: number
  difficulty: SimDifficulty
}

export interface SimBatchOptions extends SimRunOptions {
  runs: number
}

export interface SimBuildState {
  upgrades: Record<UpgradeId, number>
  relicCount: number
  evolvedWeapons: number
}

export interface SimEconomyState {
  scrap: number
  crystal: number
  cores: number
  mutationSignals: number
}

export interface SimCoverageState {
  routeTemplates: Record<string, number>
  planetArchetypes: Record<string, number>
  surfaceEvents: Record<string, number>
  surfaceScenarios: Record<string, number>
  upgradesChosen: Record<string, number>
  stationServices: Record<string, number>
}

export interface SimRunResult {
  seed: number
  policy: SimPolicyId
  difficulty: SimDifficulty
  outcome: SimOutcome
  deathCause: SimDeathCause
  seconds: number
  nodesCleared: number
  finalReached: boolean
  planetsLanded: number
  stationsDocked: number
  kills: number
  damageTaken: number
  economy: SimEconomyState
  build: SimBuildState
  coverage: SimCoverageState
  events: SimEvent[]
  flags: string[]
}

export type SimEvent =
  | { t: number; kind: 'routeSelected'; templateId: SectorNodeTemplateId; label: string }
  | { t: number; kind: 'nodeCleared'; templateId: SectorNodeTemplateId; secondsInNode: number }
  | { t: number; kind: 'stationDocked'; label: string; services: string[] }
  | { t: number; kind: 'planetLanded'; archetype: PlanetArchetype; event: SurfaceEventKind; scenario: SurfaceScenarioKind }
  | { t: number; kind: 'upgradeChosen'; upgradeId: UpgradeId; rank: number }
  | { t: number; kind: 'resourceGained'; scrap: number; crystal: number; cores: number; mutationSignals: number }
  | { t: number; kind: 'damageTaken'; amount: number; cause: Exclude<SimDeathCause, 'none'> }
  | { t: number; kind: 'runEnded'; outcome: SimOutcome; deathCause: SimDeathCause }

export interface SimBatchSummary {
  options: SimBatchOptions
  runs: SimRunResult[]
  survival: {
    averageSeconds: number
    medianSeconds: number
    bestSeconds: number
    destroyedRate: number
  }
  route: {
    averageNodesCleared: number
    finalReached: number
    templateCounts: Record<string, number>
    stationServiceCounts: Record<string, number>
  }
  planets: {
    averageLandings: number
    archetypeCounts: Record<string, number>
    eventCounts: Record<string, number>
    scenarioCounts: Record<string, number>
  }
  economy: {
    averageScrap: number
    averageCrystal: number
    averageCores: number
    averageMutationSignals: number
  }
  combat: {
    averageKills: number
    averageDamageTaken: number
    deathCauseCounts: Record<string, number>
  }
  upgrades: {
    chosenCounts: Record<string, number>
  }
  balanceFlags: string[]
}
