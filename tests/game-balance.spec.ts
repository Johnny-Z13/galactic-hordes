import { expect, test } from '@playwright/test'
import {
  activeBalanceProfile,
  balancedSpaceEnemyDefinition,
  enemyAttackCooldown,
  GAME_BALANCE_MODE,
  gameBalanceProfiles,
  pickSpaceEnemyKind,
  spaceEnemyBalance,
  spaceEnemyKinds,
  spaceSpawnBalance,
  surfaceThreatBalance
} from '../src/game-balance'

const sequenceRandom = (values: number[]) => {
  let index = 0
  return () => values[index++] ?? 0.99
}

test('active balance mode uses the normal first-pass tuning profile', () => {
  expect(GAME_BALANCE_MODE).toBe('normal')
  expect(activeBalanceProfile.enemyHpMultiplier).toBe(gameBalanceProfiles.normal.enemyHpMultiplier)
  expect(activeBalanceProfile.enemyDamageMultiplier).toBe(gameBalanceProfiles.normal.enemyDamageMultiplier)
  expect(activeBalanceProfile.spawnRateMultiplier).toBe(gameBalanceProfiles.normal.spawnRateMultiplier)
  expect(gameBalanceProfiles.testEasy.spawnRateMultiplier).toBeLessThan(activeBalanceProfile.spawnRateMultiplier)
})

test('each space enemy exposes editable balance stats', () => {
  for (const kind of spaceEnemyKinds) {
    const enemy = spaceEnemyBalance[kind]

    expect(enemy.hp).toBeGreaterThan(0)
    expect(enemy.radius).toBeGreaterThan(0)
    expect(enemy.speed).toBeGreaterThan(0)
    expect(enemy.value).toBeGreaterThan(0)
    expect(enemy.contactDamage).toBeGreaterThan(0)
    expect(enemy.timeGateSeconds).toBeGreaterThanOrEqual(0)
    expect(enemy.spawnRollCeiling).toBeGreaterThanOrEqual(0)
    if (enemy.projectileDamage !== undefined) expect(enemy.attackCooldownSeconds).toBeGreaterThan(0)
  }
})

test('balanced space enemy definitions apply global difficulty without mutating base data', () => {
  const normal = balancedSpaceEnemyDefinition('brute', gameBalanceProfiles.normal)
  const easy = balancedSpaceEnemyDefinition('brute', gameBalanceProfiles.testEasy)

  expect(easy.hp).toBeLessThan(normal.hp)
  expect(easy.speed).toBeLessThan(normal.speed)
  expect(easy.contactDamage).toBeLessThan(normal.contactDamage)
  expect(spaceEnemyBalance.brute.hp).toBeGreaterThan(easy.hp)
})

test('normal ship enemy hit damage is softened by thirty percent', () => {
  const chaser = balancedSpaceEnemyDefinition('chaser', gameBalanceProfiles.normal)
  const shooter = balancedSpaceEnemyDefinition('shooter', gameBalanceProfiles.normal)

  expect(gameBalanceProfiles.normal.enemyDamageMultiplier).toBe(0.7)
  expect(chaser.contactDamage).toBeCloseTo(spaceEnemyBalance.chaser.contactDamage * 0.7)
  expect(shooter.projectileDamage).toBeCloseTo((spaceEnemyBalance.shooter.projectileDamage ?? 0) * 0.7)
})

test('enemy attack cooldown ramps are balance data', () => {
  const shooter = balancedSpaceEnemyDefinition('shooter', gameBalanceProfiles.normal)

  expect(enemyAttackCooldown(shooter, 0)).toBe(shooter.attackCooldownSeconds)
  expect(enemyAttackCooldown(shooter, 9999)).toBe(shooter.minimumAttackCooldownSeconds)
})

test('spawn and surface balance values are named and profile-scaled', () => {
  expect(spaceSpawnBalance.spawnCooldown.minSeconds).toBeGreaterThan(0)
  expect(spaceSpawnBalance.spawnCooldown.maxSeconds).toBeGreaterThan(1)
  expect(spaceSpawnBalance.quietField.targetNearbyBase).toBeGreaterThan(0)
  expect(spaceSpawnBalance.quietField.targetNearbyMax).toBeGreaterThan(spaceSpawnBalance.quietField.targetNearbyBase)
  expect(surfaceThreatBalance.generic.baseHp).toBeGreaterThan(0)
  expect(surfaceThreatBalance.boss.contactDamage).toBeGreaterThan(surfaceThreatBalance.generic.contactDamage)
})

test('enemy picker can preview upcoming regular enemies before their normal gate', () => {
  expect(pickSpaceEnemyKind(40, sequenceRandom([0.01, 0]))).toBe('lancer')
})

test('enemy picker keeps boss-class enemies behind their normal gate', () => {
  expect(pickSpaceEnemyKind(300, sequenceRandom([0.01, 0]))).toBe('bulwark')
})
