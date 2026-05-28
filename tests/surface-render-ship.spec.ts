import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('surface ship rendering lives in a focused surface renderer module', () => {
  const renderer = source('src/surface/render-ship.ts')
  const main = source('src/main.ts')

  expect(renderer).toContain('export function renderSurfaceShip')
  expect(renderer).toContain('SurfaceShipRenderView')
  expect(renderer).toContain("ctx.rotate(-Math.PI / 2)")
  expect(renderer).toContain("strokeStyle = '#57fff3'")
  expect(renderer).toContain("strokeStyle = '#fff27a'")
  expect(main).toContain("import { renderSurfaceShip as drawSurfaceShip } from './surface/render-ship'")
  expect(main).toContain('drawSurfaceShip({')
  expect(main).not.toContain('private renderSurfaceShip(')
})
