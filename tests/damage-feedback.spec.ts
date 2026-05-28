import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { damageFeedbackConfig, hitFlashColor } from '../src/combat/damage-feedback'
import { introHookConfig } from '../src/intro-hook'

test('damage feedback owns shared red hit flash tuning', () => {
  expect(damageFeedbackConfig.hitFlash.color).toBe('#ff5d73')
  expect(damageFeedbackConfig.hitFlash.durationSeconds).toBeGreaterThan(0)
  expect(damageFeedbackConfig.hitFlash.dashRamDurationSeconds).toBeGreaterThan(damageFeedbackConfig.hitFlash.durationSeconds)
  expect(introHookConfig.hitFlash).toBe(damageFeedbackConfig.hitFlash)
})

test('hitFlashColor uses shared damage feedback color when an enemy was hit', () => {
  expect(hitFlashColor(true, '#57fff3')).toBe(damageFeedbackConfig.hitFlash.color)
  expect(hitFlashColor(false, '#57fff3')).toBe('#57fff3')
})

test('space and surface renderers consume combat damage feedback instead of intro hook ownership', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const enemies = readFileSync('src/render/enemies.ts', 'utf8')

  expect(main).toContain("from './combat/damage-feedback'")
  expect(enemies).toContain("from '../combat/damage-feedback'")
  expect(enemies).not.toContain("from '../intro-hook'")
  expect(main).toContain('damageFeedbackConfig.hitFlash')
})
