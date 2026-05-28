import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('landing prompt rendering lives in a focused render module', () => {
  const renderer = source('src/render/landing-prompt.ts')
  const main = source('src/main.ts')

  expect(renderer).toContain('export function renderLandingPrompt')
  expect(renderer).toContain('LandingPromptRenderView')
  expect(renderer).toContain("PRESS E / Y TO LAND")
  expect(renderer).toContain("from '../math-utils'")
  expect(main).toContain("import { renderLandingPrompt as drawLandingPrompt } from './render/landing-prompt'")
  expect(main).toContain('drawLandingPrompt({')
  expect(main).not.toContain('private renderLandingPrompt(')
})
