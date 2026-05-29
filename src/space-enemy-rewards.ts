import { advancedRewardEnemyKinds, spaceEnemyBehavior } from './space-enemy-behavior'
import { isGiantEnemyKind, type SpaceEnemyKind } from './space-enemies'

export interface SpaceEnemyKillRewardInput {
  kind: SpaceEnemyKind
  highLoad: boolean
}

export interface SpaceEnemyKillReward {
  xpDrops: number
  xpValue: number
  chest: boolean
}

function spaceEnemyXpCount(kind: SpaceEnemyKind) {
  if (isGiantEnemyKind(kind)) return spaceEnemyBehavior.rewards.xpCount.giant
  if (kind === 'warden') return spaceEnemyBehavior.rewards.xpCount.warden
  if (kind === 'bulwark') return spaceEnemyBehavior.rewards.xpCount.bulwark
  if (kind === 'brute') return spaceEnemyBehavior.rewards.xpCount.brute
  if (advancedRewardEnemyKinds.includes(kind)) return spaceEnemyBehavior.rewards.xpCount.advanced
  return spaceEnemyBehavior.rewards.xpCount.default
}

function spaceEnemyXpValue(kind: SpaceEnemyKind, highLoad: boolean, xpCount: number) {
  if (isGiantEnemyKind(kind)) return spaceEnemyBehavior.rewards.xpValue.giant
  if (kind === 'warden') return spaceEnemyBehavior.rewards.xpValue.warden
  if (kind === 'bulwark') return spaceEnemyBehavior.rewards.xpValue.bulwark
  if (kind === 'brute') return spaceEnemyBehavior.rewards.xpValue.brute
  if (highLoad) return spaceEnemyBehavior.rewards.xpValue.highLoadPerDrop * xpCount
  return spaceEnemyBehavior.rewards.xpValue.default
}

export function resolveSpaceEnemyKillReward(input: SpaceEnemyKillRewardInput): SpaceEnemyKillReward {
  const xpCount = spaceEnemyXpCount(input.kind)
  return {
    xpDrops: input.highLoad && input.kind !== 'warden' ? 1 : xpCount,
    xpValue: spaceEnemyXpValue(input.kind, input.highLoad, xpCount),
    chest: input.kind === 'warden' || isGiantEnemyKind(input.kind)
  }
}
