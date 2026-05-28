import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fireOptionOrbs, fireRearGun, spawnChainBolt } from '../src/space-player-weapons'
import type { Bullet, Enemy } from '../src/main-types'

const player = { x: 100, y: 50, vx: 10, vy: -4, aimAngle: 0 }
const enemy = (id: number, x: number, y: number): Enemy => ({
  id,
  kind: 'chaser',
  x,
  y,
  vx: 0,
  vy: 0,
  hp: 10,
  maxHp: 10,
  radius: 12,
  speed: 100,
  value: 1,
  phase: 0,
  cd: 0,
  color: '#57fff3',
  flash: 0
})

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

test('chain bolt helper jumps from the hit enemy to the nearest valid target', () => {
  const source = { x: 0, y: 0, vx: 0, vy: 0, life: 1, damage: 20, radius: 4, color: '#57fff3', pierce: 0, chain: 2 }
  const hit = enemy(1, 10, 0)
  const target = enemy(2, 80, 0)
  const farther = enemy(3, 180, 0)
  const bullets: Bullet[] = [source]

  spawnChainBolt({
    bullets,
    enemies: [hit, farther, target],
    source,
    hit,
    chainRank: 1,
    evolvedChain: true,
    maxBullets: 99
  })

  expect(bullets).toHaveLength(2)
  expect(bullets[1]).toMatchObject({ x: hit.x, y: hit.y, color: '#fff27a', rail: true, pierce: 0, chain: 1 })
  expect(bullets[1].vx).toBeGreaterThan(0)
  expect(bullets[1].damage).toBeCloseTo(11.6)
})

test('secondary player weapon firing lives outside the main game class', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const weapons = readFileSync('src/space-player-weapons.ts', 'utf8')

  expect(weapons).toContain('export function optionOrbAngle')
  expect(weapons).toContain('export function optionOrbWorldPosition')
  expect(weapons).toContain('export function fireOptionOrbs')
  expect(weapons).toContain('export function fireRearGun')
  expect(weapons).toContain('export function spawnChainBolt')
  expect(main).toContain("from './space-player-weapons'")
  expect(main).not.toContain('private optionOrbAngle(')
  expect(main).not.toContain('private optionOrbWorldPosition(')
  expect(main).not.toContain('private fireOptionOrbs(')
  expect(main).not.toContain('private fireRearGun(')
  expect(main).not.toContain('private spawnChainBolt(')
})
