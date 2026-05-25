import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')

test('xp collection drives a short bright ship absorb pulse', () => {
  const main = source()

  expect(main).toContain('xpAbsorbPulse: 0')
  expect(main).toContain('this.player.xpAbsorbPulse = Math.max(this.player.xpAbsorbPulse, 0.34)')
  expect(main).toContain('this.player.xpAbsorbPulse = Math.max(0, this.player.xpAbsorbPulse - dt)')
  expect(main).toContain('const absorbPulse = this.player.xpAbsorbPulse')
  expect(main).toContain('ctx.arc(0, 0, 26 + absorbPulse * 34')
})
