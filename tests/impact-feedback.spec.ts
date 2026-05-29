import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  advanceImpactPulses,
  appendImpactPulse,
  createImpactPulse,
  type ImpactPulse
} from '../src/combat/impact-feedback'

test('impact feedback creates compact hit pulses for meaningful damage', () => {
  const pulse = createImpactPulse({
    kind: 'hit',
    x: 100,
    y: 200,
    color: '#57fff3',
    amount: 12,
    giant: false,
    highLoad: false
  })

  expect(pulse).toMatchObject({ kind: 'hit', x: 100, y: 200, color: '#57fff3' })
  expect(pulse?.radius).toBeGreaterThan(10)
  expect(pulse?.maxLife).toBeLessThan(0.3)
})

test('impact feedback suppresses ordinary high-load hit pulses', () => {
  expect(createImpactPulse({
    kind: 'hit',
    x: 0,
    y: 0,
    color: '#57fff3',
    amount: 10,
    giant: false,
    highLoad: true
  })).toBeNull()
})

test('impact feedback keeps and scales kill pulses under load', () => {
  const normal = createImpactPulse({ kind: 'kill', x: 0, y: 0, color: '#fff27a', amount: 20, giant: false, highLoad: true })
  const giant = createImpactPulse({ kind: 'kill', x: 0, y: 0, color: '#fff27a', amount: 20, giant: true, highLoad: true })

  expect(normal).not.toBeNull()
  expect(giant).not.toBeNull()
  expect(giant!.radius).toBeGreaterThan(normal!.radius)
  expect(giant!.maxLife).toBeGreaterThan(normal!.maxLife)
})

test('impact pulses age out in place', () => {
  const pulses: ImpactPulse[] = [
    { kind: 'hit', x: 0, y: 0, color: '#fff', life: 0.1, maxLife: 0.2, radius: 18, lineWidth: 1.4 },
    { kind: 'kill', x: 10, y: 0, color: '#fff', life: 0.6, maxLife: 0.6, radius: 44, lineWidth: 2 }
  ]

  advanceImpactPulses({ pulses, dt: 0.2 })

  expect(pulses).toHaveLength(1)
  expect(pulses[0]).toMatchObject({ kind: 'kill', x: 10, y: 0, color: '#fff', maxLife: 0.6, radius: 44, lineWidth: 2 })
  expect(pulses[0].life).toBeCloseTo(0.4)
})

test('impact pulse append skips null pulses and enforces a rolling cap', () => {
  const pulses: ImpactPulse[] = [
    { kind: 'hit', x: 1, y: 0, color: '#fff', life: 0.1, maxLife: 0.2, radius: 18, lineWidth: 1.4 },
    { kind: 'hit', x: 2, y: 0, color: '#fff', life: 0.1, maxLife: 0.2, radius: 18, lineWidth: 1.4 }
  ]

  appendImpactPulse({ pulses, pulse: null, cap: 2 })
  expect(pulses.map((pulse) => pulse.x)).toEqual([1, 2])

  appendImpactPulse({
    pulses,
    pulse: { kind: 'kill', x: 3, y: 0, color: '#fff', life: 0.6, maxLife: 0.6, radius: 44, lineWidth: 2 },
    cap: 2
  })

  expect(pulses.map((pulse) => pulse.x)).toEqual([2, 3])
})

test('main wires space impact pulses through damage kill update and render', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const renderer = readFileSync('src/render/impact-pulses.ts', 'utf8')

  expect(main).toContain("from './combat/impact-feedback'")
  expect(main).toContain("from './render/impact-pulses'")
  expect(main).toContain('private impactPulses: ImpactPulse[] = []')
  expect(main).toContain('advanceImpactPulses({ pulses: this.impactPulses, dt })')
  expect(main).toContain("kind: 'hit'")
  expect(main).toContain("kind: 'kill'")
  expect(main).toContain('appendImpactPulse({')
  expect(main).not.toContain('this.impactPulses.length > 96')
  expect(main).toContain('this.renderImpactPulses(ctx)')
  expect(main).toContain('drawImpactPulses({')
  expect(renderer).toContain('export function renderImpactPulses')
  expect(main).toContain('this.impactPulses = []')
})
