import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const workbenchSource = () => readFileSync(resolve(process.cwd(), 'src/ui/workbench.ts'), 'utf8')

test('audio director has distinct planet ambience and weapon cue profiles', () => {
  const main = source()

  expect(main).toContain("type PlanetAudioMood = Planet['archetype'] | 'deepSpace' | 'title'")
  expect(main).toContain("type WeaponSoundKind = 'pulse' | 'prism' | 'rail' | 'needle' | 'surface'")
  expect(main).toContain('private planetMoods: Record<PlanetAudioMood,')
  expect(main).toContain('private weaponProfiles: Record<WeaponSoundKind,')
  expect(main).toContain('update(dt: number, intensity: number, mood: PlanetAudioMood)')
})

test('gameplay events route to specialized audio cues', () => {
  const main = source()

  expect(main).toContain('this.audio.fire(this.weaponSoundKind')
  expect(main).toContain("this.audio.fire('surface'")
  expect(main).toContain('this.playBulletImpact(b.rail ? 1.3 : 1)')
  expect(main).toContain('this.playBulletImpact(0.85)')
  expect(workbenchSource()).toContain("self['audio'].install(installCueFor(self, choice), rare)")
  expect(main).toContain('this.audio.upgrade(uiInstallCueFor(this, choice),')
  expect(main).toContain('this.audio.planetSignal(planet.archetype)')
  expect(main).toContain('this.audio.boom(big ? ')
})

test('bullet impacts use an electric shield arc cue with cooldown', () => {
  const main = source()
  const impactCue = main.slice(main.indexOf('impact(power = 1)'), main.indexOf('pickup(kind: PickupSoundKind'))
  const playBulletImpact = main.slice(main.indexOf('private playBulletImpact'), main.indexOf('private damageSpaceHazard'))

  expect(impactCue).toContain("type: 'highpass'")
  expect(impactCue).toContain('filter: 5200')
  expect(impactCue).toContain('filter: 6400')
  expect(impactCue).toContain("this.tone(spark, 0.038, 'square'")
  expect(impactCue).toContain('setTimeout(() => this.tone(spark * 1.48')
  expect(main).toContain('this.impact(1.2)')
  expect(main).toContain('private bulletImpactCooldown = 0')
  expect(main).toContain('this.bulletImpactCooldown -= dt')
  expect(playBulletImpact).toContain('if (this.bulletImpactCooldown > 0) return')
  expect(playBulletImpact).toContain('this.audio.impact(power)')
})

test('weapon pulse audio uses a slow flanger path', () => {
  const main = source()

  expect(main).toContain('private weaponBus: GainNode | null = null')
  expect(main).toContain('private setupWeaponFlanger()')
  expect(main).toContain('flangerLfo.frequency.value = 0.16')
  expect(main).toContain('flangerDepth.gain.value = 0.0038')
  expect(main).toContain('const destination = this.weaponDestination(kind)')
})

test('ambient pulse is an explicit heartbeat clock for synced cues', () => {
  const main = source()

  expect(main).toContain('private beatTimer = 0')
  expect(main).toContain('private beatInterval = 0.7')
  expect(main).toContain('private updateBeatClock(dt: number, intensity: number, mood: PlanetAudioMood)')
  expect(main).toContain('private nextBeatDelay(subdivision = 1)')
  expect(main).toContain('this.syncToBeat(() => this.tone')
})
