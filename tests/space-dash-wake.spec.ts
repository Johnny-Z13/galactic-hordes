import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createDashWakeEffects } from '../src/space-dash-wake'

const sequence = (...values: number[]) => {
  let index = 0
  return () => values[index++ % values.length]
}

test('dash wake helper creates upgraded particles and a shockwave', () => {
  const effects = createDashWakeEffects({
    origin: { x: 100, y: 50 },
    direction: { x: 1, y: 0 },
    engineRank: 2,
    phaseRank: 2,
    intensity: 1,
    highLoad: false,
    glowEnabled: true,
    canAddShockwave: true,
    random: sequence(0.25, 0.5)
  })

  expect(effects.shockwaves).toHaveLength(1)
  expect(effects.shockwaves[0]).toMatchObject({
    x: 88,
    y: 50,
    radius: 26,
    speed: 484,
    life: 0.37,
    maxLife: 0.37,
    color: '#b990ff'
  })

  expect(effects.particles).toHaveLength(7)
  expect(effects.particles[0]).toMatchObject({
    color: '#d7fff7',
    angle: 0,
    sides: 4,
    glow: 32
  })
  expect(effects.particles[0].x).toBeLessThan(100)
  expect(effects.particles[0].vx).toBeLessThan(0)
})

test('dash wake helper suppresses low intensity effects under high load', () => {
  const effects = createDashWakeEffects({
    origin: { x: 100, y: 50 },
    direction: { x: 1, y: 0 },
    engineRank: 1,
    phaseRank: 0,
    intensity: 0.5,
    highLoad: true,
    glowEnabled: false,
    canAddShockwave: true,
    random: sequence(0)
  })

  expect(effects.particles).toHaveLength(0)
  expect(effects.shockwaves).toHaveLength(0)
})

test('main delegates dash wake construction to a focused module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const helper = readFileSync('src/space-dash-wake.ts', 'utf8')

  expect(helper).toContain('export function createDashWakeEffects')
  expect(main).toContain("from './space-dash-wake'")
  expect(main).toContain('const wake = createDashWakeEffects({')
})
