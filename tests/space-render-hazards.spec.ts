import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('space hazard and derelict signal rendering lives in a focused render module', () => {
  const renderer = source('src/render/space-hazards.ts')
  const main = source('src/main.ts')
  const math = source('src/math-utils.ts')

  expect(renderer).toContain('export function renderSpaceHazards')
  expect(renderer).toContain('export function renderDerelictSignals')
  expect(renderer).toContain('SpaceHazardRenderView')
  expect(renderer).toContain('DerelictSignalRenderView')
  expect(renderer).toContain("fillText('DERELICT CACHE'")
  expect(renderer).toContain("from '../math-utils'")
  expect(math).toContain('export const clamp')
  expect(main).toContain("import { renderDerelictSignals as drawDerelictSignals, renderSpaceHazards as drawSpaceHazards } from './render/space-hazards'")
  expect(main).toContain('drawSpaceHazards({')
  expect(main).toContain('drawDerelictSignals({')
  expect(main).not.toContain('private renderSpaceHazards(')
  expect(main).not.toContain('private renderDerelictSignals(')
})
