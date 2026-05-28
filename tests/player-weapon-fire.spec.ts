import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { applyOptionOrbDamage, deployMineWake, fireOptionOrbs, firePrimaryWeapon, fireRearGun, optionOrbWorldPosition, spawnChainBolt } from '../src/space-player-weapons'
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

test('primary weapon helper emits pulse volleys, rail shots, and needles', () => {
  const bullets: Bullet[] = []

  const result = firePrimaryWeapon({
    bullets,
    player,
    build: {
      rapid: 5,
      split: 1,
      rail: 3,
      rift: 2,
      heat: 0,
      echo: 0,
      pierce: 2,
      chain: 1
    },
    evolved: new Set(['chain']),
    limitBreaks: { cooldown: 0, might: 0, speed: 0, amount: 0 },
    statsLevel: 4,
    fireSerial: 10,
    width: 1280,
    height: 720,
    scale: 1,
    maxBullets: 99
  })

  expect(result).toMatchObject({ nextFireSerial: 11, rapid: 5, rayCount: 2, rail: true, needle: true })
  expect(result.fireCooldown).toBeCloseTo(0.25)
  expect(result.damage).toBeCloseTo(24.8)
  expect(result.speed).toBe(650)
  expect(bullets).toHaveLength(5)
  expect(bullets[0]).toMatchObject({ rail: true, color: '#fff27a', pierce: 9, chain: 4 })
  expect(bullets[0].life).toBeGreaterThan(0)
  expect(bullets[4]).toMatchObject({ rail: true, color: '#b990ff', pierce: 6, chain: 2 })
})

test('option orb damage helper reports enemies overlapped by orbiting satellites', () => {
  const time = 0
  const orbitRank = 1
  const radius = 66 + orbitRank * 8
  const orb = optionOrbWorldPosition(player, time, 0, 1, radius)
  const target = enemy(1, orb.x, orb.y)

  const result = applyOptionOrbDamage({
    enemies: [target],
    player,
    orbitRank,
    fireSerial: 2,
    evolvedOrbit: false,
    limitMight: 0,
    time,
    dt: 0.5
  })

  expect(result.hits).toHaveLength(1)
  expect(result.hits[0]).toMatchObject({ enemy: target, damage: 11.5, color: '#8fff7d' })
})

test('gravity halo option orbs pull nearby enemies toward the player', () => {
  const target = enemy(1, player.x + 50, player.y)

  applyOptionOrbDamage({
    enemies: [target],
    player,
    orbitRank: 6,
    fireSerial: 1,
    evolvedOrbit: true,
    limitMight: 0,
    time: 0,
    dt: 1
  })

  expect(target.vx).toBeLessThan(0)
})

test('mine wake helper drops a capped trail of evolved mines behind the player', () => {
  const bullets: Bullet[] = []

  deployMineWake({
    bullets,
    player,
    direction: { x: 1, y: 0 },
    mineRank: 5,
    evolvedMine: true,
    limitMight: 2,
    maxBullets: 99
  })

  expect(bullets).toHaveLength(6)
  expect(bullets[0]).toMatchObject({ mine: true, color: '#fff27a', pierce: 5 })
  expect(bullets[0].x).toBeLessThan(player.x)
  expect(bullets[0].vx).toBeLessThan(0)
  expect(bullets[0].damage).toBeGreaterThan(0)
  expect(bullets[0].life).toBeGreaterThan(0)
})

test('secondary player weapon firing lives outside the main game class', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const weapons = readFileSync('src/space-player-weapons.ts', 'utf8')

  expect(weapons).toContain('export function applyOptionOrbDamage')
  expect(weapons).toContain('export function deployMineWake')
  expect(weapons).toContain('export function firePrimaryWeapon')
  expect(weapons).toContain('export function optionOrbAngle')
  expect(weapons).toContain('export function optionOrbWorldPosition')
  expect(weapons).toContain('export function fireOptionOrbs')
  expect(weapons).toContain('export function fireRearGun')
  expect(weapons).toContain('export function spawnChainBolt')
  expect(main).toContain("from './space-player-weapons'")
  expect(main).toContain('applyOptionOrbDamage({')
  expect(main).toContain('deployMineWakeWeapon({')
  expect(main).toContain('firePrimaryWeapon(')
  expect(main).not.toContain('private deployMineWake(')
  expect(main).not.toContain('private optionOrbAngle(')
  expect(main).not.toContain('private optionOrbWorldPosition(')
  expect(main).not.toContain('private fireOptionOrbs(')
  expect(main).not.toContain('private fireRearGun(')
  expect(main).not.toContain('private spawnChainBolt(')
})
