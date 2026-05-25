import type { Upgrade, UpgradeId } from './powerup-balance'

export function firstOpportunityUpgrade<T extends { id: string; max: number }>(
  upgrades: T[],
  build: Record<string, number>,
  requiredId?: string
): T | null {
  if (!requiredId) return null
  if ((build[requiredId] ?? 0) > 0) return null
  return upgrades.find((upgrade) => upgrade.id === requiredId && (build[upgrade.id] ?? 0) < upgrade.max) ?? null
}

export const workbenchStarterUpgradeIds = ['rapid', 'engine', 'magnet', 'shield', 'split'] as const satisfies readonly UpgradeId[]

export interface WorkbenchUnlockEdge {
  source: UpgradeId
  unlocks: readonly UpgradeId[]
  rank?: number
}

export const workbenchUnlockEdges: readonly WorkbenchUnlockEdge[] = [
  { source: 'rapid', rank: 3, unlocks: ['chain'] },
  { source: 'rapid', rank: 3, unlocks: ['rear'] },
  { source: 'rapid', rank: 5, unlocks: ['heat'] },
  { source: 'rapid', unlocks: ['rail'] },
  { source: 'split', rank: 3, unlocks: ['pierce'] },
  { source: 'split', rank: 3, unlocks: ['orbit'] },
  { source: 'split', unlocks: ['echo'] },
  { source: 'engine', rank: 3, unlocks: ['nav'] },
  { source: 'engine', rank: 5, unlocks: ['phase'] },
  { source: 'shield', rank: 3, unlocks: ['repair'] },
  { source: 'shield', unlocks: ['vampire'] },
  { source: 'magnet', rank: 4, unlocks: ['luck'] },
  { source: 'magnet', rank: 5, unlocks: ['cargo'] },
  { source: 'luck', rank: 4, unlocks: ['survey'] },
  { source: 'survey', rank: 2, unlocks: ['suitO2', 'suitHealth', 'suitBlaster'] },
  { source: 'chain', rank: 3, unlocks: ['orbit'] },
  { source: 'echo', rank: 2, unlocks: ['heat'] },
  { source: 'rail', unlocks: ['rift'] },
  { source: 'echo', unlocks: ['rift'] },
  { source: 'phase', rank: 2, unlocks: ['mine'] },
  { source: 'cargo', rank: 2, unlocks: ['mine'] }
] as const

export interface WorkbenchLockedUpgrade<T extends { id: string }> {
  upgrade: T
  requirement: string
}

export type WorkbenchUpgradeRowStatus = 'offer' | 'standby' | 'maxed' | 'locked'

export interface WorkbenchUpgradeRow<T extends Upgrade> {
  upgrade: T
  status: WorkbenchUpgradeRowStatus
  requirement?: string
}

const upgradeName = <T extends { id: string; name?: string }>(upgrades: readonly T[], id: string) => (
  upgrades.find((upgrade) => upgrade.id === id)?.name ?? id
)

const joinRequirements = (requirements: string[]) => {
  if (requirements.length > 1 && requirements.every((requirement) => requirement.startsWith('Max '))) {
    return `Max ${requirements.map((requirement) => requirement.slice(4)).join(' or ')}`
  }
  return requirements.join(' or ')
}

const unlockRequirement = <T extends { id: string; name?: string; max: number }>(upgrades: readonly T[], id: string) => {
  const sources = workbenchUnlockEdges
    .filter((edge) => (edge.unlocks as readonly UpgradeId[]).includes(id as UpgradeId))
    .map((edge) => {
      const source = upgradeName(upgrades, edge.source)
      const sourceMax = upgrades.find((upgrade) => upgrade.id === edge.source)?.max ?? edge.rank
      return edge.rank && edge.rank < (sourceMax ?? edge.rank) ? `${source} rank ${edge.rank}` : `Max ${source}`
    })
  if (!sources.length) return 'Future workbench unlock'
  return joinRequirements(sources)
}

export function workbenchUnlockedUpgradeIds<T extends { id: UpgradeId; max: number }>(
  upgrades: readonly T[],
  build: Record<UpgradeId, number>,
  extraUnlockedIds: readonly UpgradeId[] = []
): UpgradeId[] {
  const validIds = new Set(upgrades.map((upgrade) => upgrade.id))
  const starterIds: readonly UpgradeId[] = workbenchStarterUpgradeIds
  const unlocked = new Set<UpgradeId>(starterIds.filter((id) => validIds.has(id)))
  for (const id of extraUnlockedIds) {
    if (validIds.has(id)) unlocked.add(id)
  }
  for (const edge of workbenchUnlockEdges) {
    const source = upgrades.find((upgrade) => upgrade.id === edge.source)
    if (!source || (build[edge.source] ?? 0) < (edge.rank ?? source.max)) continue
    for (const id of edge.unlocks) {
      if (validIds.has(id)) unlocked.add(id)
    }
  }
  return [
    ...starterIds.filter((id) => unlocked.has(id)),
    ...upgrades
      .filter((upgrade) => unlocked.has(upgrade.id) && !starterIds.includes(upgrade.id))
      .map((upgrade) => upgrade.id)
  ]
}

export function workbenchRollableUpgrades<T extends Upgrade>(
  upgrades: readonly T[],
  build: Record<UpgradeId, number>,
  extraUnlockedIds: readonly UpgradeId[] = []
): T[] {
  const unlocked = new Set(workbenchUnlockedUpgradeIds(upgrades, build, extraUnlockedIds))
  return upgrades.filter((upgrade) => unlocked.has(upgrade.id) && (build[upgrade.id] ?? 0) < upgrade.max)
}

export function workbenchLockedUpgrades<T extends Upgrade>(
  upgrades: readonly T[],
  build: Record<UpgradeId, number>,
  extraUnlockedIds: readonly UpgradeId[] = []
): Array<WorkbenchLockedUpgrade<T>> {
  const unlocked = new Set(workbenchUnlockedUpgradeIds(upgrades, build, extraUnlockedIds))
  return upgrades
    .filter((upgrade) => !unlocked.has(upgrade.id))
    .map((upgrade) => ({ upgrade, requirement: unlockRequirement(upgrades, upgrade.id) }))
}

export function workbenchUpgradeRows<T extends Upgrade>(
  upgrades: readonly T[],
  build: Record<UpgradeId, number>,
  offeredIds: readonly UpgradeId[] = [],
  extraUnlockedIds: readonly UpgradeId[] = []
): Array<WorkbenchUpgradeRow<T>> {
  const unlocked = new Set(workbenchUnlockedUpgradeIds(upgrades, build, extraUnlockedIds))
  const offered = new Set(offeredIds)
  const locked = new Map(workbenchLockedUpgrades(upgrades, build, extraUnlockedIds).map((entry) => [entry.upgrade.id, entry.requirement]))
  return upgrades.map((upgrade) => {
    if ((build[upgrade.id] ?? 0) >= upgrade.max) return { upgrade, status: 'maxed' }
    if (offered.has(upgrade.id)) return { upgrade, status: 'offer' }
    if (unlocked.has(upgrade.id)) return { upgrade, status: 'standby' }
    return { upgrade, status: 'locked', requirement: locked.get(upgrade.id) ?? 'Future workbench unlock' }
  })
}
