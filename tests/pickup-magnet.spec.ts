import { expect, test } from '@playwright/test'
import { pickupMagnetRange, pickupMagnetStrength } from '../src/pickup-magnet'

test('xp pickups get extra attraction range over other drops', () => {
  const xpRange = pickupMagnetRange('xp', { magnetLevel: 0, limitMagnet: 0, hasHungryCompass: false })
  const repairRange = pickupMagnetRange('repair', { magnetLevel: 0, limitMagnet: 0, hasHungryCompass: false })

  expect(xpRange).toBeGreaterThanOrEqual(repairRange + 55)
})

test('xp pickups pull harder than other drops', () => {
  expect(pickupMagnetStrength('xp')).toBeGreaterThanOrEqual(960)
  expect(pickupMagnetStrength('xp')).toBeGreaterThan(pickupMagnetStrength('repair'))
})
