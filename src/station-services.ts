import { runBalance } from './run-balance'
import type { SectorStationService } from './sector-map'

export interface StationServiceState {
  hull: number
  maxHull: number
  pendingUpgrades: number
  workbenchRerolls: number
}

export interface StationServiceResult {
  repaired: number
  workbenchSignals: number
  scrap: number
  crystal: number
  nextHull: number
  nextPendingUpgrades: number
  nextWorkbenchRerolls: number
}

export function resolveStationServices(input: StationServiceState & {
  services: SectorStationService[]
}): StationServiceResult {
  let nextHull = input.hull
  let nextPendingUpgrades = input.pendingUpgrades
  let nextWorkbenchRerolls = input.workbenchRerolls
  let repaired = 0
  let workbenchSignals = 0
  let scrap = 0
  let crystal = 0

  if (input.services.includes('repair')) {
    nextHull = clamp(input.hull + runBalance.station.repairHull, 0, input.maxHull)
    repaired = Math.round(nextHull - input.hull)
  }
  if (input.services.includes('workbench')) {
    nextPendingUpgrades = Math.max(input.pendingUpgrades, runBalance.station.workbenchSignals)
    nextWorkbenchRerolls = Math.max(input.workbenchRerolls, runBalance.station.rerolls)
    workbenchSignals = Math.max(0, nextPendingUpgrades - input.pendingUpgrades)
  }
  if (input.services.includes('trade')) {
    scrap = runBalance.station.tradeScrap
    crystal = runBalance.station.tradeCrystal
  }

  return {
    repaired,
    workbenchSignals,
    scrap,
    crystal,
    nextHull,
    nextPendingUpgrades,
    nextWorkbenchRerolls
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
