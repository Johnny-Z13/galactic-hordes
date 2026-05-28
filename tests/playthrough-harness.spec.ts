import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const mainSource = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const HARNESS_URL = 'http://127.0.0.1:5176/?harness=1&resetProgress=1'

test('browser playthrough harness is guarded behind a harness query flag', () => {
  const main = mainSource()

  expect(main).toContain('private installHarnessIfRequested()')
  expect(main).toContain("params.get('harness')")
  expect(main).toContain("hashParams.get('harness')")
  expect(main).toContain("if (!['1', 'true', 'yes'].includes(requested.toLowerCase())) return")
  expect(main).toContain('this.installHarnessIfRequested()')
})

test('browser playthrough harness exposes a compact runtime snapshot', () => {
  const main = mainSource()

  expect(main).toContain('window.__galacticHarness = {')
  expect(main).toContain('snapshot: () => ({')
  expect(main).toContain('state: this.state')
  expect(main).toContain('time: this.stats.time')
  expect(main).toContain('hull: this.player.hull')
  expect(main).toContain('currentNode: currentSectorNode(this.sectorMap).config.templateId')
  expect(main).toContain('perf: { ...this.perf }')
})

test('browser playthrough harness is live during a launched expedition', async ({ page }) => {
  await page.goto(HARNESS_URL, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => typeof window.__galacticHarness?.snapshot === 'function')

  await page.getByRole('button', { name: 'Launch Expedition', exact: true }).click()
  await page.getByRole('button', { name: 'Launch Expedition', exact: true }).click()
  await page.locator('.sector-choice').first().click()
  await page.waitForTimeout(1200)

  const snapshot = await page.evaluate(() => window.__galacticHarness?.snapshot())

  expect(snapshot?.state).toBe('playing')
  expect(snapshot?.time).toBeGreaterThan(0)
  expect(snapshot?.currentNode).toBe('safeDrift')
})
