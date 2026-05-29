import { clamp } from './math-utils'
import { powerupBalance } from './powerup-balance'

export interface DashStatBuild {
  engine: number
  phase: number
  heat: number
}

export interface DashStats {
  duration: number
  speed: number
  cooldown: number
  invulnerability: number
}

export function resolveDashStats(build: DashStatBuild): DashStats {
  const engineBonus = build.engine >= powerupBalance.dash.engineInvulnerabilityThreshold
    ? powerupBalance.dash.engineInvulnerabilityBonus
    : 0
  return {
    duration: clamp(
      powerupBalance.dash.durationBase
        + build.engine * powerupBalance.dash.durationPerEngineRank
        + build.phase * powerupBalance.dash.durationPerPhaseRank,
      powerupBalance.dash.durationBase,
      powerupBalance.dash.durationMax
    ),
    speed: powerupBalance.dash.speedBase
      + build.engine * powerupBalance.dash.speedPerEngineRank
      + build.phase * powerupBalance.dash.speedPerPhaseRank,
    cooldown: clamp(
      powerupBalance.dash.cooldownBase
        - build.engine * powerupBalance.dash.cooldownReductionPerEngineRank
        - build.heat * powerupBalance.dash.cooldownReductionPerHeatRank,
      powerupBalance.dash.cooldownMin,
      powerupBalance.dash.cooldownBase
    ),
    invulnerability: powerupBalance.dash.invulnerabilityBase
      + engineBonus
      + build.phase * powerupBalance.dash.invulnerabilityPerPhaseRank
  }
}
