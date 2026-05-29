import { expect, test } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sequence = (...values: number[]) => {
  let index = 0
  return () => values[index++ % values.length]
}

test('pickup glints stay short and subtle instead of using burst-scale trails', async () => {
  const helperPath = resolve(process.cwd(), 'src/pickup-glint.ts')
  expect(existsSync(helperPath)).toBe(true)
  const { createPickupGlintParticle } = await import('../src/pickup-glint')
  const particle = createPickupGlintParticle({
    x: 100,
    y: 120,
    color: '#57fff3',
    glow: true,
    random: sequence(0.25, 1, 1, 1, 1)
  })

  expect(Math.hypot(particle.vx, particle.vy)).toBeLessThanOrEqual(18)
  expect(particle.length).toBeLessThanOrEqual(12)
  expect(particle.maxLife).toBeLessThanOrEqual(0.32)
  expect(particle.size).toBeLessThanOrEqual(2)
  expect(particle.glow).toBeLessThanOrEqual(8)
})

test('magnet pickup glints do not go through the generic burst effect', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain("from './pickup-glint'")
  expect(main).toContain('this.emitPickupGlint(glint.x, glint.y)')
  expect(main).not.toContain('this.burst(glint.x, glint.y, introHookConfig.magnetGlint.color')
})
