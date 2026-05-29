import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createSurfaceBullet, findSurfaceTarget, updateSurfaceBulletsAndThreatDamage } from '../src/surface/bullet-combat'

test('surface bullets damage hit and push the first collided threat', () => {
  const bullets = [{ x: 100, y: 100, vx: 0, vy: 0, life: 1, radius: 4, damage: 12, color: '#fff27a' }]
  const threats = [{ x: 102, y: 100, vx: 0, vy: 0, hp: 40, radius: 16, phase: 0, color: '#ff5d73', hit: 0 }]

  const result = updateSurfaceBulletsAndThreatDamage({ bullets, threats, dt: 0.016, surface: { width: 1600, height: 1180 } })

  expect(bullets).toHaveLength(0)
  expect(threats[0].hp).toBe(28)
  expect(threats[0].hit).toBe(0.035)
  expect(threats[0].vx).toBeGreaterThan(0)
  expect(result.hits).toEqual([{ x: 100, y: 100, color: '#fff27a' }])
})

test('surface bullet updates remove expired and out-of-bounds bullets', () => {
  const bullets = [
    { x: 100, y: 100, vx: 0, vy: 0, life: 0.01, radius: 4, damage: 12, color: '#fff27a' },
    { x: 1700, y: 100, vx: 0, vy: 0, life: 1, radius: 4, damage: 12, color: '#fff27a' }
  ]

  updateSurfaceBulletsAndThreatDamage({ bullets, threats: [], dt: 0.05, surface: { width: 1600, height: 1180 } })

  expect(bullets).toHaveLength(0)
})

test('surface targeting picks the nearest threat inside gun range', () => {
  const near = { x: 220, y: 100, vx: 0, vy: 0, hp: 20, radius: 16, phase: 0, color: '#fff', hit: 0 }
  const far = { x: 700, y: 100, vx: 0, vy: 0, hp: 20, radius: 16, phase: 0, color: '#fff', hit: 0 }

  expect(findSurfaceTarget({ threats: [far, near], pilot: { x: 100, y: 100 } })).toBe(near)
})

test('surface gun bullet starts at muzzle offset and points at target', () => {
  const bullet = createSurfaceBullet({
    pilot: { x: 100, y: 100 },
    target: { x: 200, y: 100 },
    speed: 500,
    damage: 14,
    muzzleOffset: 12
  })

  expect(bullet.x).toBe(112)
  expect(bullet.y).toBe(100)
  expect(bullet.vx).toBe(500)
  expect(bullet.vy).toBeCloseTo(0)
  expect(bullet.damage).toBe(14)
})

test('main delegates surface bullets and threat damage to the surface combat module', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain("from './surface/bullet-combat'")
  expect(main).toContain('updateSurfaceBulletsAndThreatDamage({')
  expect(main).toContain('pickSurfaceTarget({')
  expect(main).toContain('createSurfaceBullet({')
  expect(main).not.toContain('threat.hp -= bullet.damage')
})
