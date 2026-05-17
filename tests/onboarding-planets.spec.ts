import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import { ONBOARDING_PLANET_COUNT, onboardingPlanetSlot, useOnboardingPlanetField } from '../src/onboarding-planets'

const mainSource = () => fs.readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')

test('adds a denser planet field only before the first successful planet loop', () => {
  expect(useOnboardingPlanetField(0, 0, 0)).toBe(true)
  expect(useOnboardingPlanetField(0, 0, 1)).toBe(false)
  expect(useOnboardingPlanetField(1, 0, 0)).toBe(false)
  expect(ONBOARDING_PLANET_COUNT).toBeGreaterThanOrEqual(5)
})

test('places at least one onboarding planet close enough to read as landable immediately', () => {
  const slots = Array.from({ length: ONBOARDING_PLANET_COUNT }, (_, i) => onboardingPlanetSlot(i))
  expect(slots.some((slot) => Math.hypot(slot.x, slot.y) < 520)).toBe(true)
  expect(slots.filter((slot) => Math.hypot(slot.x, slot.y) < 900).length).toBeGreaterThanOrEqual(3)
})

test('main planet generator uses onboarding field before returning to normal density', () => {
  const main = mainSource()

  expect(main).toContain('useOnboardingPlanetField')
  expect(main).toContain('ONBOARDING_PLANET_COUNT')
  expect(main).toContain('onboardingPlanetSlot')
})
