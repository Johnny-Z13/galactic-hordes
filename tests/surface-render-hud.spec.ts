import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('surface hud rendering lives in a focused surface renderer module', () => {
  const renderer = source('src/surface/render-hud.ts')
  const main = source('src/main.ts')

  expect(renderer).toContain('export function renderSurfaceHud')
  expect(renderer).toContain('SurfaceHudRenderView')
  expect(renderer).toContain('surfaceWavePressureReadout({')
  expect(renderer).toContain('surfaceEventLabel')
  expect(renderer).toContain('surfaceScenarioLabel')
  expect(main).toContain("import { renderSurfaceHud as drawSurfaceHud } from './surface/render-hud'")
  expect(main).toContain('drawSurfaceHud({')
  expect(main).not.toContain('private renderSurfaceHud(')
  expect(main).not.toContain('private renderSurfacePressureHud(')
})
