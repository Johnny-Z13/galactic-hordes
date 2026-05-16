import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')

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
  expect(main).toContain('this.audio.install(this.installCueFor(choice), rare)')
  expect(main).toContain('this.audio.planetSignal(planet.archetype)')
  expect(main).toContain('this.audio.boom(big ? ')
})

test('weapon pulse audio uses a slow flanger path', () => {
  const main = source()

  expect(main).toContain('private weaponBus: GainNode | null = null')
  expect(main).toContain('private setupWeaponFlanger()')
  expect(main).toContain('flangerLfo.frequency.value = 0.16')
  expect(main).toContain('flangerDepth.gain.value = 0.0038')
  expect(main).toContain('const destination = this.weaponDestination(kind)')
})
