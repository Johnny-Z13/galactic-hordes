import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  advanceSurfaceOxygen,
  surfaceExtractionScore,
  surfaceInteractionAction,
  surfaceTakeoffRequest,
  surfaceTransitionProgress
} from '../src/surface/lifecycle'

test('surface oxygen enters return mode once low and requests takeoff when depleted', () => {
  const low = advanceSurfaceOxygen({ oxygen: 5, maxOxygen: 20, o2Returning: false, dt: 1, lowOxygenRatio: 0.25 })
  expect(low).toEqual({ oxygen: 4, o2Returning: true, lowTriggered: true, depleted: false })

  const empty = advanceSurfaceOxygen({ oxygen: 0.5, maxOxygen: 20, o2Returning: true, dt: 1, lowOxygenRatio: 0.25 })
  expect(empty).toEqual({ oxygen: 0, o2Returning: true, lowTriggered: false, depleted: true })
})

test('surface interaction priority keeps forced oxygen return above optional interactions', () => {
  expect(surfaceInteractionAction({ o2Returning: true, nearShip: true, interact: true, nearbyLore: true, nearbyAlien: true })).toBe('takeoff')
  expect(surfaceInteractionAction({ o2Returning: false, nearShip: true, interact: true, nearbyLore: true, nearbyAlien: false })).toBe('inspectLore')
  expect(surfaceInteractionAction({ o2Returning: false, nearShip: true, interact: true, nearbyLore: false, nearbyAlien: true })).toBe('openAlien')
  expect(surfaceInteractionAction({ o2Returning: false, nearShip: true, interact: true, nearbyLore: false, nearbyAlien: false })).toBe('takeoff')
})

test('surface takeoff request gates pending upgrades unless urgent or skipped', () => {
  expect(surfaceTakeoffRequest({ pendingUpgrades: 2 })).toEqual({ action: 'openWorkbench' })
  expect(surfaceTakeoffRequest({ pendingUpgrades: 2, urgent: true })).toEqual({ action: 'startTakeoff', duration: 1.2, toast: 'O2 LOW - RETURNING TO SHIP' })
  expect(surfaceTakeoffRequest({ pendingUpgrades: 2, skipWorkbench: true })).toEqual({ action: 'startTakeoff', duration: 1.2, toast: 'RETURNING TO ORBIT' })
})

test('surface transition progress reports snap and completion thresholds', () => {
  expect(surfaceTransitionProgress({ timer: 0.5, duration: 1.2 })).toEqual({ snapToOrbit: false, complete: false })
  expect(surfaceTransitionProgress({ timer: 0.6, duration: 1.2 })).toEqual({ snapToOrbit: true, complete: false })
  expect(surfaceTransitionProgress({ timer: 1.2, duration: 1.2 })).toEqual({ snapToOrbit: true, complete: true })
})

test('surface extraction score keeps first visit and revisit formulas explicit', () => {
  expect(surfaceExtractionScore({ firstVisit: true, collected: 3 })).toBeGreaterThan(surfaceExtractionScore({ firstVisit: false, collected: 3 }))
})

test('main delegates surface lifecycle decisions', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain("from './surface/lifecycle'")
  expect(main).toContain('advanceSurfaceOxygen({')
  expect(main).toContain('surfaceInteractionAction({')
  expect(main).toContain('surfaceTakeoffRequest({')
  expect(main).toContain('surfaceTransitionProgress({')
  expect(main).toContain('surfaceExtractionScore({')
  expect(main).not.toContain('private updateSurfaceOxygen(')
})
