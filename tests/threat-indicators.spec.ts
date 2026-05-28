import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('threat indicators clamp offscreen enemies to readable viewport bearings', async () => {
  const { threatIndicatorMarkers } = await import('../src/render/threat-indicators')
  const markers = threatIndicatorMarkers({
    targets: [
      { x: 900, y: 300, color: '#ff5d73', radius: 20 },
      { x: 400, y: 300, color: '#57fff3', radius: 20 },
      { x: -100, y: -100, color: '#b990ff', radius: 54 }
    ],
    player: { x: 400, y: 300 },
    width: 800,
    height: 600,
    margin: 32,
    maxMarkers: 3,
    worldToScreen: (x, y) => ({ x, y })
  })

  expect(markers).toHaveLength(2)
  expect(markers[0]).toMatchObject({ x: 768, y: 300, color: '#ff5d73', giant: false })
  expect(markers[0].angle).toBeCloseTo(0)
  expect(markers[1]).toMatchObject({ x: 32, y: 32, color: '#b990ff', giant: true })
  expect(markers[1].angle).toBeLessThan(-2)
})

test('threat indicators prefer the nearest offscreen enemies', async () => {
  const { threatIndicatorMarkers } = await import('../src/render/threat-indicators')
  const markers = threatIndicatorMarkers({
    targets: [
      { x: 1200, y: 300, color: '#far', radius: 20 },
      { x: 850, y: 300, color: '#near', radius: 20 },
      { x: 950, y: 300, color: '#mid', radius: 20 }
    ],
    player: { x: 400, y: 300 },
    width: 800,
    height: 600,
    margin: 32,
    maxMarkers: 2,
    worldToScreen: (x, y) => ({ x, y })
  })

  expect(markers.map((marker) => marker.color)).toEqual(['#near', '#mid'])
})

test('main renders persistent threat indicators after enemy rendering', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const renderer = readFileSync('src/render/threat-indicators.ts', 'utf8')

  expect(main).toContain("from './render/threat-indicators'")
  expect(main).toContain('this.renderThreatIndicators(ctx)')
  expect(main.indexOf('this.renderEnemies(ctx)')).toBeLessThan(main.indexOf('this.renderThreatIndicators(ctx)'))
  expect(renderer).toContain('export function renderThreatIndicators')
  expect(renderer).toContain('threatIndicatorMarkers({')
})
