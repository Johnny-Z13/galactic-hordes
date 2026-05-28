import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const mainSource = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const harnessSource = () => readFileSync(resolve(process.cwd(), 'src/playtest-harness.ts'), 'utf8')
const HARNESS_URL = 'http://127.0.0.1:5176/?harness=1&resetProgress=1'

test('browser playthrough harness is guarded behind a harness query flag', () => {
  const main = mainSource()
  const harness = harnessSource()

  expect(main).toContain('private installHarnessIfRequested()')
  expect(main).toContain("import { installPlaytestHarnessIfRequested } from './playtest-harness'")
  expect(main).toContain('installPlaytestHarnessIfRequested(this)')
  expect(harness).toContain("params.get('harness')")
  expect(harness).toContain("hashParams.get('harness')")
  expect(harness).toContain("if (!['1', 'true', 'yes'].includes(requested.toLowerCase())) return")
  expect(main).toContain('this.installHarnessIfRequested()')
})

test('browser playthrough harness exposes a compact runtime snapshot', () => {
  const main = mainSource()
  const harness = harnessSource()

  expect(main).not.toContain('window.__galacticHarness = {')
  expect(harness).toContain('window.__galacticHarness = {')
  expect(harness).toContain('snapshot: () => ({')
  expect(harness).toContain("state: self['state']")
  expect(harness).toContain("time: self['stats'].time")
  expect(harness).toContain("kills: self['stats'].kills")
  expect(harness).toContain("level: self['stats'].level")
  expect(harness).toContain("xp: self['stats'].xp")
  expect(harness).toContain("nextXp: self['stats'].nextXp")
  expect(harness).toContain("hull: self['player'].hull")
  expect(harness).toContain("pendingUpgrades: self['pendingUpgrades']")
  expect(harness).toContain("lockedPlanetId: self['autoNavTargetPlanetId']")
  expect(harness).toContain('objective: {')
  expect(harness).toContain("currentNode: currentSectorNode(self['sectorMap']).config.templateId")
  expect(harness).toContain("perf: { ...self['perf'] }")
})

test('browser playthrough harness is live during a launched expedition', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto(HARNESS_URL, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => typeof window.__galacticHarness?.snapshot === 'function')

  await page.getByRole('button', { name: 'Launch Expedition', exact: true }).click()
  await page.getByRole('button', { name: 'Launch Expedition', exact: true }).click()
  await page.locator('.sector-choice').first().click()
  await page.waitForFunction(() => {
    const snapshot = window.__galacticHarness?.snapshot()
    return snapshot?.state === 'playing' && snapshot.time > 0
  })

  const snapshot = await page.evaluate(() => window.__galacticHarness?.snapshot())

  expect(snapshot?.state).toBe('playing')
  expect(snapshot?.time).toBeGreaterThan(0)
  expect(snapshot?.currentNode).toBe('safeDrift')
  expect(snapshot?.kills).toBe(0)
  expect(snapshot?.level).toBe(1)
  expect(snapshot?.xp).toBe(0)
  expect(snapshot?.nextXp).toBeGreaterThan(0)
  expect(snapshot?.pendingUpgrades).toBe(0)
  expect(snapshot?.lockedPlanetId).toBeNull()
  expect(snapshot?.objective?.label).toBe('ROUTE')
  expect(snapshot?.objective?.text).toContain('SCOUTS')
})
