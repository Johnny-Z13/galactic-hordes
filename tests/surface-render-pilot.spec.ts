import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('surface pilot rendering lives in a focused surface renderer module', () => {
  const renderer = source('src/surface/render-pilot.ts')
  const main = source('src/main.ts')

  expect(renderer).toContain('export function renderSurfacePilot')
  expect(renderer).toContain("from '../surface-pilot'")
  expect(renderer).toContain('surfacePilotSpriteScale')
  expect(renderer).toContain('SURFACE_PILOT_SIZE_SCALE')
  expect(main).toContain("import { renderSurfacePilot as drawSurfacePilot } from './surface/render-pilot'")
  expect(main).toContain('drawSurfacePilot({')
  expect(main).not.toContain('private renderSurfacePilot(')
  expect(main).not.toContain('private renderFallbackSurfacePilot(')
})
