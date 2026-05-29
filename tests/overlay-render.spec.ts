import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('transition and death overlays render from a focused module', () => {
  const renderer = source('src/render/overlays.ts')
  const main = source('src/main.ts')

  expect(renderer).toContain('export function renderTransitionOverlay')
  expect(renderer).toContain('export function renderDeathOverlay')
  expect(renderer).toContain('TransitionOverlayRenderView')
  expect(renderer).toContain('DeathOverlayRenderView')
  expect(renderer).toContain("from '../math-utils'")
  expect(main).toContain("import { renderDeathOverlay as drawDeathOverlay, renderTransitionOverlay as drawTransitionOverlay } from './render/overlays'")
  expect(main).toContain('drawTransitionOverlay({')
  expect(main).toContain('drawDeathOverlay({')
  expect(main).not.toContain('private renderTransitionOverlay(')
  expect(main).not.toContain('private renderDeathOverlay(')
})
