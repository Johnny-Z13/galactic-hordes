import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { balancedSpaceEnemyDefinition, spaceEnemyRunScale, spaceEnemySpeedBonus } from '../src/game-balance'
import { TAU } from '../src/math-utils'
import { spaceEnemyBehavior } from '../src/space-enemy-behavior'
import { createSpaceEnemy, createSplitChildEnemy } from '../src/space-enemy-factory'

const sequence = (...values: number[]) => {
  let index = 0
  return () => values[index++ % values.length]
}

test('space enemy factory builds scaled enemy state deterministically', () => {
  const time = 120
  const planets = 2
  const base = balancedSpaceEnemyDefinition('brute')
  const scale = spaceEnemyRunScale(time, planets)

  const enemy = createSpaceEnemy({
    id: 42,
    kind: 'brute',
    x: 10,
    y: 20,
    time,
    planets,
    random: sequence(0.25, 0.5)
  })

  expect(enemy).toMatchObject({
    id: 42,
    kind: 'brute',
    x: 10,
    y: 20,
    vx: 0,
    vy: 0,
    hp: base.hp * scale,
    maxHp: base.hp * scale,
    radius: base.radius,
    speed: base.speed + spaceEnemySpeedBonus(time),
    value: Math.floor(base.value * scale),
    phase: TAU * 0.25,
    cd: spaceEnemyBehavior.global.initialCooldownRandomSeconds * 0.5,
    color: base.color,
    flash: 0
  })
})

test('split child factory launches a deterministic chaser fragment', () => {
  const child = createSplitChildEnemy({
    id: 9,
    x: 100,
    y: 200,
    time: 90,
    random: sequence(0, 0.25)
  })

  expect(child).toMatchObject({
    id: 9,
    kind: 'chaser',
    x: 100 + spaceEnemyBehavior.splitChild.spawnOffset,
    y: 200,
    vx: spaceEnemyBehavior.splitChild.launchSpeed,
    vy: 0,
    hp: spaceEnemyBehavior.splitChild.hpBase + 90 / spaceEnemyBehavior.splitChild.hpTimeDivisor,
    maxHp: spaceEnemyBehavior.splitChild.hpBase + 90 / spaceEnemyBehavior.splitChild.hpTimeDivisor,
    radius: spaceEnemyBehavior.splitChild.radius,
    speed: spaceEnemyBehavior.splitChild.speed,
    value: spaceEnemyBehavior.splitChild.value,
    phase: TAU * 0.25,
    cd: 0,
    color: '#70a8ff',
    flash: 0
  })
})

test('main delegates enemy construction to the space enemy factory', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const factory = readFileSync('src/space-enemy-factory.ts', 'utf8')

  expect(factory).toContain('export function createSpaceEnemy')
  expect(factory).toContain('export function createSplitChildEnemy')
  expect(main).toContain("from './space-enemy-factory'")
  expect(main).toContain('const enemy = createSpaceEnemy({')
  expect(main).toContain('return createSplitChildEnemy({')
})

test('main preserves giant spawn rng order around audio cues', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const audioIndex = main.indexOf("this.audio.playSample(Math.random() < 0.5 ? 'alienship-scan-high' : 'alienship-scan-low'")
  const factoryIndex = main.indexOf('const enemy = createSpaceEnemy({')

  expect(audioIndex).toBeGreaterThan(0)
  expect(factoryIndex).toBeGreaterThan(0)
  expect(audioIndex).toBeLessThan(factoryIndex)
})
