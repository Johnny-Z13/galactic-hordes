import { runBalance } from '../run-balance'
import type { SectorNode } from '../sector-map'
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
  const repaired = services.includes('repair') ? Math.min(input.currentDamage, runBalance.station.repairHull) : 0
  return {
    repaired,
    services,
    resources: {
      scrap: services.includes('trade') ? runBalance.station.tradeScrap : 0,
      crystal: services.includes('trade') ? runBalance.station.tradeCrystal : 0,
      cores: 0,
      mutationSignals: services.includes('workbench') ? runBalance.station.workbenchSignals : 0
    }
  }
}
