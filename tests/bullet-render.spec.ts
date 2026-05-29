import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('main delegates bullet drawing to a focused render module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const renderer = readFileSync('src/render/bullets.ts', 'utf8')

  expect(main).toContain("from './render/bullets'")
  expect(main).toContain('drawBullets({')
  expect(main).toContain('drawBulletsSimple({')
  expect(renderer).toContain('export function renderBullets')
  expect(renderer).toContain('export function renderBulletsSimple')
})
