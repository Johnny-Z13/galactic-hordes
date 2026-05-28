import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { weaponSoundKindFor } from '../src/combat/weapon-sound'

test('weaponSoundKindFor keeps current weapon audio precedence', () => {
  expect(weaponSoundKindFor({ rail: true, needle: true, count: 1, splitRank: 0 })).toBe('needle')
  expect(weaponSoundKindFor({ rail: true, needle: false, count: 1, splitRank: 0 })).toBe('rail')
  expect(weaponSoundKindFor({ rail: false, needle: false, count: 2, splitRank: 0 })).toBe('prism')
  expect(weaponSoundKindFor({ rail: false, needle: false, count: 1, splitRank: 1 })).toBe('prism')
  expect(weaponSoundKindFor({ rail: false, needle: false, count: 1, splitRank: 0 })).toBe('pulse')
})

test('main routes weapon audio through the combat helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain("import { weaponSoundKindFor } from './combat/weapon-sound'")
  expect(main).toContain('this.audio.fire(weaponSoundKindFor({')
  expect(main).not.toContain('private weaponSoundKind(')
})
