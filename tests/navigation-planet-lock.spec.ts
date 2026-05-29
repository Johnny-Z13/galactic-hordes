import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { canLockPlanetCourse, nearestPlanetCourseTarget, planetCourseLockToast, resolveLandingIntent } from '../src/navigation-planet-lock'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const occurrences = (sourceText: string, text: string) => sourceText.split(text).length - 1

test('pending mutation signals can lock a planet course before nav upgrades', () => {
  expect(canLockPlanetCourse({
    navRank: 0,
    pendingUpgrades: 1,
    navPlanetLockRank: 3,
    hasLockedPlanet: false,
    stationAvailable: false,
    planetCount: 2
  })).toBe(true)
})

test('planet course lock stays unavailable while dock or existing lock has priority', () => {
  expect(canLockPlanetCourse({
    navRank: 4,
    pendingUpgrades: 1,
    navPlanetLockRank: 3,
    hasLockedPlanet: false,
    stationAvailable: true,
    planetCount: 2
  })).toBe(false)

  expect(canLockPlanetCourse({
    navRank: 4,
    pendingUpgrades: 1,
    navPlanetLockRank: 3,
    hasLockedPlanet: true,
    stationAvailable: false,
    planetCount: 2
  })).toBe(false)
})

test('nav rank can lock a planet course without banked signals', () => {
  expect(canLockPlanetCourse({
    navRank: 3,
    pendingUpgrades: 0,
    navPlanetLockRank: 3,
    hasLockedPlanet: false,
    stationAvailable: false,
    planetCount: 1
  })).toBe(true)

  expect(canLockPlanetCourse({
    navRank: 2,
    pendingUpgrades: 0,
    navPlanetLockRank: 3,
    hasLockedPlanet: false,
    stationAvailable: false,
    planetCount: 1
  })).toBe(false)
})

test('nearest planet course target uses ship distance', () => {
  const target = nearestPlanetCourseTarget([
    { id: 'far', name: 'Far', x: 600, y: 0 },
    { id: 'near', name: 'Near', x: -120, y: 0 },
    { id: 'diagonal', name: 'Diagonal', x: 0, y: 240 }
  ], { x: 0, y: 0 })

  expect(target?.id).toBe('near')
})

test('planet course lock toast distinguishes signal installs from nav ghosting', () => {
  expect(planetCourseLockToast({ pendingUpgrades: 1, planetName: 'Install World' })).toBe('SIGNAL COURSE LOCKED: Install World')
  expect(planetCourseLockToast({ pendingUpgrades: 0, planetName: 'Scout World' })).toBe('NAV GHOST LOCKED: Scout World')
})

test('main keeps planet course lock state in a focused helper', () => {
  const main = source()

  expect(main).toContain('private setPlanetCourse(target: Planet)')
  expect(occurrences(main, 'this.setPlanetCourse(target)')).toBe(1)
  expect(occurrences(main, 'this.autoNavTargetPlanetId = target.id')).toBe(1)
  expect(main).toContain('this.autoNavTargetBeacon = false')
})

test('main shares locked planet course lookup between update and render paths', () => {
  const main = source()

  expect(main).toContain('private lockedPlanetCourseTarget()')
  expect(occurrences(main, 'this.lockedPlanetCourseTarget()')).toBe(2)
  expect(occurrences(main, 'this.planets.find((planet) => planet.id === this.autoNavTargetPlanetId)')).toBe(1)
})

test('main clears planet course targets through a focused helper', () => {
  const main = source()

  expect(main).toContain('private clearPlanetCourse()')
  expect(occurrences(main, 'this.clearPlanetCourse()')).toBe(5)
  expect(occurrences(main, 'this.autoNavTargetPlanetId = null')).toBe(1)
})

test('main queries locked planet course state through a focused helper', () => {
  const main = source()

  expect(main).toContain('private hasLockedPlanetCourse()')
  expect(occurrences(main, 'this.hasLockedPlanetCourse()')).toBe(2)
  expect(occurrences(main, 'Boolean(this.autoNavTargetPlanetId)')).toBe(1)
})

test('landing intent prioritizes nearby planets then return beacon then course lock', () => {
  const planets = [
    { id: 'near', name: 'Near', x: 80, y: 0, radius: 30 },
    { id: 'far', name: 'Far', x: 600, y: 0, radius: 30 }
  ]

  expect(resolveLandingIntent({
    player: { x: 0, y: 0 },
    planets,
    returnBeaconAvailable: true,
    navRank: 0,
    pendingUpgrades: 0,
    navPlanetLockRank: 3,
    hasLockedPlanet: false
  })).toEqual({ action: 'land', planet: planets[0] })

  expect(resolveLandingIntent({
    player: { x: 240, y: 0 },
    planets,
    returnBeaconAvailable: true,
    navRank: 3,
    pendingUpgrades: 1,
    navPlanetLockRank: 3,
    hasLockedPlanet: false
  })).toEqual({ action: 'returnBeacon' })

  expect(resolveLandingIntent({
    player: { x: 240, y: 0 },
    planets,
    returnBeaconAvailable: false,
    navRank: 0,
    pendingUpgrades: 1,
    navPlanetLockRank: 3,
    hasLockedPlanet: false
  })).toEqual({ action: 'lockPlanetCourse', target: planets[0] })

  expect(resolveLandingIntent({
    player: { x: 240, y: 0 },
    planets,
    returnBeaconAvailable: false,
    navRank: 0,
    pendingUpgrades: 0,
    navPlanetLockRank: 3,
    hasLockedPlanet: false
  })).toEqual({ action: 'noSignal' })
})
