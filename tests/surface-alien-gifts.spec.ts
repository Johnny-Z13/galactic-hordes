import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { TAU } from '../src/math-utils'
import { surfaceRunBalance } from '../src/surface-balance'
import {
  alienGiftOfferCopy,
  createBadAlienGiftThreats
} from '../src/surface/alien-gifts'

const middleRange = (min: number, max: number) => (min + max) / 2

test('alien gift offer copy is keyed by gift type', () => {
  expect(alienGiftOfferCopy('herb')).toContain('luminous herb')
  expect(alienGiftOfferCopy('idol')).toContain('cooled lightning')
  expect(alienGiftOfferCopy('map')).toContain('living map')
  expect(alienGiftOfferCopy('coin')).toContain('black coin')
  expect(alienGiftOfferCopy('beacon')).toContain('docking charter')
})

test('bad idol gift creates hostile ambush threats around the alien', () => {
  const threats = createBadAlienGiftThreats({
    gift: 'idol',
    origin: { x: 500, y: 400 },
    surface: { width: 1600, height: 1180 },
    time: 50,
    randomRange: middleRange
  })
  const balance = surfaceRunBalance.alien.badGift

  expect(threats).toHaveLength(balance.idolThreatCount)
  expect(threats[0]).toMatchObject({
    x: 500,
    y: 400,
    vx: 0,
    vy: 0,
    hp: balance.idolThreatHpBase + 50 * balance.idolThreatHpPerSecond,
    radius: balance.idolThreatRadius,
    phase: TAU / 2,
    color: '#ff5d73',
    hit: 0
  })
})

test('bad beacon gift creates blue dust threats and non-threat gifts create none', () => {
  const threats = createBadAlienGiftThreats({
    gift: 'beacon',
    origin: { x: 520, y: 440 },
    surface: { width: 1600, height: 1180 },
    time: 80,
    randomRange: middleRange
  })
  const balance = surfaceRunBalance.alien.badGift

  expect(threats).toHaveLength(balance.beaconThreatCount)
  expect(threats[0]).toMatchObject({
    hp: balance.beaconThreatHpBase + 80 * balance.beaconThreatHpPerSecond,
    radius: balance.beaconThreatRadius,
    color: '#70a8ff',
    hit: 0
  })
  expect(createBadAlienGiftThreats({
    gift: 'coin',
    origin: { x: 520, y: 440 },
    surface: { width: 1600, height: 1180 },
    time: 80,
    randomRange: middleRange
  })).toEqual([])
})

test('main delegates alien gift copy and ambush creation to the surface module', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain("from './surface/alien-gifts'")
  expect(main).toContain('alienGiftOfferCopy(alien.gift)')
  expect(main).toContain('createBadAlienGiftThreats({')
  expect(main).not.toContain('private alienOfferCopy(')
})
