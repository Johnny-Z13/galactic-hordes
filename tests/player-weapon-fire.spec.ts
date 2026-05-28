import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fireOptionOrbs, fireRearGun } from '../src/space-player-weapons'
import type { Bullet } from '../src/main-types'

const player = { x: 100, y: 50, vx: 10, vy: -4, aimAngle: 0 }

test('option orb fire helper emits option chain bullets from orbit positions', () => {
  const bullets: Bullet[] = []

  fireOptionOrbs({
    bullets,
    player,
    orbitRank: 3,
    fireSerial: 3,
    evolvedOrbit: false,
    evolvedChain: true,
    damage: 20,
    speed: 500,
    width: 1280,
    height: 720,
    scale: 1,
    time: 12,
    maxBullets: 99
  })

  expect(bullets).toHaveLength(2)
  expect(bullets[0]).toMatchObject({ option: true, chain: 1, color: '#8fff7d', pierce: 0 })
  expect(bullets[0].damage).toBeGreaterThan(0)
  expect(bullets[0].life).toBeGreaterThan(0)
})

test('rear gun helper emits backward twin-barrel coverage', () => {
  const bullets: Bullet[] = []

  fireRearGun({
    bullets,
    player,
    rearRank: 3,
    damage: 20,
    speed: 500,
    width: 1280,
    height: 720,
    scale: 1,
    maxBullets: 99
  })

  expect(bullets).toHaveLength(2)
  expect(bullets[0]).toMatchObject({ color: '#ff9d5c', rail: false, chain: 0, pierce: 0 })
  expect(bullets[1].vx).toBeLessThan(0)
})

test('secondary player weapon firing lives outside the main game class', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const weapons = readFileSync('src/space-player-weapons.ts', 'utf8')

  expect(weapons).toContain('export function optionOrbAngle')
  expect(weapons).toContain('export function optionOrbWorldPosition')
  expect(weapons).toContain('export function fireOptionOrbs')
  expect(weapons).toContain('export function fireRearGun')
  expect(main).toContain("from './space-player-weapons'")
  expect(main).not.toContain('private optionOrbAngle(')
  expect(main).not.toContain('private optionOrbWorldPosition(')
  expect(main).not.toContain('private fireOptionOrbs(')
  expect(main).not.toContain('private fireRearGun(')
})
