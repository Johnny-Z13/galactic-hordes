import { expect, test } from '@playwright/test'
import { pickupMagnetRange, pickupMagnetStrength } from '../src/pickup-magnet'
import { powerupBalance } from '../src/powerup-balance'

test('xp pickups get extra attraction range over other drops', () => {
  const xpRange = pickupMagnetRange('xp', { magnetLevel: 0, limitMagnet: 0, hasHungryCompass: false })
  const repairRange = pickupMagnetRange('repair', { magnetLevel: 0, limitMagnet: 0, hasHungryCompass: false })

  expect(xpRange).toBeGreaterThanOrEqual(repairRange + 55)
})

test('starter xp vacuum reaches across opening combat drift', () => {
  const xpRange = pickupMagnetRange('xp', { magnetLevel: 0, limitMagnet: 0, hasHungryCompass: false })

  expect(xpRange).toBeGreaterThanOrEqual(260)
  expect(pickupMagnetStrength('xp')).toBeGreaterThanOrEqual(1600)
})

test('signal magnet range uses named balance values', () => {
  const base = pickupMagnetRange('repair', { magnetLevel: 0, limitMagnet: 0, hasHungryCompass: false })
  const rankOne = pickupMagnetRange('repair', { magnetLevel: 1, limitMagnet: 0, hasHungryCompass: false })
  const limited = pickupMagnetRange('repair', { magnetLevel: 1, limitMagnet: 1, hasHungryCompass: false })

  expect(base).toBe(powerupBalance.pickupMagnet.baseRange)
  expect(rankOne - base).toBe(powerupBalance.pickupMagnet.rangePerMagnetRank)
  expect(limited - rankOne).toBe(powerupBalance.pickupMagnet.rangePerLimitRank)
})

test('xp pickups pull harder than other drops', () => {
  expect(pickupMagnetStrength('xp')).toBe(powerupBalance.pickupMagnet.xpStrength)
  expect(pickupMagnetStrength('xp')).toBeGreaterThan(pickupMagnetStrength('repair'))
})

test('xp and repair pickups have enough pull to catch a moving ship', () => {
  expect(pickupMagnetStrength('xp')).toBeGreaterThanOrEqual(1300)
  expect(pickupMagnetStrength('repair')).toBe(powerupBalance.pickupMagnet.repairStrength)
  expect(pickupMagnetStrength('repair')).toBeGreaterThanOrEqual(900)
  expect(pickupMagnetStrength('repair')).toBeGreaterThan(pickupMagnetStrength('core'))
  expect(pickupMagnetStrength('xp')).toBeGreaterThan(pickupMagnetStrength('repair'))
})
