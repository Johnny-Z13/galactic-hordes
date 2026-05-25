import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')

test('any pickup collection drives a short cyan ship absorb pulse', () => {
  const main = source()

  expect(main).toContain('pickupAbsorbPulse: 0')
  expect(main).toContain('this.player.pickupAbsorbPulse = Math.max(this.player.pickupAbsorbPulse, 0.34)')
  expect(main).toContain('this.player.pickupAbsorbPulse = Math.max(0, this.player.pickupAbsorbPulse - dt)')
  expect(main).toContain('const absorbPulse = this.player.pickupAbsorbPulse')
  expect(main).toContain("ctx.strokeStyle = '#70a8ff'")
  expect(main).toContain("ctx.shadowColor = '#57fff3'")
  expect(main).toContain('ctx.arc(0, 0, 26 + absorbPulse * 34')
})
