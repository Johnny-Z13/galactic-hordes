import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('surface interactable rendering lives in a focused surface renderer module', () => {
  const renderer = source('src/surface/render-interactables.ts')
  const main = source('src/main.ts')

  expect(renderer).toContain('export function renderSurfaceResources')
  expect(renderer).toContain('export function renderSurfaceLoreSites')
  expect(renderer).toContain('export function renderSurfaceAliens')
  expect(renderer).toContain('planetAlienCatalogVariants.length')
  expect(main).toContain("import { renderSurfaceAliens as drawSurfaceAliens, renderSurfaceLoreSites as drawSurfaceLoreSites, renderSurfaceResources as drawSurfaceResources } from './surface/render-interactables'")
  expect(main).toContain('drawSurfaceResources({')
  expect(main).toContain('drawSurfaceLoreSites({')
  expect(main).toContain('drawSurfaceAliens({')
  expect(main).not.toContain('private renderSurfaceResources(')
  expect(main).not.toContain('private renderSurfaceLoreSites(')
  expect(main).not.toContain('private renderSurfaceAliens(')
  expect(main).not.toContain('private renderCatalogAlien(')
})
