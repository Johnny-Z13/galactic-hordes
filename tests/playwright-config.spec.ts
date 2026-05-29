import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'

const root = join(import.meta.dirname, '..')

test('playwright config caps local worker count for stable full-suite runs', () => {
  const config = readFileSync(join(root, 'playwright.config.ts'), 'utf8')

  expect(config).toContain('defineConfig')
  expect(config).toContain('process.env.CI ? 2 : 4')
})
