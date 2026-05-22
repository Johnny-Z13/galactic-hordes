import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { powerupBalance, upgrades } from '../src/powerup-balance'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')

test('dash uses a short active burst instead of a one frame nudge', () => {
  const main = source()

  expect(main).toContain('dashTime: 0')
  expect(main).toContain('private dashDuration()')
  expect(main).toContain('private dashSpeed()')
  expect(main).toContain('this.player.dashTime = this.dashDuration()')
  expect(main).toContain('this.player.vx = this.player.dashX * this.player.dashSpeed')
})

test('engine and phase upgrades make boost duration noticeably longer', () => {
  const maxEngineDuration = powerupBalance.dash.durationBase
    + 6 * powerupBalance.dash.durationPerEngineRank
  const maxEnginePhaseDuration = maxEngineDuration
    + 4 * powerupBalance.dash.durationPerPhaseRank

  expect(powerupBalance.dash.durationPerEngineRank).toBeGreaterThanOrEqual(0.04)
  expect(powerupBalance.dash.durationPerPhaseRank).toBeGreaterThanOrEqual(0.012)
  expect(powerupBalance.dash.durationMax).toBeGreaterThanOrEqual(0.45)
  expect(maxEngineDuration).toBeGreaterThan(powerupBalance.dash.durationBase * 2.6)
  expect(maxEnginePhaseDuration).toBeLessThanOrEqual(powerupBalance.dash.durationMax)
})

test('phase rudder enables controlled dash ramming', () => {
  const main = source()
  const phase = upgrades.find((upgrade) => upgrade.id === 'phase')

  expect(phase?.levels).toEqual(expect.arrayContaining(['+0.09s dash invulnerability', 'Dash ram shocks enemies']))
  expect(main).toContain('private tryDashRam(e: Enemy)')
  expect(main).toContain('this.player.dashTime <= 0 || this.build.phase <= 0')
  expect(main).toContain('if (this.tryDashRam(e)) continue')
})

test('dash upgrades advertise longer boost burns and visible wake effects', () => {
  const engine = upgrades.find((upgrade) => upgrade.id === 'engine')
  const phase = upgrades.find((upgrade) => upgrade.id === 'phase')

  expect(engine?.levels).toEqual(expect.arrayContaining(['+0.04s boost duration', '+0.05s boost duration']))
  expect(phase?.levels).toEqual(expect.arrayContaining(['+0.012s boost duration', 'Dash shockwave knocks enemies back harder']))
})

test('dash has dedicated wake and render VFX hooks', () => {
  const main = source()

  expect(main).toContain('private emitDashWake(')
  expect(main).toContain('this.emitDashWake(d, 1.35)')
  expect(main).toContain('this.emitDashWake({ x: this.player.dashX, y: this.player.dashY }')
  expect(main).toContain('const dashActive = this.player.dashTime > 0')
  expect(main).toContain('dashActive ?')
})
