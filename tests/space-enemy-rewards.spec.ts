import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { spaceEnemyBehavior } from '../src/space-enemy-behavior'
import { resolveSpaceEnemyKillReward } from '../src/space-enemy-rewards'

test('space enemy rewards use default xp for ordinary enemies', () => {
  expect(resolveSpaceEnemyKillReward({ kind: 'chaser', highLoad: false })).toEqual({
    xpDrops: spaceEnemyBehavior.rewards.xpCount.default,
    xpValue: spaceEnemyBehavior.rewards.xpValue.default,
    chest: false
  })
})

test('space enemy rewards preserve warden chest payouts under high load', () => {
  expect(resolveSpaceEnemyKillReward({ kind: 'warden', highLoad: true })).toEqual({
    xpDrops: spaceEnemyBehavior.rewards.xpCount.warden,
    xpValue: spaceEnemyBehavior.rewards.xpValue.warden,
    chest: true
  })
})

test('space enemy rewards collapse giant high-load xp without losing chest payout', () => {
  expect(resolveSpaceEnemyKillReward({ kind: 'siphon', highLoad: true })).toEqual({
    xpDrops: 1,
    xpValue: spaceEnemyBehavior.rewards.xpValue.giant,
    chest: true
  })
})

test('space enemy rewards collapse non-warden high-load xp into one authored-value drop', () => {
  expect(resolveSpaceEnemyKillReward({ kind: 'bulwark', highLoad: true })).toEqual({
    xpDrops: 1,
    xpValue: spaceEnemyBehavior.rewards.xpValue.bulwark,
    chest: false
  })
})

test('space enemy rewards merge high-load ordinary enemy xp by original drop count', () => {
  expect(resolveSpaceEnemyKillReward({ kind: 'shooter', highLoad: true })).toEqual({
    xpDrops: 1,
    xpValue: spaceEnemyBehavior.rewards.xpValue.highLoadPerDrop * spaceEnemyBehavior.rewards.xpCount.advanced,
    chest: false
  })
})

test('main delegates space enemy kill reward math to focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const helper = readFileSync('src/space-enemy-rewards.ts', 'utf8')

  expect(helper).toContain('export function resolveSpaceEnemyKillReward')
  expect(main).toContain("from './space-enemy-rewards'")
  expect(main).toContain('const killReward = resolveSpaceEnemyKillReward({')
  expect(main).not.toContain('const xpCount = isGiantEnemyKind(e.kind)')
  expect(main).not.toContain('spaceEnemyBehavior.rewards.xpValue.highLoadPerDrop')
})
