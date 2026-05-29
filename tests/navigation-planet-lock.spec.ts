import { expect, test } from '@playwright/test'
import { canLockPlanetCourse, nearestPlanetCourseTarget, planetCourseLockToast, resolveLandingIntent } from '../src/navigation-planet-lock'

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
