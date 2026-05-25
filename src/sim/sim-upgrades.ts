import { upgrades, type Upgrade, type UpgradeId } from '../powerup-balance'
import { workbenchRollableUpgrades } from '../workbench-rolls'
import type { SimRng } from './sim-rng'
import { pickWeighted } from './sim-rng'
import { scoreUpgradeChoice, type SimPolicy } from './sim-policies'

export function createEmptyUpgradeBuild(): Record<UpgradeId, number> {
  return Object.fromEntries(upgrades.map((upgrade) => [upgrade.id, 0])) as Record<UpgradeId, number>
}

export function chooseSimUpgrade(input: {
  build: Record<UpgradeId, number>
  policy: SimPolicy
  rng: SimRng
}): Upgrade | null {
  const rollable = workbenchRollableUpgrades(upgrades, input.build)
  if (!rollable.length) return null

  return pickWeighted(
    rollable.map((upgrade) => ({
      value: upgrade,
      weight: Math.max(0.1, scoreUpgradeChoice(upgrade, input.policy))
    })),
    input.rng
  )
}

export function applySimUpgrade(build: Record<UpgradeId, number>, upgrade: Upgrade): number {
  const rank = Math.min(upgrade.max, (build[upgrade.id] ?? 0) + 1)
  build[upgrade.id] = rank
  return rank
}
