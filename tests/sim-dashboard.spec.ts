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

test('simulation lab includes a full-arc balance preset', () => {
  const dashboard = dashboardSource()
  const html = simLabHtml()

  expect(html).toContain('data-preset="fullArc"')
  expect(html).toContain('Full Arc')
  expect(dashboard).toContain('fullArc: { runs: 100, maxSeconds: 1800, policy: \'balanced\', difficulty: \'normal\' }')
})
