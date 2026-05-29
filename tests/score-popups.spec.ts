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

test('signal popups carry explicit decision text and color', async () => {
  const mod = await import('../src/score-popups')
  const popup = mod.createSignalPopup({
    x: 12,
    y: 34,
    layer: 'space',
    riseSpeed: 28,
    lifeSeconds: 0.8
  })

  expect(popup).toMatchObject({
    x: 12,
    y: 34,
    vy: -28,
    life: 0.8,
    totalLife: 0.8,
    text: 'SIGNAL READY',
    color: '#fff27a',
    layer: 'space'
  })
})

test('install popups make workbench payoff readable', async () => {
  const mod = await import('../src/score-popups')
  const popup = mod.createInstallPopup({
    x: 56,
    y: 78,
    label: 'Pulse Cannon',
    layer: 'surface',
    riseSpeed: 24,
    lifeSeconds: 1.1
  })

  expect(popup).toMatchObject({
    x: 56,
    y: 78,
    vy: -24,
    life: 1.1,
    totalLife: 1.1,
    text: 'PULSE CANNON ONLINE',
    color: '#8fff7d',
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

test('score popup aging advances and removes expired rewards in place', async () => {
  const mod = await import('../src/score-popups')
  const popups = [
    mod.createScorePopup({ x: 0, y: 20, value: 10, layer: 'space', riseSpeed: 12, lifeSeconds: 0.6 }),
    mod.createScorePopup({ x: 0, y: 40, value: 20, layer: 'surface', riseSpeed: 10, lifeSeconds: 0.25 })
  ]

  mod.advanceScorePopups(popups, 0.3)

  expect(popups).toHaveLength(1)
  expect(popups[0]).toMatchObject({
    text: '+10',
    y: 16.4,
    life: 0.3,
    layer: 'space'
  })
})

test('score popup insertion enforces the shared visible cap', async () => {
  const mod = await import('../src/score-popups')
  const popups = [
    mod.createScorePopup({ x: 0, y: 0, value: 1, layer: 'space', riseSpeed: 1, lifeSeconds: 1 }),
    mod.createScorePopup({ x: 0, y: 0, value: 2, layer: 'space', riseSpeed: 1, lifeSeconds: 1 })
  ]

  mod.appendScorePopup(
    popups,
    mod.createScorePopup({ x: 0, y: 0, value: 3, layer: 'surface', riseSpeed: 1, lifeSeconds: 1 }),
    2
  )

  expect(popups.map((popup) => popup.text)).toEqual(['+2', '+3'])
  expect(popups.map((popup) => popup.layer)).toEqual(['space', 'surface'])
})

test('surface threat kills create surface-layer score feedback', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const renderer = readFileSync('src/render/score-popups.ts', 'utf8')
  const updateSurfaceThreats = main.slice(main.indexOf('private updateSurfaceThreats'), main.indexOf('private updateSurfaceWaves'))

  expect(main).toContain("import { advanceScorePopups, appendScorePopup, createInstallPopup, createScorePopup")
  expect(main).toContain("from './render/score-popups'")
  expect(main).toContain('advanceScorePopups(this.scorePopups, dt)')
  expect(main).toContain('drawScorePopups({')
  expect(main).not.toContain('private renderScorePopups(')
  expect(renderer).toContain('export function renderScorePopups')
  expect(renderer).toContain('scorePopupScreenPoint')
  expect(renderer).toContain('popup.color ?? introHookConfig.popup.color')
  expect(updateSurfaceThreats).toContain('appendScorePopup(this.scorePopups, createScorePopup({')
  expect(updateSurfaceThreats).toContain("layer: 'surface'")
  expect(updateSurfaceThreats).toContain('this.stats.kills += 1')
  expect(main).not.toContain('private pushScorePopup')
  expect(main).not.toContain('surface kills will render at an incorrect')
})

test('surface gameplay ages score popups so planet reward text clears', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const updateSurface = main.slice(main.indexOf('private updateSurface('), main.indexOf('private getInput(', main.indexOf('private updateSurface(')))

  expect(updateSurface).toContain('advanceScorePopups(this.scorePopups, dt)')
  expect(updateSurface.indexOf('advanceScorePopups(this.scorePopups, dt)')).toBeLessThan(updateSurface.indexOf('this.updateHud()'))
})
