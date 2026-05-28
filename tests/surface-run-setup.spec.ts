import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createSurfaceResourceNodes, surfaceEventMessage } from '../src/surface/run-setup'

test('surface resource setup builds cache nodes with safe positions and event values', () => {
  const resources = createSurfaceResourceNodes({
    count: 2,
    event: 'relic',
    firstVisit: true,
    openingLanding: false,
    planetColor: '#57fff3',
    roll: () => 0,
    eventPoint: (index) => ({ x: 100 + index, y: 200 + index }),
    safePoint: (point) => ({ x: point.x + 10, y: point.y + 20 })
  })

  expect(resources).toHaveLength(2)
  expect(resources[0]).toMatchObject({ kind: 'cache', x: 110, y: 220, color: '#fff27a', collected: false })
  expect(resources[1].value).toBeGreaterThan(0)
})

test('surface event messages live in run setup module', () => {
  expect(surfaceEventMessage('horde', true, 'horde')).toContain('HORDE')
  expect(surfaceEventMessage('standard', true)).toContain('UNKNOWN SURFACE')
})

test('main delegates surface resource setup and messages', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain("from './surface/run-setup'")
  expect(main).toContain('createSurfaceResourceNodes({')
  expect(main).toContain('surfaceEventMessage(')
  expect(main).not.toContain('private surfaceEventMessage(')
})
