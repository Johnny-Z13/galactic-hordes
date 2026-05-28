import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import type { Enemy } from '../src/main-types'
import { createEnemyTrailParticle } from '../src/space-enemy-trails'

const enemy = (kind: Enemy['kind'], vx: number, vy: number): Enemy => ({
  id: 1,
  kind,
  x: 100,
  y: 50,
  vx,
  vy,
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

const sequence = (...values: number[]) => {
  let index = 0
  return () => values[index++ % values.length]
}

test('enemy trail helper creates a backward particle for fast sprite enemies', () => {
  const particle = createEnemyTrailParticle({
    enemy: enemy('shard', 120, 0),
    color: '#57fff3',
    intensity: 2,
    glowEnabled: true,
    random: sequence(0.1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
  })

  expect(particle).toMatchObject({
    color: '#57fff3',
    life: 0.28,
    maxLife: 0.28,
    angle: 0,
    glow: 28
  })
  expect(particle?.x).toBeLessThan(100)
  expect(particle?.vx).toBeLessThan(0)
  expect(particle?.length).toBeGreaterThan(40)
})

test('enemy trail helper skips slow or randomly suppressed enemies', () => {
  expect(createEnemyTrailParticle({
    enemy: enemy('shard', 20, 0),
    color: '#57fff3',
    intensity: 2,
    random: sequence(0)
  })).toBeNull()

  expect(createEnemyTrailParticle({
    enemy: enemy('shard', 120, 0),
    color: '#57fff3',
    intensity: 1,
    random: sequence(0.99)
  })).toBeNull()
})

test('main delegates enemy trail particle construction to a focused module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const trails = readFileSync('src/space-enemy-trails.ts', 'utf8')

  expect(trails).toContain('export function createEnemyTrailParticle')
  expect(main).toContain("from './space-enemy-trails'")
  expect(main).toContain('const trail = createEnemyTrailParticle({')
})
