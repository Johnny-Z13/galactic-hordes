import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('main delegates return beacon and autopilot drawing to a focused render module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const renderer = readFileSync('src/render/navigation-aids.ts', 'utf8')

  expect(main).toContain("from './render/navigation-aids'")
  expect(main).toContain('drawReturnBeacon({')
  expect(main).toContain('drawAutopilot({')
  expect(main).not.toContain('private renderReturnBeacon(')
  expect(main).not.toContain('private renderAutopilot(')
  expect(renderer).toContain('export function renderReturnBeacon')
  expect(renderer).toContain('export function renderAutopilot')
})
