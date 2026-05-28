import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  advanceSpawnEntryPings,
  createSpawnEntryPing,
  spawnEntryPingScreenPoint,
  type SpawnEntryPing
} from '../src/spawn-entry-feedback'

test('spawn entry ping creation distinguishes normal and giant arrivals', () => {
  const normal = createSpawnEntryPing({ x: 100, y: 200, color: '#ff5d73', giant: false })
  const giant = createSpawnEntryPing({ x: 300, y: 400, color: '#b990ff', giant: true })

  expect(normal).toMatchObject({ x: 100, y: 200, color: '#ff5d73', giant: false })
  expect(giant).toMatchObject({ x: 300, y: 400, color: '#b990ff', giant: true })
  expect(giant.maxLife).toBeGreaterThan(normal.maxLife)
  expect(giant.radius).toBeGreaterThan(normal.radius)
})

test('spawn entry pings age out in place', () => {
  const pings: SpawnEntryPing[] = [
    { x: 0, y: 0, color: '#fff', giant: false, life: 0.1, maxLife: 0.6, radius: 34 },
    { x: 10, y: 0, color: '#fff', giant: false, life: 0.5, maxLife: 0.6, radius: 34 }
  ]

  advanceSpawnEntryPings({ pings, dt: 0.2 })

  expect(pings).toEqual([
    { x: 10, y: 0, color: '#fff', giant: false, life: 0.3, maxLife: 0.6, radius: 34 }
  ])
})

test('spawn entry ping screen point clamps offscreen markers to the viewport edge', () => {
  expect(spawnEntryPingScreenPoint({
    screen: { x: 900, y: -50 },
    width: 800,
    height: 600,
    margin: 28
  })).toEqual({ x: 772, y: 28, offscreen: true })

  expect(spawnEntryPingScreenPoint({
    screen: { x: 300, y: 250 },
    width: 800,
    height: 600,
    margin: 28
  })).toEqual({ x: 300, y: 250, offscreen: false })
})

test('main wires spawn entry pings through spawn update and render', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const renderer = readFileSync('src/render/spawn-entry-pings.ts', 'utf8')

  expect(main).toContain("from './spawn-entry-feedback'")
  expect(main).toContain("from './render/spawn-entry-pings'")
  expect(main).toContain('private spawnEntryPings: SpawnEntryPing[] = []')
  expect(main).toContain('this.spawnEntryPings.push(createSpawnEntryPing({')
  expect(main).toContain('advanceSpawnEntryPings({ pings: this.spawnEntryPings, dt })')
  expect(main).toContain('this.renderSpawnEntryPings(ctx)')
  expect(main).toContain('drawSpawnEntryPings({')
  expect(renderer).toContain('export function renderSpawnEntryPings')
  expect(renderer).toContain('spawnEntryPingScreenPoint({')
})
