import { runBalance } from '../run-balance'
import type { SectorNode } from '../sector-map'
import { resolveStationServices } from '../station-services'
import type { SimEconomyState } from './sim-types'

export interface SimStationDockResult {
  repaired: number
  resources: SimEconomyState
  services: string[]
}

export function simulateStationDock(input: {
  node: SectorNode
  currentDamage: number
}): SimStationDockResult {
  const services = input.node.stationServices
  const serviceResult = resolveStationServices({
    services,
    hull: Math.max(0, runBalance.player.baseHull - input.currentDamage),
    maxHull: runBalance.player.baseHull,
    pendingUpgrades: 0,
    workbenchRerolls: 0
  })
  return {
    repaired: serviceResult.repaired,
    services,
    resources: {
      scrap: serviceResult.scrap,
      crystal: serviceResult.crystal,
      cores: 0,
      mutationSignals: serviceResult.workbenchSignals
    }
  }
}
