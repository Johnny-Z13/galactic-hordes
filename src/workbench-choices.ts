import {
  evolutions,
  limitBreakChoices,
  relics as relicCatalog,
  upgradeMaxRank,
  upgrades,
  workbenchBalance,
  type Evolution,
  type LimitId,
  type Relic,
  type RelicId,
  type Upgrade,
  type UpgradeId
} from './powerup-balance'
import { firstOpportunityUpgrade, workbenchRollableUpgrades } from './workbench-rolls'

export type WorkbenchChoice =
  | { kind: 'upgrade'; upgrade: Upgrade }
  | { kind: 'evolution'; evolution: Evolution }
  | { kind: 'limit'; id: LimitId; name: string; description: string }
  | { kind: 'relic'; relic: Relic }

export interface WorkbenchUpgradeWeightInput {
  build: Record<UpgradeId, number>
  rare: boolean
  workbenchTier: number
}

export interface RollWorkbenchChoicesInput extends WorkbenchUpgradeWeightInput {
  count: number
  relics: ReadonlySet<RelicId>
  evolved: ReadonlySet<UpgradeId>
  discoverySuitOffer?: boolean
  extraUnlockedIds?: UpgradeId[]
  random?: () => number
}

export function availableWorkbenchEvolutions(build: Record<UpgradeId, number>, relics: ReadonlySet<RelicId>, evolved: ReadonlySet<UpgradeId>) {
  return evolutions.filter((evolution) => build[evolution.weapon] >= upgradeMaxRank(evolution.weapon) && relics.has(evolution.relic) && !evolved.has(evolution.weapon))
}

export function workbenchUpgradeWeight(upgrade: Upgrade, input: WorkbenchUpgradeWeightInput) {
  const ownedBias = workbenchBalance.ownedBiasBase
    + input.build.luck * workbenchBalance.ownedBiasLuckPerRank
    + (input.workbenchTier >= workbenchBalance.ownedBiasWorkbenchTier ? workbenchBalance.ownedBiasWorkbenchBonus : 0)
  const rareBias = input.rare ? workbenchBalance.rareUpgradeWeightMultiplier : 1
  const owned = input.build[upgrade.id] > 0
  const weaponFocus = upgrade.category === 'weapon' ? workbenchBalance.weaponFocusWeight : 1
  return Math.max(1, upgrade.rarity * (owned ? ownedBias : 1) * weaponFocus * (upgrade.rarity < workbenchBalance.rareUpgradeRarityThreshold ? rareBias : 1))
}

export function pickWeightedWorkbenchUpgrade(pool: Upgrade[], input: WorkbenchUpgradeWeightInput, random = Math.random) {
  const weights = pool.map((upgrade) => workbenchUpgradeWeight(upgrade, input))
  let roll = random() * weights.reduce((sum, weight) => sum + weight, 0)
  for (let i = 0; i < pool.length; i += 1) {
    roll -= weights[i]
    if (roll <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

export function rollWorkbenchRelicChoice(input: Pick<RollWorkbenchChoicesInput, 'build' | 'rare' | 'relics' | 'random'>) {
  const random = input.random ?? Math.random
  const missing = relicCatalog.filter((relic) => !input.relics.has(relic.id))
  if (!missing.length) return null
  const chance = (input.rare ? workbenchBalance.relicChanceRare : workbenchBalance.relicChanceBase)
    + input.build.luck * workbenchBalance.relicChanceLuckPerRank
    + input.build.survey * workbenchBalance.relicChanceSurveyPerRank
  if (random() > chance) return null
  let roll = random() * missing.reduce((sum, relic) => sum + relic.rarity, 0)
  for (const relic of missing) {
    roll -= relic.rarity
    if (roll <= 0) return relic
  }
  return missing[0]
}

export function rollWorkbenchLimitBreak(random = Math.random): WorkbenchChoice {
  return { kind: 'limit', ...limitBreakChoices[Math.floor(random() * limitBreakChoices.length)] }
}

export function rollWorkbenchChoices(input: RollWorkbenchChoicesInput) {
  const random = input.random ?? Math.random
  const choices: WorkbenchChoice[] = []
  const evolutionChoices = availableWorkbenchEvolutions(input.build, input.relics, input.evolved)
  if (evolutionChoices.length && (input.rare || random() < workbenchBalance.evolutionChanceBase + input.build.luck * workbenchBalance.evolutionChanceLuckPerRank)) {
    choices.push({ kind: 'evolution', evolution: evolutionChoices[Math.floor(random() * evolutionChoices.length)] })
  }
  const relic = rollWorkbenchRelicChoice({ ...input, random })
  if (relic && choices.length < input.count) choices.push({ kind: 'relic', relic })
  const discoverySuit = input.discoverySuitOffer
    ? firstOpportunityUpgrade(upgrades, input.build, 'suitO2')
    : null
  if (discoverySuit && choices.length < input.count) choices.push({ kind: 'upgrade', upgrade: discoverySuit })
  const available = workbenchRollableUpgrades(upgrades, input.build, input.extraUnlockedIds)
    .filter((upgrade) => !choices.some((choice) => choice.kind === 'upgrade' && choice.upgrade.id === upgrade.id))
  while (choices.length < input.count && available.length) {
    const selected = pickWeightedWorkbenchUpgrade(available, input, random)
    choices.push({ kind: 'upgrade', upgrade: selected })
    available.splice(available.indexOf(selected), 1)
  }
  while (choices.length < input.count) choices.push(rollWorkbenchLimitBreak(random))
  return choices
}
