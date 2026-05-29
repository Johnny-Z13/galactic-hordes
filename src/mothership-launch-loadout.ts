import type { MothershipState, ResourceBundle } from './mothership-progression'
import { runBalance } from './run-balance'

export interface MothershipLaunchLoadout {
  hullBonus: number
  speedBonus: number
  workbenchRerolls: number
  resources: ResourceBundle
}

export const resolveMothershipLaunchLoadout = (mothership: MothershipState): MothershipLaunchLoadout => {
  const shipyard = mothership.departments.shipyard
  const hangarCrew = mothership.departments.hangarCrew
  return {
    hullBonus: shipyard * runBalance.progression.shipyardHullPerTier,
    speedBonus: shipyard * runBalance.progression.shipyardSpeedPerTier,
    workbenchRerolls: mothership.departments.workbench >= 1 ? 1 : 0,
    resources: {
      scrap: hangarCrew * runBalance.progression.hangarCrewScrapPerTier,
      crystal: hangarCrew >= runBalance.progression.hangarCrewCrystalUnlockTier ? hangarCrew * runBalance.progression.hangarCrewCrystalPerTier : 0,
      cores: hangarCrew >= runBalance.progression.hangarCrewCoreUnlockTier ? runBalance.progression.hangarCrewCores : 0
    }
  }
}
