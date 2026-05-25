import type { Upgrade, UpgradeId } from './powerup-balance'

export type WorkbenchBayId = 'weapons' | 'maneuver' | 'survival' | 'cargoSurvey' | 'spacesuit'

export interface WorkbenchBayDefinition {
  id: WorkbenchBayId
  label: string
  shortLabel: string
  summary: string
  upgradeIds: readonly UpgradeId[]
}

export const workbenchBayDefinitions: readonly WorkbenchBayDefinition[] = [
  {
    id: 'weapons',
    label: 'Weapons Bay',
    shortLabel: 'Weapons',
    summary: 'Pulse, spread, rear fire, chain, rail, orbit, and boss-hunter branches.',
    upgradeIds: ['rapid', 'split', 'pierce', 'rear', 'rail', 'echo', 'orbit', 'chain', 'rift']
  },
  {
    id: 'maneuver',
    label: 'Maneuver Bay',
    shortLabel: 'Maneuver',
    summary: 'Engine handling, autonomous navigation, phase dash, and mine wake.',
    upgradeIds: ['engine', 'nav', 'phase', 'mine']
  },
  {
    id: 'survival',
    label: 'Survival Bay',
    shortLabel: 'Survival',
    summary: 'Shield, hull repair, and sustain routes.',
    upgradeIds: ['shield', 'repair', 'vampire']
  },
  {
    id: 'cargoSurvey',
    label: 'Cargo and Survey Bay',
    shortLabel: 'Cargo',
    summary: 'Pickup reach, jackpot odds, cargo yield, and planet discovery.',
    upgradeIds: ['magnet', 'luck', 'cargo', 'survey']
  },
  {
    id: 'spacesuit',
    label: 'Spacesuit Bay',
    shortLabel: 'Suit',
    summary: 'Surface oxygen, human survivability, and field blaster pressure.',
    upgradeIds: ['suitO2', 'suitHealth', 'suitBlaster']
  }
] as const

export function workbenchBayForUpgrade(upgrade: Upgrade): WorkbenchBayDefinition {
  return workbenchBayDefinitions.find((bay) => bay.upgradeIds.includes(upgrade.id)) ?? workbenchBayDefinitions[0]
}
