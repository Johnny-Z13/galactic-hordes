import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const cliSource = () => readFileSync(resolve(process.cwd(), 'src/sim/sim-cli.ts'), 'utf8')

test('sim CLI reports ten-minute survival retention in survival line', () => {
  const cli = cliSource()

  expect(cli).toContain('ten-minute')
  expect(cli).toContain('summary.survival.tenMinuteRate')
})
