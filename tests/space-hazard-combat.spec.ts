import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { damageSpaceHazard, type SpaceHazardAsteroid } from '../src/space-hazard-combat'

const asteroid = (radius: number): SpaceHazardAsteroid => ({
  x: 100,
  y: 200,
  vx: 10,
  vy: -5,
  radius,
  spin: 0,
  life: 20,
  phase: 0,
  hitCooldown: 0,
  damageMultiplier: 1.1
})

const sequence = (...values: number[]) => {
  let index = 0
  return () => values[index++ % values.length]
}

test('asteroid hazard damage jitters velocity and reports burst feedback while alive', () => {
  const hazard = asteroid(60)
  const hazards = [hazard]

  const result = damageSpaceHazard({
    hazards,
    hazard,
    amount: 20,
    color: '#57fff3',
    random: sequence(0.5, 0.75)
  })

  expect(result).toMatchObject({
    score: 0,
    burst: { x: 100, y: 200, color: '#57fff3', count: 8, speed: 145 }
  })
  expect(hazard.radius).toBeCloseTo(45.6)
  expect(hazard.vx).toBeCloseTo(10)
  expect(hazard.vy).toBeCloseTo(4)
  expect(hazards).toEqual([hazard])
})

test('asteroid hazard damage removes and splits large destroyed asteroids', () => {
  const hazard = asteroid(60)
  const hazards = [hazard]

  const result = damageSpaceHazard({
    hazards,
    hazard,
    amount: 60,
    color: '#fff27a',
    random: sequence(0.5, 0.5, 0, 0.5, 0.5, 0.25, 0.25, 0.75, 0.5)
  })

  expect(result.score).toBe(5)
  expect(result.splitsCreated).toBe(2)
  expect(hazards).toHaveLength(2)
  expect(hazards[0]).toMatchObject({ hitCooldown: 0, damageMultiplier: 1.1 })
  expect(hazards[0].radius).toBeCloseTo(26.4)
  expect(hazards[0].life).toBeCloseTo(14.4)
  expect(hazards[1]).toMatchObject({ hitCooldown: 0, damageMultiplier: 1.1 })
  expect(hazards[1].radius).toBeCloseTo(26.4)
  expect(hazards[1].life).toBeCloseTo(14.4)
})

test('main delegates asteroid hazard combat to a focused module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const combat = readFileSync('src/space-hazard-combat.ts', 'utf8')

  expect(combat).toContain('export function damageSpaceHazard')
  expect(main).toContain("from './space-hazard-combat'")
  expect(main).toContain('damageSpaceHazardCombat({')
  expect(main).not.toContain('private damageSpaceHazard(')
})
