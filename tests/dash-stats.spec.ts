import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { powerupBalance } from '../src/powerup-balance'
import { resolveDashStats } from '../src/dash-stats'

test('dash stats combine engine phase and heat ranks from balance data', () => {
  const stats = resolveDashStats({ engine: 2, phase: 3, heat: 1 })

  expect(stats.duration).toBe(
    powerupBalance.dash.durationBase
      + 2 * powerupBalance.dash.durationPerEngineRank
      + 3 * powerupBalance.dash.durationPerPhaseRank
  )
  expect(stats.speed).toBe(
    powerupBalance.dash.speedBase
      + 2 * powerupBalance.dash.speedPerEngineRank
      + 3 * powerupBalance.dash.speedPerPhaseRank
  )
  expect(stats.cooldown).toBe(
    powerupBalance.dash.cooldownBase
      - 2 * powerupBalance.dash.cooldownReductionPerEngineRank
      - powerupBalance.dash.cooldownReductionPerHeatRank
  )
  expect(stats.invulnerability).toBe(
    powerupBalance.dash.invulnerabilityBase
      + 3 * powerupBalance.dash.invulnerabilityPerPhaseRank
  )
})

test('dash stats clamp duration and cooldown to authored limits', () => {
  const stats = resolveDashStats({ engine: 99, phase: 99, heat: 99 })

  expect(stats.duration).toBe(powerupBalance.dash.durationMax)
  expect(stats.cooldown).toBe(powerupBalance.dash.cooldownMin)
})

test('dash stats add engine invulnerability once the threshold is reached', () => {
  const before = resolveDashStats({ engine: powerupBalance.dash.engineInvulnerabilityThreshold - 1, phase: 0, heat: 0 })
  const atThreshold = resolveDashStats({ engine: powerupBalance.dash.engineInvulnerabilityThreshold, phase: 0, heat: 0 })

  expect(before.invulnerability).toBe(powerupBalance.dash.invulnerabilityBase)
  expect(atThreshold.invulnerability).toBe(powerupBalance.dash.invulnerabilityBase + powerupBalance.dash.engineInvulnerabilityBonus)
})

test('main delegates dash stat formulas to focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const helper = readFileSync('src/dash-stats.ts', 'utf8')

  expect(helper).toContain('export function resolveDashStats')
  expect(main).toContain("from './dash-stats'")
  expect(main).toContain('return resolveDashStats(this.build).duration')
  expect(main).toContain('return resolveDashStats(this.build).speed')
  expect(main).toContain('return resolveDashStats(this.build).cooldown')
  expect(main).toContain('return resolveDashStats(this.build).invulnerability')
  expect(main).not.toContain('powerupBalance.dash.durationPerEngineRank')
  expect(main).not.toContain('powerupBalance.dash.cooldownReductionPerHeatRank')
})
