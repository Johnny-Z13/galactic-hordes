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
