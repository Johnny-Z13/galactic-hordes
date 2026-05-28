import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('surface threat rendering lives in the surface renderer module', () => {
  const renderer = source('src/surface/render-threats.ts')
  const main = source('src/main.ts')

  expect(renderer).toContain('export function renderSurfaceThreats')
  expect(renderer).toContain("from '../combat/damage-feedback'")
  expect(renderer).toContain('hitFlashColor(threat.hit > 0')
  expect(renderer).toContain('damageFeedbackConfig.hitFlash.color')
  expect(main).toContain("import { renderSurfaceThreats } from './surface/render-threats'")
  expect(main).toContain('renderSurfaceThreats({')
  expect(main).not.toContain('private renderSurfaceThreats(')
  expect(main).not.toContain('private renderGlassMiteOracleThreat(')
  expect(main).not.toContain('private renderCatalogBossThreat(')
  expect(main).not.toContain('private renderFallbackMite(')
})

test('surface threat renderer keeps sprite atlas frame dimensions local to surface rendering', () => {
  const renderer = source('src/surface/render-threats.ts')
  const main = source('src/main.ts')

  expect(renderer).toContain('const BOSS_CATALOG_ROWS = planetBossCatalogVariants.length')
  expect(renderer).toContain('const BOSS_CATALOG_FRAMES = 4')
  expect(main).not.toContain('const BOSS_CATALOG_ROWS = planetBossCatalogVariants.length')
  expect(main).not.toContain('const BOSS_CATALOG_FRAMES = 4')
})
