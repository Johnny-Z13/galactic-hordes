import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  advancePlayerDamageFlash,
  createPlayerDamageFlash,
  type PlayerDamageFlash
} from '../src/combat/player-damage-feedback'

test('player damage feedback distinguishes shield absorbed hits', () => {
  const flash = createPlayerDamageFlash({
    hullRatio: 1,
    hullDamage: 0,
    shieldDamage: 12,
    surface: false
  })

  expect(flash).toMatchObject({ kind: 'shield', color: '#57fff3' })
  expect(flash.alpha).toBeLessThan(0.35)
  expect(flash.maxLife).toBeLessThan(0.4)
})

test('player damage feedback strengthens critical hull hits', () => {
  const hull = createPlayerDamageFlash({ hullRatio: 0.65, hullDamage: 10, shieldDamage: 0, surface: false })
  const critical = createPlayerDamageFlash({ hullRatio: 0.18, hullDamage: 10, shieldDamage: 0, surface: false })

  expect(hull.kind).toBe('hull')
  expect(critical.kind).toBe('critical')
  expect(critical.alpha).toBeGreaterThan(hull.alpha)
  expect(critical.maxLife).toBeGreaterThan(hull.maxLife)
})

test('player damage feedback treats surface suit hits as red suit damage', () => {
  const flash = createPlayerDamageFlash({ hullRatio: 0.5, hullDamage: 8, shieldDamage: 0, surface: true })

  expect(flash).toMatchObject({ kind: 'surface', color: '#ff5d73' })
})

test('player damage feedback ages out in place', () => {
  const flash: PlayerDamageFlash = {
    kind: 'hull',
    color: '#ff5d73',
    life: 0.2,
    maxLife: 0.5,
    alpha: 0.42
  }

  expect(advancePlayerDamageFlash(flash, 0.1)?.life).toBeCloseTo(0.1)
  expect(advancePlayerDamageFlash(flash, 0.2)).toBeNull()
})

test('main wires player damage flash through damage update render and reset paths', () => {
  const source = readFileSync('src/main.ts', 'utf8')
  const damageResolution = readFileSync('src/combat/player-damage-resolution.ts', 'utf8')
  const renderer = readFileSync('src/render/player-damage-flash.ts', 'utf8')

  expect(source).toContain("from './combat/player-damage-feedback'")
  expect(source).toContain("import { renderPlayerDamageFlash as drawPlayerDamageFlash } from './render/player-damage-flash'")
  expect(source).toContain('private playerDamageFlash: PlayerDamageFlash | null = null')
  expect(source).toContain('advancePlayerDamageFlash(this.playerDamageFlash, dt)')
  expect(damageResolution).toContain('createPlayerDamageFlash({')
  expect(source).toContain('this.playerDamageFlash = damage.flash')
  expect(source).toContain('drawPlayerDamageFlash(ctx, this.playerDamageFlash, this.width, this.height)')
  expect(source).not.toContain('private renderPlayerDamageFlash(')
  expect(renderer).toContain('export function renderPlayerDamageFlash(')
  expect(source).toContain('this.playerDamageFlash = null')
})
