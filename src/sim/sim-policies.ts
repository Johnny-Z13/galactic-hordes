import type { Upgrade } from '../powerup-balance'
import type { SectorNode } from '../sector-map'
import type { SimPolicyId } from './sim-types'

export interface SimPolicy {
  id: SimPolicyId
  riskTolerance: number
  planetBias: number
  cacheGreed: number
  routeRush: number
  survivalUpgradeBias: number
}

export const simPolicies: Record<SimPolicyId, SimPolicy> = {
  balanced: { id: 'balanced', riskTolerance: 0.52, planetBias: 0.58, cacheGreed: 0.48, routeRush: 0.5, survivalUpgradeBias: 0.48 },
  survival: { id: 'survival', riskTolerance: 0.26, planetBias: 0.36, cacheGreed: 0.22, routeRush: 0.34, survivalUpgradeBias: 0.94 },
  planetHunter: { id: 'planetHunter', riskTolerance: 0.56, planetBias: 0.94, cacheGreed: 0.58, routeRush: 0.35, survivalUpgradeBias: 0.42 },
  greedyCache: { id: 'greedyCache', riskTolerance: 0.82, planetBias: 0.78, cacheGreed: 0.96, routeRush: 0.45, survivalUpgradeBias: 0.22 },
  routeRusher: { id: 'routeRusher', riskTolerance: 0.6, planetBias: 0.24, cacheGreed: 0.25, routeRush: 0.92, survivalUpgradeBias: 0.35 },
  stress: { id: 'stress', riskTolerance: 1, planetBias: 0.9, cacheGreed: 1, routeRush: 1, survivalUpgradeBias: 0.12 }
}

export function scoreRouteChoice(node: SectorNode, policy: SimPolicy): number {
  const paceRisk = { safe: 0.1, mild: 0.3, standard: 0.5, intense: 0.8, boss: 1 }[node.config.pace]
  const planetValue = node.kind === 'planet' ? policy.planetBias * 1.2 : node.config.planets.countMax > 0 ? policy.planetBias * 0.45 : 0
  const stationValue = node.kind === 'station' ? 0.75 - policy.routeRush * 0.2 : 0
  const rewardValue = node.config.rewards.resourceMultiplier * (0.38 + policy.cacheGreed)
  const rushValue = node.kind === 'station' ? 0.2 : policy.routeRush * (node.kind === 'final' ? 1.6 : 0.7)
  const riskPenalty = paceRisk * (1 - policy.riskTolerance) * 1.35
  return rewardValue + planetValue + stationValue + rushValue - riskPenalty
}

export function scoreUpgradeChoice(upgrade: Upgrade, policy: SimPolicy): number {
  const survivalBuckets = new Set(['survival', 'navigation', 'spacesuit'])
  const economyBuckets = new Set(['economy', 'planetcraft'])
  const survivalValue = survivalBuckets.has(upgrade.bucket) ? policy.survivalUpgradeBias * 1.6 : 0.2
  const economyValue = economyBuckets.has(upgrade.bucket) ? policy.cacheGreed * 0.9 : 0
  const weaponValue = upgrade.category === 'weapon' ? 0.45 + policy.riskTolerance * 0.6 : 0.2
  const rarityValue = upgrade.rarity / 120
  return survivalValue + economyValue + weaponValue + rarityValue
}
