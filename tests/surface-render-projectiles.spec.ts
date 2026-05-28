import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('surface projectile rendering lives in a focused surface renderer module', () => {
  const renderer = source('src/surface/render-projectiles.ts')
  const main = source('src/main.ts')

  expect(renderer).toContain('export function renderSurfaceBullets')
  expect(renderer).toContain('export function renderSurfaceWaveTelegraphs')
  expect(renderer).toContain("from '../surface-balance'")
  expect(renderer).toContain('surfaceWaveDirectorBalance.telegraph.pulseRadius')
  expect(renderer).toContain('surfaceWaveDirectorBalance.telegraph.radius')
  expect(main).toContain("import { renderSurfaceBullets as drawSurfaceBullets, renderSurfaceWaveTelegraphs as drawSurfaceWaveTelegraphs } from './surface/render-projectiles'")
  expect(main).toContain('drawSurfaceBullets({')
  expect(main).toContain('drawSurfaceWaveTelegraphs({')
  expect(main).not.toContain('private renderSurfaceBullets(')
  expect(main).not.toContain('private renderSurfaceWaveTelegraphs(')
})
