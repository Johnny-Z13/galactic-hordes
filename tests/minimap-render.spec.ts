import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('minimap rendering lives in a focused render module', () => {
  const renderer = source('src/render/minimap.ts')
  const main = source('src/main.ts')

  expect(renderer).toContain('export function renderMinimap')
  expect(renderer).toContain('MinimapRenderView')
  expect(renderer).toContain('chunkLoadRadius')
  expect(renderer).toContain("enemy.kind === 'warden'")
  expect(renderer).toContain("ctx.fillStyle = '#57fff3'")
  expect(main).toContain("import { renderMinimap as drawMinimap } from './render/minimap'")
  expect(main).toContain('drawMinimap({')
  expect(main).not.toContain('private renderMinimap()')
})
