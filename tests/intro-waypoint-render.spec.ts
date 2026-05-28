import { expect, test } from '@playwright/test'
import * as introWaypoint from '../src/ui/intro-waypoint'

test('intro waypoint label anchor stays inside narrow mobile viewport edges', () => {
  const left = introWaypoint.introWaypointLabelAnchor({
    width: 390,
    height: 844,
    targetScreen: { x: -220, y: 520 },
    fontPx: 14,
    label: 'LAND HERE',
    sublabel: 'MERCY FOSSIL SEA'
  })
  const right = introWaypoint.introWaypointLabelAnchor({
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

test('intro waypoint label anchor keeps bottom-edge desktop labels inside the viewport', () => {
  const anchor = introWaypoint.introWaypointLabelAnchor({
    width: 1280,
    height: 720,
    targetScreen: { x: 318, y: 940 },
    fontPx: 14,
    label: 'LAND HERE',
    sublabel: 'MERCY FOSSIL SEA'
  })

  expect(anchor.textX).toBeGreaterThanOrEqual(anchor.maxTextWidth / 2 + 12)
  expect(anchor.textBottom).toBeLessThanOrEqual(720 - 18)
  expect(anchor.textY).toBeLessThan(anchor.arrowY)
})

test('intro waypoint offscreen top label stays below the desktop hud reserve', () => {
  const anchor = introWaypoint.introWaypointLabelAnchor({
    width: 1280,
    height: 720,
    targetScreen: { x: 810, y: -180 },
    fontPx: 14,
    label: 'LAND HERE',
    sublabel: 'MERCY'
  })

  expect(anchor.textY).toBeGreaterThanOrEqual(92)
  expect(anchor.textBottom).toBeLessThanOrEqual(720 - 18)
})

test('intro waypoint onscreen label stays below the desktop hud reserve', () => {
  const anchor = introWaypoint.introWaypointOnscreenLabelAnchor({
    width: 1280,
    height: 720,
    targetScreen: { x: 810, y: 54 },
    fontPx: 14,
    label: 'LAND HERE',
    sublabel: 'MERCY'
  })

  expect(anchor.textY).toBeGreaterThanOrEqual(92)
  expect(anchor.textBottom).toBeLessThanOrEqual(720 - 18)
})
