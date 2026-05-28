import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import type { Enemy } from '../src/main-types'
import { EnemySpatialGrid } from '../src/space-enemy-grid'

const enemy = (id: number, x: number, y: number, hp = 10): Enemy => ({
  id,
  kind: 'chaser',
  x,
  y,
  vx: 0,
  vy: 0,
  hp,
  maxHp: 10,
  radius: 12,
  speed: 100,
  value: 1,
  phase: 0,
  cd: 0,
  color: '#57fff3',
  flash: 0
})

test('enemy spatial grid returns enemies from the queried neighbor cells only', () => {
  const grid = new EnemySpatialGrid()
  const near = enemy(1, 40, 40)
  const adjacent = enemy(2, 190, 40)
  const far = enemy(3, 800, 800)
  const dead = enemy(4, 40, 40, 0)

  grid.rebuild([near, adjacent, far, dead])

  expect(grid.nearby(40, 40).map((entry) => entry.id)).toEqual([near.id, adjacent.id])
})

test('enemy spatial grid reuses its scratch array without leaking old results', () => {
  const grid = new EnemySpatialGrid()
  grid.rebuild([enemy(1, 40, 40)])

  const first = grid.nearby(40, 40)
  expect(first).toHaveLength(1)

  grid.clear()
  const second = grid.nearby(40, 40)
  expect(second).toBe(first)
  expect(second).toHaveLength(0)
})

test('main delegates enemy broad-phase lookup to the spatial grid module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const grid = readFileSync('src/space-enemy-grid.ts', 'utf8')

  expect(grid).toContain('export class EnemySpatialGrid')
  expect(main).toContain("from './space-enemy-grid'")
  expect(main).toContain('private enemyGrid = new EnemySpatialGrid()')
  expect(main).not.toContain('private gridKey(')
  expect(main).not.toContain('private nearbyEnemyScratch')
})
