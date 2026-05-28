import { expect, test } from '@playwright/test'
import { optionOrbProfile, pulseVolleyCount, rearGunProfile, starterSignatureFlags, weaponHudReadout } from '../src/weapon-signatures'

test('pulse cannon rank five earns its promised cadence double shot', () => {
  expect(pulseVolleyCount({ rapidRank: 4, fireSerial: 10, evolved: false })).toBe(1)
  expect(pulseVolleyCount({ rapidRank: 5, fireSerial: 10, evolved: false })).toBe(2)
  expect(pulseVolleyCount({ rapidRank: 8, fireSerial: 11, evolved: false })).toBe(1)
})

test('choir cannon evolves pulse fire into a three note volley', () => {
  expect(pulseVolleyCount({ rapidRank: 8, fireSerial: 11, evolved: true })).toBe(3)
})

test('starter branches expose visible signatures before max rank', () => {
  const signatures = starterSignatureFlags({
    rapid: 2,
    split: 1,
    engine: 2,
    magnet: 1,
    shield: 1,
    rail: 0,
    rift: 0,
    heat: 0
  })

  expect(signatures.pulseWake).toBe(true)
  expect(signatures.prismFins).toBe(true)
  expect(signatures.engineChevrons).toBe(true)
  expect(signatures.salvageField).toBe(true)
  expect(signatures.shieldHalo).toBe(true)
  expect(signatures.signatureCount).toBe(5)
})

test('option orb path adds visible satellites at key ranks', () => {
  expect(optionOrbProfile({ orbitRank: 0, fireSerial: 1, evolved: false })).toMatchObject({ count: 0, fires: false })
  expect(optionOrbProfile({ orbitRank: 1, fireSerial: 2, evolved: false })).toMatchObject({ count: 1, fires: true })
  expect(optionOrbProfile({ orbitRank: 3, fireSerial: 3, evolved: false })).toMatchObject({ count: 2, fires: true })
  expect(optionOrbProfile({ orbitRank: 5, fireSerial: 5, evolved: false })).toMatchObject({ count: 3, fires: true })
})

test('first option orb rank fires on alternate pulses until upgraded', () => {
  expect(optionOrbProfile({ orbitRank: 1, fireSerial: 1, evolved: false }).fires).toBe(false)
  expect(optionOrbProfile({ orbitRank: 1, fireSerial: 2, evolved: false }).fires).toBe(true)
  expect(optionOrbProfile({ orbitRank: 2, fireSerial: 1, evolved: false }).fires).toBe(true)
})

test('gravity halo evolves option orbs into a four satellite formation', () => {
  const profile = optionOrbProfile({ orbitRank: 6, fireSerial: 1, evolved: true })

  expect(profile.count).toBe(4)
  expect(profile.damageMultiplier).toBeGreaterThan(optionOrbProfile({ orbitRank: 6, fireSerial: 1, evolved: false }).damageMultiplier)
  expect(profile.pierce).toBeGreaterThan(0)
})

test('rear gun upgrade adds backward fire coverage and scales into twin barrels', () => {
  expect(rearGunProfile(0)).toMatchObject({ shots: 0, spread: 0, damageMultiplier: 0 })
  expect(rearGunProfile(1)).toMatchObject({ shots: 1, spread: 0 })
  expect(rearGunProfile(3).shots).toBe(2)
  expect(rearGunProfile(5).damageMultiplier).toBeGreaterThan(rearGunProfile(1).damageMultiplier)
})

test('weapon hud readout starts as the base pulse cannon', () => {
  expect(weaponHudReadout({ build: {}, evolved: new Set() })).toEqual({
    name: 'Pulse Cannon',
    tags: ['BASE'],
    text: 'Pulse Cannon // BASE'
  })
})

test('weapon hud readout names the strongest visible branch and limits tags', () => {
  const readout = weaponHudReadout({
    build: { rapid: 5, split: 3, rail: 2, chain: 1, orbit: 1 },
    evolved: new Set()
  })

  expect(readout.name).toBe('Rail Lattice')
  expect(readout.tags).toEqual(['VOLLEY', 'FAN', 'ARC'])
  expect(readout.text).toBe('Rail Lattice // VOLLEY FAN ARC')
})

test('weapon hud readout gives evolved weapons naming priority', () => {
  const readout = weaponHudReadout({
    build: { rapid: 8, split: 6, rail: 6, rift: 5 },
    evolved: new Set(['rapid', 'rail'])
  })

  expect(readout.name).toBe('Choir Cannon')
  expect(readout.tags).toEqual(['EVOLVED', 'VOLLEY', 'RAIL'])
})
