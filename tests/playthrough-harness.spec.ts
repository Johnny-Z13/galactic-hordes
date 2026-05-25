import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const mainSource = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')

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
