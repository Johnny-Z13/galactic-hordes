import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('surface world backdrop rendering lives in a focused surface renderer module', () => {
  const renderer = source('src/surface/render-world.ts')
  const main = source('src/main.ts')

  expect(renderer).toContain('export function renderSurfaceWorld')
  expect(renderer).toContain('SurfaceWorldRenderView')
  expect(renderer).toContain('createLinearGradient')
  expect(renderer).toContain('renderSurfaceBiomeMotifs')
  expect(renderer).toContain('biome.horizonColor')
  expect(main).toContain("import { renderSurfaceWorld as drawSurfaceWorld } from './surface/render-world'")
  expect(main).toContain('drawSurfaceWorld({')
  expect(main).not.toContain('private renderSurfaceBiomeMotifs(')
})
