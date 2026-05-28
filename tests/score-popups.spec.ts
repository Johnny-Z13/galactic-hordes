import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('score popups carry their render layer and reward text', async () => {
  const mod = await import('../src/score-popups')
  const popup = mod.createScorePopup({
    x: 42,
    y: 84,
    value: 157.8,
    layer: 'surface',
    riseSpeed: 28,
    lifeSeconds: 0.6
  })

  expect(popup).toMatchObject({
    x: 42,
    y: 84,
    vy: -28,
    life: 0.6,
    totalLife: 0.6,
    text: '+158',
    layer: 'surface'
  })
})

test('score popups project through the matching camera layer', async () => {
  const mod = await import('../src/score-popups')
  const surfacePopup = mod.createScorePopup({
    x: 12,
    y: 18,
    value: 50,
    layer: 'surface',
    riseSpeed: 20,
    lifeSeconds: 0.6
  })
  const spacePopup = { ...surfacePopup, layer: 'space' as const }

  expect(mod.scorePopupScreenPoint(surfacePopup, {
    worldToScreen: (x, y) => ({ x: x + 1000, y: y + 1000 }),
    surfaceToScreen: (x, y) => ({ x: x - 5, y: y - 7 })
  })).toEqual({ x: 7, y: 11 })

  expect(mod.scorePopupScreenPoint(spacePopup, {
    worldToScreen: (x, y) => ({ x: x + 1000, y: y + 1000 }),
    surfaceToScreen: (x, y) => ({ x: x - 5, y: y - 7 })
  })).toEqual({ x: 1012, y: 1018 })
})

test('surface threat kills create surface-layer score feedback', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const updateSurfaceThreats = main.slice(main.indexOf('private updateSurfaceThreats'), main.indexOf('private updateSurfaceWaves'))

  expect(main).toContain("import { createScorePopup, scorePopupScreenPoint")
  expect(updateSurfaceThreats).toContain('this.pushScorePopup(createScorePopup({')
  expect(updateSurfaceThreats).toContain("layer: 'surface'")
  expect(updateSurfaceThreats).toContain('this.stats.kills += 1')
  expect(main).not.toContain('surface kills will render at an incorrect')
})
