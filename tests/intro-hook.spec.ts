import { expect, test } from '@playwright/test'
import { introHookConfig, isFirstEverRun, pickWaypointTarget } from '../src/intro-hook'

test('introHookConfig has the expected tuning keys and sane defaults', () => {
  expect(introHookConfig.waypoint.durationSeconds).toBeGreaterThan(0)
  expect(introHookConfig.popup.lifeSeconds).toBeGreaterThan(0)
  expect(introHookConfig.popup.riseSpeed).toBeGreaterThan(0)
  expect(introHookConfig.hitFlash.durationSeconds).toBeGreaterThan(0)
  expect(introHookConfig.hitFlash.color).toMatch(/^#[0-9a-fA-F]{6}$/)
  expect(introHookConfig.hitstop.durationSeconds).toBeGreaterThan(0)
  expect(introHookConfig.hitstop.giantKindsOnly).toBe(true)
  expect(introHookConfig.magnetGlint.frameInterval).toBeGreaterThanOrEqual(1)
  expect(introHookConfig.magnetGlint.particleSpeed).toBeGreaterThan(0)
  expect(introHookConfig.safeDriftFirstNode.spawnMultiplier).toBeGreaterThan(1)
  expect(introHookConfig.safeDriftFirstNode.extraStartingSpawns).toBeGreaterThanOrEqual(0)
  expect(introHookConfig.firstPlanetPayoff.cacheMultiplier).toBeGreaterThan(1)
  expect(introHookConfig.firstPlanetPayoff.guaranteedRelic).toBe(true)
  expect(introHookConfig.firstPlanetPayoff.extraLoreSites).toBeGreaterThanOrEqual(0)
})

test('isFirstEverRun is true only on a fresh run with no debrief and zero planets', () => {
  expect(isFirstEverRun({ planets: 0, hasDebrief: false })).toBe(true)
  expect(isFirstEverRun({ planets: 0, hasDebrief: true })).toBe(false)
  expect(isFirstEverRun({ planets: 1, hasDebrief: false })).toBe(false)
  expect(isFirstEverRun({ planets: 5, hasDebrief: true })).toBe(false)
})

test('pickWaypointTarget returns the nearest planet', () => {
  const planets = [
    { id: 'far', x: 1000, y: 0 },
    { id: 'near', x: 50, y: 0 },
    { id: 'mid', x: 200, y: 200 }
  ]
  expect(pickWaypointTarget(planets, { x: 0, y: 0 })?.id).toBe('near')
})

test('pickWaypointTarget returns null when no planets exist', () => {
  expect(pickWaypointTarget([], { x: 0, y: 0 })).toBeNull()
})
