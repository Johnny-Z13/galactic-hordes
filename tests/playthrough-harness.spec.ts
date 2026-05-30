import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { RESET_HARNESS_URL, waitForHarnessReady } from './harness-page'

const mainSource = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const harnessSource = () => readFileSync(resolve(process.cwd(), 'src/playtest-harness.ts'), 'utf8')

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
  expect(harness).toContain('interface PlaytestHarnessRuntime')
  expect(harness).toContain('function playtestHarnessRuntime(self: PlaytestHarnessHost)')
  expect(harness).not.toContain('Record<string, any>')
  expect(harness).not.toContain("self['")
  expect(harness).toContain('state: runtime.state')
  expect(harness).toContain('time: runtime.stats.time')
  expect(harness).toContain('kills: runtime.stats.kills')
  expect(harness).toContain('level: runtime.stats.level')
  expect(harness).toContain('xp: runtime.stats.xp')
  expect(harness).toContain('nextXp: runtime.stats.nextXp')
  expect(harness).toContain('hull: runtime.player.hull')
  expect(harness).toContain('pendingUpgrades: runtime.pendingUpgrades')
  expect(harness).toContain('lockedPlanetId: runtime.autoNavTargetPlanetId')
  expect(harness).toContain('objective: {')
  expect(harness).toContain('currentNode: currentSectorNode(runtime.sectorMap).config.templateId')
  expect(harness).toContain('perf: { ...runtime.perf }')
})

test('browser playthrough harness is live during a launched expedition', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto(RESET_HARNESS_URL, { waitUntil: 'domcontentloaded' })
  await waitForHarnessReady(page)

  await page.getByRole('button', { name: 'Launch Expedition', exact: true }).click()
  await page.getByRole('button', { name: 'Open Sector Map', exact: true }).click()
  // The hex-grid sector map is a two-step select-then-launch flow: tap an available
  // adjacent node to lock the jump (enabling the launch button), then launch. The intro
  // SAFE DRIFT node is the curated first jump this run expects to enter.
  await page.locator('.sector-node.available[data-node-id="h:1:0"]').click()
  await page.locator('.sector-launch-button').click()
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
  expect(snapshot?.objective?.text).toContain('Clear scouts, bank signal')
})
