import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { surfaceRunBalance } from '../src/surface-balance'
import { surfaceRunInterest } from '../src/surface/interest'

test('surface run interest combines time planet and level pressure', () => {
  const interest = surfaceRunInterest({
    time: surfaceRunBalance.interest.timeDivisor / 2,
    planets: 2,
    level: 4
  })

  expect(interest).toBe(0.5 + 2 * surfaceRunBalance.interest.perPlanet + 4 * surfaceRunBalance.interest.perLevel)
})

test('surface run interest clamps into the encounter pressure range', () => {
  expect(surfaceRunInterest({ time: -999, planets: -10, level: -10 })).toBe(0)
  expect(surfaceRunInterest({ time: 999999, planets: 99, level: 99 })).toBe(1)
})

test('main delegates surface encounter interest to a focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const helper = readFileSync('src/surface/interest.ts', 'utf8')

  expect(helper).toContain('export function surfaceRunInterest')
  expect(main).toContain("from './surface/interest'")
  expect(main).toContain('return surfaceRunInterest(this.stats)')
  expect(main).not.toContain('surfaceRunBalance.interest.timeDivisor')
})
