import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const playerRender = () => readFileSync(resolve(process.cwd(), 'src/render/player.ts'), 'utf8')

test('any pickup collection drives a short cyan ship absorb pulse', () => {
  const main = source()
  const render = playerRender()

  expect(main).toContain('pickupAbsorbPulse: 0')
  expect(main).toContain('this.player.pickupAbsorbPulse = Math.max(this.player.pickupAbsorbPulse, 0.34)')
  expect(main).toContain('this.player.pickupAbsorbPulse = Math.max(0, this.player.pickupAbsorbPulse - dt)')
  expect(render).toContain('const absorbPulse = view.player.pickupAbsorbPulse')
  expect(render).toContain("ctx.strokeStyle = '#70a8ff'")
  expect(render).toContain("ctx.shadowColor = '#57fff3'")
  expect(render).toContain('ctx.arc(0, 0, 26 + absorbPulse * 34')
})
