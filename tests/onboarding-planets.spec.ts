import { expect, test } from '@playwright/test'
import fs from 'node:fs'

const mainSource = () => fs.readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')

test('main planet generator no longer forces an opening onboarding field', () => {
  const main = mainSource()

  expect(main).not.toContain('useOnboardingPlanetField')
  expect(main).not.toContain('ONBOARDING_PLANET_COUNT')
  expect(main).not.toContain('onboardingPlanetSlot')
  expect(main).toContain('const planetCount = this.sectorPlanetCount(rng)')
})

test('origin planets are placed by procedural chunk rules instead of a fixed dock point', () => {
  const main = mainSource()

  expect(main).not.toContain("chunkX === 0 && chunkY === 0 && index === 0 ? 'LUX MORGUE'")
  expect(main).not.toContain('centerBias ? 720')
  expect(main).not.toContain('centerBias ? 220')
})
