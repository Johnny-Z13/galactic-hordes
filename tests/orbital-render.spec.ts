import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('main delegates option orbital drawing to a focused render module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const renderer = readFileSync('src/render/orbitals.ts', 'utf8')

  expect(main).toContain("from './render/orbitals'")
  expect(main).toContain('drawOrbitals({')
  expect(renderer).toContain('export function renderOrbitals')
})
