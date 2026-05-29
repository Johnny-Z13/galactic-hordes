import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { powerupBalance } from '../src/powerup-balance'
import { spaceEnemyBehavior } from '../src/space-enemy-behavior'
import {
  resolveSpaceEnemyBonusDrops,
  resolveSpaceEnemyKillReward,
  resolveSpaceEnemySplitChildSpawnCount
} from '../src/space-enemy-rewards'

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

test('space enemy bonus drops use vampire and elapsed-time chances independently', () => {
  const drops = resolveSpaceEnemyBonusDrops({
    vampireRank: 2,
    elapsedSeconds: 500,
    random: () => 0
  })

  expect(drops).toEqual([
    { kind: 'repair', value: powerupBalance.upgradeApply.vampireRepairDropValue },
    { kind: 'magnet', value: powerupBalance.upgradeApply.magnetDropValue }
  ])
})

test('space enemy bonus drops can miss repair while still rolling magnet', () => {
  let roll = 0
  const drops = resolveSpaceEnemyBonusDrops({
    vampireRank: 0,
    elapsedSeconds: 500,
    random: () => {
      roll += 1
      return roll === 1 ? 1 : 0
    }
  })

  expect(drops).toEqual([
    { kind: 'magnet', value: powerupBalance.upgradeApply.magnetDropValue }
  ])
})

test('space enemy split child spawns use splinter chance when under the enemy cap', () => {
  expect(resolveSpaceEnemySplitChildSpawnCount({
    kind: 'splinter',
    enemyCount: 6,
    maxEnemies: 10,
    random: () => 0
  })).toBe(spaceEnemyBehavior.splitChild.count)
})

test('space enemy split child spawns reject non-splinters, capped swarms, and missed rolls', () => {
  expect(resolveSpaceEnemySplitChildSpawnCount({
    kind: 'chaser',
    enemyCount: 6,
    maxEnemies: 10,
    random: () => 0
  })).toBe(0)
  expect(resolveSpaceEnemySplitChildSpawnCount({
    kind: 'splinter',
    enemyCount: 7,
    maxEnemies: 10,
    random: () => 0
  })).toBe(0)
  expect(resolveSpaceEnemySplitChildSpawnCount({
    kind: 'splinter',
    enemyCount: 6,
    maxEnemies: 10,
    random: () => 1
  })).toBe(0)
})

test('main delegates space enemy kill reward math to focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const helper = readFileSync('src/space-enemy-rewards.ts', 'utf8')

  expect(helper).toContain('export function resolveSpaceEnemyKillReward')
  expect(helper).toContain('export function resolveSpaceEnemyBonusDrops')
  expect(helper).toContain('export function resolveSpaceEnemySplitChildSpawnCount')
  expect(main).toContain("from './space-enemy-rewards'")
  expect(main).toContain('const killReward = resolveSpaceEnemyKillReward({')
  expect(main).toContain('const bonusDrops = resolveSpaceEnemyBonusDrops({')
  expect(main).toContain('const splitChildCount = resolveSpaceEnemySplitChildSpawnCount({')
  expect(main).not.toContain('const xpCount = isGiantEnemyKind(e.kind)')
  expect(main).not.toContain('spaceEnemyBehavior.rewards.xpValue.highLoadPerDrop')
  expect(main).not.toContain('vampireRepairDropBaseChance + this.build.vampire')
  expect(main).not.toContain('magnetDropBaseChance + this.stats.time')
  expect(main).not.toContain("e.kind === 'splinter' && this.enemies.length < MAX_ENEMIES - spaceEnemyBehavior.splitChild.count")
})
