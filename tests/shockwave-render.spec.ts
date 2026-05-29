import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('main delegates shockwave drawing to a focused render module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const renderer = readFileSync('src/render/shockwaves.ts', 'utf8')

  expect(main).toContain("from './render/shockwaves'")
  expect(main).toContain('drawShockwaves({')
  expect(renderer).toContain('export function renderShockwaves')
})
