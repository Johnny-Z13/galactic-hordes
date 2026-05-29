import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { powerupBalance } from '../src/powerup-balance'
import { runBalance } from '../src/run-balance'
import { surfaceRunBalance } from '../src/surface-balance'
import { resolveSurfaceLoreReward } from '../src/surface/lore-rewards'

test('surface lore reward scales score by level and always grants crystal cargo', () => {
  const reward = resolveSurfaceLoreReward({ level: 4, surveyRank: 0, random: () => 1 })

  expect(reward.score).toBe(runBalance.scoring.loreBaseScore + 4 * runBalance.scoring.loreScorePerLevel)
  expect(reward.crystal).toBe(surfaceRunBalance.lore.crystalReward)
  expect(reward.signalDecoded).toBe(false)
})

test('surface lore signal decode chance scales with survey rank', () => {
  const chance = powerupBalance.upgradeApply.loreSignalBaseChance
    + 3 * powerupBalance.upgradeApply.loreSignalSurveyChancePerRank

  expect(resolveSurfaceLoreReward({ level: 1, surveyRank: 3, random: () => chance - 0.001 }).signalDecoded).toBe(true)
  expect(resolveSurfaceLoreReward({ level: 1, surveyRank: 3, random: () => chance }).signalDecoded).toBe(false)
})

test('main delegates surface lore reward math to focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const helper = readFileSync('src/surface/lore-rewards.ts', 'utf8')

  expect(helper).toContain('export function resolveSurfaceLoreReward')
  expect(main).toContain("from './surface/lore-rewards'")
  expect(main).toContain('const reward = resolveSurfaceLoreReward({')
  expect(main).not.toContain('runBalance.scoring.loreBaseScore')
  expect(main).not.toContain('loreSignalSurveyChancePerRank')
})
