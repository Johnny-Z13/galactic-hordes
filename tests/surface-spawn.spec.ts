import { expect, test } from '@playwright/test'
import { surfaceThreatSpawnPoint } from '../src/surface-spawn'

test('moves surface threats out of the pilot and ship keepout', () => {
  const spawn = surfaceThreatSpawnPoint(
    { x: 840, y: 660 },
    [
      { x: 840, y: 660, radius: 26 },
      { x: 780, y: 590, radius: 34 }
    ],
    { minX: 40, maxX: 1560, minY: 40, maxY: 1140 },
    120,
    Math.PI
  )

  for (const keepout of [
    { x: 840, y: 660, radius: 26 },
    { x: 780, y: 590, radius: 34 }
  ]) {
    const distance = Math.hypot(spawn.x - keepout.x, spawn.y - keepout.y)
    expect(distance).toBeGreaterThanOrEqual(keepout.radius + 120)
  }
})

test('keeps adjusted surface threat spawns inside surface bounds', () => {
  const spawn = surfaceThreatSpawnPoint(
    { x: 18, y: 18 },
    [{ x: 40, y: 40, radius: 24 }],
    { minX: 40, maxX: 1560, minY: 40, maxY: 1140 },
    120,
    -Math.PI / 4
  )

  expect(spawn.x).toBeGreaterThanOrEqual(40)
  expect(spawn.x).toBeLessThanOrEqual(1560)
  expect(spawn.y).toBeGreaterThanOrEqual(40)
  expect(spawn.y).toBeLessThanOrEqual(1140)
})
