import { expect, test } from '@playwright/test'
import { beaconExtractionBonus, nextBeaconWindow, returnBeaconEligible } from '../src/return-beacons'

test('blocks first beacon before five minutes or before first planet', () => {
  expect(returnBeaconEligible({ time: 299, planetsVisited: 1, activeBeacon: false, nextBeaconAt: 0 })).toBe(false)
  expect(returnBeaconEligible({ time: 360, planetsVisited: 0, activeBeacon: false, nextBeaconAt: 0 })).toBe(false)
})

test('allows first beacon after five minutes and one planet', () => {
  expect(returnBeaconEligible({ time: 300, planetsVisited: 1, activeBeacon: false, nextBeaconAt: 0 })).toBe(true)
})

test('blocks beacon while another beacon is active', () => {
  expect(returnBeaconEligible({ time: 600, planetsVisited: 3, activeBeacon: true, nextBeaconAt: 0 })).toBe(false)
})

test('uses a later next beacon window after a skipped beacon', () => {
  expect(returnBeaconEligible({ time: 500, planetsVisited: 2, activeBeacon: false, nextBeaconAt: 540 })).toBe(false)
  expect(returnBeaconEligible({ time: 540, planetsVisited: 2, activeBeacon: false, nextBeaconAt: 540 })).toBe(true)
})

test('caps skipped beacon extraction bonus', () => {
  expect(beaconExtractionBonus(0)).toBe(1)
  expect(beaconExtractionBonus(2)).toBe(1.2)
  expect(beaconExtractionBonus(9)).toBe(1.3)
})

test('schedules the next beacon four minutes later', () => {
  expect(nextBeaconWindow(320)).toBe(560)
})
