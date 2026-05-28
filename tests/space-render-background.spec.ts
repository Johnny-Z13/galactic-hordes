import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('space background rendering lives in a focused render module', () => {
  const renderer = source('src/render/space-background.ts')
  const main = source('src/main.ts')
  const math = source('src/math-utils.ts')

  expect(renderer).toContain('export function renderSpaceBackground')
  expect(renderer).toContain('SpaceBackgroundRenderView')
  expect(renderer).toContain('renderNebulaBands')
  expect(renderer).toContain('renderSectorLandmarks')
  expect(renderer).toContain("fillText(`SECTOR")
  expect(renderer).toContain("from '../math-utils'")
  expect(math).toContain('export const hash32')
  expect(math).toContain('export const rngFrom')
  expect(main).toContain("import { renderSpaceBackground as drawSpaceBackground } from './render/space-background'")
  expect(main).toContain('drawSpaceBackground({')
  expect(main).not.toContain('private renderBackground(')
  expect(main).not.toContain('private renderNebulaBands(')
  expect(main).not.toContain('private renderSectorLandmarks(')
})
