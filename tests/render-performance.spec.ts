import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('render performance helper owns high-load thresholds and glow eligibility', async () => {
  const modulePath = '../src/render/performance-mode'
  const helper = await import(modulePath).catch(() => null)
  expect(helper).not.toBeNull()

  const { renderHighLoad, renderGlowAllowed } = helper as {
    renderHighLoad: (input: { graphicsMode: string; particles: number; enemies: number; bullets: number; pickups: number }) => boolean
    renderGlowAllowed: (input: { graphicsMode: string; particles: number; enemies: number; bullets: number; pickups: number }) => boolean
  }

  const calm = { graphicsMode: 'GLOW', particles: 170, enemies: 120, bullets: 130, pickups: 150 }
  expect(renderHighLoad(calm)).toBe(false)
  expect(renderGlowAllowed(calm)).toBe(true)

  expect(renderHighLoad({ ...calm, graphicsMode: 'LOW' })).toBe(true)
  expect(renderGlowAllowed({ ...calm, graphicsMode: 'LOW' })).toBe(false)
  expect(renderHighLoad({ ...calm, particles: 171 })).toBe(true)
  expect(renderHighLoad({ ...calm, enemies: 121 })).toBe(true)
  expect(renderHighLoad({ ...calm, bullets: 131 })).toBe(true)
  expect(renderHighLoad({ ...calm, pickups: 151 })).toBe(true)
  expect(renderGlowAllowed({ ...calm, graphicsMode: 'MED' })).toBe(false)
})

test('main delegates high-load and glow decisions to render performance helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain("from './render/performance-mode'")
  expect(main).toContain('renderHighLoad({')
  expect(main).toContain('renderGlowAllowed({')
  expect(main).not.toContain('this.particles.length > 170')
  expect(main).not.toContain('this.enemies.length > 120')
  expect(main).not.toContain('this.bullets.length > 130')
  expect(main).not.toContain('this.pickups.length > 150')
})
