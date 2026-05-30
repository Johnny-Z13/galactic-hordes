import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'

const root = join(import.meta.dirname, '..')

test('playwright config runs the harness suite serially against a managed dev server', () => {
  const config = readFileSync(join(root, 'playwright.config.ts'), 'utf8')

  expect(config).toContain('defineConfig')
  // Harness specs drive one in-page game singleton via a fixed URL, so they must run
  // single-worker to avoid stomping shared first-run/localStorage state.
  expect(config).toContain('workers: 1')
  // The suite must boot its own dev server so a cold `npm test` is not a false negative.
  expect(config).toContain('webServer')
  expect(config).toContain('http://127.0.0.1:5176/')
})
