import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { nextSpaceWaveWarning, spaceWaveEnemyTotal, spaceWaveId } from '../src/space-wave-director'
import type { SectorWaveConfig } from '../src/sector-map'

const waves: SectorWaveConfig[] = [
  { atSeconds: 30, label: 'Scout drift', enemies: { chaser: 3, splinter: 1 }, notes: 'Low-pressure launch space.' },
  { atSeconds: 65, label: 'Knife wing', enemies: { razor: 2 } }
]

test('space wave ids stay stable for a node label and timing', () => {
  expect(spaceWaveId('node-a', waves[0])).toBe('node-a:Scout drift:30')
})

test('space wave enemy total sums authored enemy counts', () => {
  expect(spaceWaveEnemyTotal(waves[0])).toBe(4)
  expect(spaceWaveEnemyTotal({ atSeconds: 12, label: 'Empty', enemies: {} })).toBe(0)
})

test('next space wave warning appears only inside the warning window', () => {
  expect(nextSpaceWaveWarning({
    nodeId: 'node-a',
    waves,
    firedWaveIds: new Set(),
    elapsed: 10,
    warningSeconds: 12
  })).toBeNull()

  const warning = nextSpaceWaveWarning({
    nodeId: 'node-a',
    waves,
    firedWaveIds: new Set(),
    elapsed: 24,
    warningSeconds: 12
  })

  expect(warning).toEqual({
    id: 'node-a:Scout drift:30',
    label: 'Scout drift',
    secondsUntil: 6,
    enemyTotal: 4,
    progress: 0.5,
    notes: 'Low-pressure launch space.'
  })
})

test('next space wave warning skips fired waves', () => {
  const warning = nextSpaceWaveWarning({
    nodeId: 'node-a',
    waves,
    firedWaveIds: new Set([spaceWaveId('node-a', waves[0])]),
    elapsed: 58,
    warningSeconds: 12
  })

  expect(warning?.label).toBe('Knife wing')
  expect(warning?.secondsUntil).toBe(7)
})

test('main renders sector wave warnings from the space wave director', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const renderer = readFileSync('src/render/sector-wave-warning.ts', 'utf8')

  expect(main).toContain("from './space-wave-director'")
  expect(main).toContain("from './render/sector-wave-warning'")
  expect(main).toContain('spaceWaveId(this.sectorMap.currentNodeId, wave)')
  expect(main).toContain('nextSpaceWaveWarning({')
  expect(main).toContain('this.renderSectorWaveWarning(ctx)')
  expect(main).toContain('drawSectorWaveWarning({')
  expect(renderer).toContain('export function renderSectorWaveWarning')
})
