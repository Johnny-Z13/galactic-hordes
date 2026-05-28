import { expect, test } from '@playwright/test'
import { introWaypointLabelAnchor } from '../src/ui/intro-waypoint'

test('intro waypoint label anchor stays inside narrow mobile viewport edges', () => {
  const left = introWaypointLabelAnchor({
    width: 390,
    height: 844,
    targetScreen: { x: -220, y: 520 },
    fontPx: 14,
    label: 'LAND HERE',
    sublabel: 'MERCY FOSSIL SEA'
  })
  const right = introWaypointLabelAnchor({
    width: 390,
    height: 844,
    targetScreen: { x: 720, y: 520 },
    fontPx: 14,
    label: 'LAND HERE',
    sublabel: 'MERCY FOSSIL SEA'
  })

  expect(left.textX).toBeGreaterThanOrEqual(left.maxTextWidth / 2 + 8)
  expect(right.textX).toBeLessThanOrEqual(390 - right.maxTextWidth / 2 - 8)
  expect(left.arrowX).toBeGreaterThanOrEqual(28)
  expect(right.arrowX).toBeLessThanOrEqual(390 - 28)
})
