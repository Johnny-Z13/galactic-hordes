import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const dashboardSource = () => readFileSync(resolve(process.cwd(), 'src/sim/sim-dashboard.ts'), 'utf8')
const simLabHtml = () => readFileSync(resolve(process.cwd(), 'sim-lab.html'), 'utf8')

test('simulation dashboard surfaces median final clear pacing in summary cards', () => {
  const dashboard = dashboardSource()

  expect(dashboard).toContain("metricCard('Median Final Clear'")
  expect(dashboard).toContain("summary.route.medianFinalClearSeconds === null ? 'none' : formatSeconds(summary.route.medianFinalClearSeconds)")
})

test('simulation dashboard surfaces full opening-loop timing for tuning', () => {
  const dashboard = dashboardSource()

  expect(dashboard).toContain("metricCard('First Kill', formatSeconds(summary.firstMinute.medianFirstKillSec))")
  expect(dashboard).toContain("metricCard('Kills 0-60s', summary.firstMinute.averageKillsFirst60Sec.toFixed(1))")
  expect(dashboard).toContain("metricCard('First Landing', formatSeconds(summary.firstMinute.medianFirstLandingSec))")
  expect(dashboard).toContain("metricCard('First Workbench', formatSeconds(summary.firstMinute.medianFirstWorkbenchSec))")
  expect(dashboard).toContain('<th>First Landing</th>')
  expect(dashboard).toContain('<th>First Workbench</th>')
  expect(dashboard).toContain('run.firstMinute.firstLandingSec === null ?')
  expect(dashboard).toContain('run.firstMinute.firstWorkbenchSec === null ?')
})

test('simulation lab includes a full-arc balance preset', () => {
  const dashboard = dashboardSource()
  const html = simLabHtml()

  expect(html).toContain('data-preset="fullArc"')
  expect(html).toContain('Full Arc')
  expect(dashboard).toContain('fullArc: { runs: 100, maxSeconds: 1800, policy: \'balanced\', difficulty: \'normal\' }')
})

test('simulation lab cache-busts dashboard script updates', () => {
  const html = simLabHtml()

  expect(html).toContain('/src/sim/sim-dashboard.ts?v=')
})
