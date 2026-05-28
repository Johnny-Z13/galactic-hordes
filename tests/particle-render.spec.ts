import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('main delegates particle drawing to a focused render module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const renderer = readFileSync('src/render/particles.ts', 'utf8')

  expect(main).toContain("from './render/particles'")
  expect(main).toContain('drawParticles({')
  expect(main).toContain('drawParticlesSimple({')
  expect(renderer).toContain('export function renderParticles')
  expect(renderer).toContain('export function renderParticlesSimple')
})
