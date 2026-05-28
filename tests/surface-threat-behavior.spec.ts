import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { surfaceThreatMotionBalance } from '../src/surface-balance'
import { spawnSurfaceSplitterChildren, updateSurfaceThreatMotion } from '../src/surface/threat-behavior'

test('orbiter threat steering adds tangential velocity around the pilot', () => {
  const threat = { x: 0, y: 0, vx: 0, vy: 0, hp: 100, radius: 20, phase: 0, color: '#fff', hit: 0, behavior: 'orbiter' as const, boss: true }

  const result = updateSurfaceThreatMotion({
    threat,
    pilot: { x: 400, y: 0, invuln: 1 },
    surface: { width: 1600, height: 1180 },
    dt: 0.1
  })

  expect(threat.vx).toBeGreaterThan(0)
  expect(threat.vy).toBeGreaterThan(0)
  expect(result.contactDamage).toBeNull()
})

test('blinker threat dashes and resets cooldown when far enough from pilot', () => {
  const threat = { x: 0, y: 0, vx: 0, vy: 0, hp: 100, radius: 20, phase: 0, color: '#a879ff', hit: 0, behavior: 'blinker' as const, boss: true, behaviorCooldown: 0 }

  const result = updateSurfaceThreatMotion({
    threat,
    pilot: { x: surfaceThreatMotionBalance.blink.minDistance + 120, y: 0, invuln: 1 },
    surface: { width: 1600, height: 1180 },
    dt: 0.1,
    random: () => 0
  })

  expect(threat.vx).toBeGreaterThan(50)
  expect(threat.behaviorCooldown).toBe(surfaceThreatMotionBalance.blink.cooldownMin)
  expect(result.blinkBurst).toEqual({ x: 0, y: 0, color: '#a879ff', count: 8, speed: 120 })
})

test('splitter death creates bounded child threats with scatter velocity', () => {
  const children = spawnSurfaceSplitterChildren({
    threat: { x: 80, y: 80, vx: 0, vy: 0, hp: 0, radius: 42, phase: 0, color: '#7dffb0', hit: 0, behavior: 'splitter' },
    surface: { width: 1600, height: 1180 },
    time: 120,
    random: () => 0
  })

  expect(children).toHaveLength(surfaceThreatMotionBalance.splitter.childCount)
  for (const child of children) {
    expect(child.splitChild).toBe(true)
    expect(child.behavior).toBe('chaser')
    expect(child.x).toBeGreaterThanOrEqual(surfaceThreatMotionBalance.edgePadding)
    expect(child.y).toBeGreaterThanOrEqual(surfaceThreatMotionBalance.edgePadding)
    expect(Math.hypot(child.vx, child.vy)).toBeGreaterThan(0)
  }
})

test('main delegates surface threat behavior to the surface module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const behavior = readFileSync('src/surface/threat-behavior.ts', 'utf8')

  expect(main).toContain("from './surface/threat-behavior'")
  expect(main).toContain('updateSurfaceThreatMotion({')
  expect(main).toContain('spawnSurfaceSplitterChildren({')
  expect(main).not.toContain('private steerSurfaceThreat(')
  expect(main).not.toContain('private limitSurfaceThreatSpeed(')
  expect(behavior).toContain("behavior === 'orbiter'")
  expect(behavior).toContain("behavior === 'blinker'")
  expect(behavior).toContain('surfaceThreatMotionBalance')
})
