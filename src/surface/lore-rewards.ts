import { powerupBalance } from '../powerup-balance'
import { runBalance } from '../run-balance'
import { surfaceRunBalance } from '../surface-balance'

export interface SurfaceLoreRewardInput {
  level: number
  surveyRank: number
  random: () => number
}

export interface SurfaceLoreReward {
  score: number
  crystal: number
  signalDecoded: boolean
}

export function resolveSurfaceLoreReward(input: SurfaceLoreRewardInput): SurfaceLoreReward {
  const signalChance = powerupBalance.upgradeApply.loreSignalBaseChance
    + input.surveyRank * powerupBalance.upgradeApply.loreSignalSurveyChancePerRank
  return {
    score: runBalance.scoring.loreBaseScore + input.level * runBalance.scoring.loreScorePerLevel,
    crystal: surfaceRunBalance.lore.crystalReward,
    signalDecoded: input.random() < signalChance
  }
}
