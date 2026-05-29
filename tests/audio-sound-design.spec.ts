import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const audioSource = () => readFileSync(resolve(process.cwd(), 'src/audio/audio-director.ts'), 'utf8')
const sfxSamplesSource = () => readFileSync(resolve(process.cwd(), 'src/audio/sfx-samples.ts'), 'utf8')
const uiClickCuesSource = () => readFileSync(resolve(process.cwd(), 'src/audio/ui-click-cues.ts'), 'utf8')
const workbenchSource = () => readFileSync(resolve(process.cwd(), 'src/ui/workbench.ts'), 'utf8')

test('audio director has distinct planet ambience and weapon cue profiles', () => {
  const audio = audioSource()

  expect(audio).toContain("export type PlanetAudioMood = PlanetArchetype | 'deepSpace' | 'title'")
  expect(audio).toContain("export type WeaponSoundKind = 'pulse' | 'prism' | 'rail' | 'needle' | 'surface'")
  expect(audio).toContain('private planetMoods: Record<PlanetAudioMood,')
  expect(audio).toContain('private weaponProfiles: Record<WeaponSoundKind,')
  expect(audio).toContain('update(dt: number, intensity: number, mood: PlanetAudioMood)')
})

test('main wires audio through focused modules', () => {
  const main = source()
  const samples = sfxSamplesSource()

  expect(main).toContain("import { AudioDirector")
  expect(main).toContain("from './audio/audio-director'")
  expect(main).toContain("import { sfxSamples } from './audio/sfx-samples'")
  expect(main).toContain('this.audio.registerSamples(sfxSamples)')
  expect(main).not.toContain('class AudioDirector')
  expect(samples).toContain('export const sfxSamples')
  expect(samples).toContain('UI_device_button2.mp3?url')
  expect(samples).toContain('UI_device_button3.mp3?url')
  expect(samples).toContain('UI_device_button4.mp3?url')
  expect(samples).toContain('UI_device_button5.mp3?url')
  expect(samples).toContain('UI_device_button6.mp3?url')
  expect(samples).toContain('Short Air Swhish.mp3?url')
  expect(samples).toContain("'ui-nav-swish': sfxUiNavSwishUrl")
  expect(samples).not.toContain('sfxUiButton1Url')
  expect(samples).not.toContain("'ui-button-1'")
  expect(samples).toContain('export const uiButtonSampleNames = [')
  expect(samples).toContain('export const uiButtonNavigationSampleNames = [')
  expect(samples).toContain('export const uiButtonConfirmSampleNames = [')
  expect(samples).toContain('export const uiButtonDangerSampleNames = [')
  expect(main).toContain("import { uiClickSoundForButton } from './audio/ui-click-cues'")
  expect(main).toContain('const cue = uiClickSoundForButton(button, this.uiClickSampleIndex)')
  expect(main).toContain('this.audio.playSample(cue.sample, { gain: cue.gain, rate: cue.rate })')
  expect(samples).toContain('Atmosphere_Lowloop_planetAMB.mp3?url')
})

test('ui click audio routes button intent to semantic sample pools', () => {
  const cues = uiClickCuesSource()

  expect(cues).toContain("export type UiClickSoundKind = 'navigation' | 'confirm' | 'danger'")
  expect(cues).toContain('uiButtonNavigationSampleNames')
  expect(cues).toContain('uiButtonConfirmSampleNames')
  expect(cues).toContain('uiButtonDangerSampleNames')
  expect(sfxSamplesSource()).toContain("'ui-nav-swish'")
  expect(sfxSamplesSource()).toContain("'ui-button-2': sfxUiButton2Url")
  expect(sfxSamplesSource()).toContain("'ui-button-3': sfxUiButton3Url")
  expect(sfxSamplesSource()).toContain("'ui-button-4': sfxUiButton4Url")
  expect(sfxSamplesSource()).toContain("'ui-button-5': sfxUiButton5Url")
  expect(sfxSamplesSource()).toContain("'ui-button-6': sfxUiButton6Url")
  expect(cues).toContain("button.dataset.uiSound === 'confirm'")
  expect(cues).toContain("button.classList.contains('workbench-install-choice')")
  expect(cues).toContain("button.classList.contains('start-button')")
  expect(cues).toContain("button.classList.contains('danger')")
})

test('semantic ui click cues give route commitments a confirm sound', () => {
  const cues = uiClickCuesSource()

  expect(cues).toContain("button.classList.contains('sector-choice')")
  expect(cues).toContain("button.classList.contains('sector-node') && button.classList.contains('available')")
  expect(cues).toContain("button.classList.contains('mothership-route-node') && button.classList.contains('available')")
  expect(cues).toContain("button.classList.contains('mothership-launch')")
  expect(cues).toContain("button.classList.contains('mothership-console-tab')")
  expect(cues).toContain("button.classList.contains('meta-department-toggle')")
})

test('gameplay events route to specialized audio cues', () => {
  const main = source()

  expect(main).toContain('this.audio.fire(weaponSoundKindFor({')
  expect(main).toContain("this.audio.fire('surface'")
  expect(main).toContain('this.playBulletImpact(b.rail ? 1.3 : 1)')
  expect(main).toContain('this.playBulletImpact(0.85)')
  expect(workbenchSource()).toContain("self['audio'].install(installCueFor(self, choice), rare)")
  expect(main).toContain('this.audio.upgrade(uiInstallCueFor(this, choice),')
  expect(main).toContain('this.audio.planetSignal(planet.archetype)')
  expect(main).toContain('this.audio.boom(feedback.boomKind)')
})

test('bullet impacts use an electric shield arc cue with cooldown', () => {
  const main = source()
  const audio = audioSource()
  const impactCue = audio.slice(audio.indexOf('impact(power = 1)'), audio.indexOf('pickup(kind: PickupSoundKind'))
  const playBulletImpact = main.slice(main.indexOf('private playBulletImpact'), main.indexOf('private damageSpaceHazard'))

  expect(impactCue).toContain("type: 'highpass'")
  expect(impactCue).toContain('filter: 5200')
  expect(impactCue).toContain('filter: 6400')
  expect(impactCue).toContain("this.tone(spark, 0.038, 'square'")
  expect(impactCue).toContain('setTimeout(() => this.tone(spark * 1.48')
  expect(audio).toContain('this.impact(1.2)')
  expect(main).toContain('private bulletImpactCooldown = 0')
  expect(main).toContain('this.bulletImpactCooldown -= dt')
  expect(playBulletImpact).toContain('if (this.bulletImpactCooldown > 0) return')
  expect(playBulletImpact).toContain('this.audio.impact(power)')
})

test('weapon pulse audio uses a slow flanger path', () => {
  const audio = audioSource()

  expect(audio).toContain('private weaponBus: GainNode | null = null')
  expect(audio).toContain('private setupWeaponFlanger()')
  expect(audio).toContain('flangerLfo.frequency.value = 0.16')
  expect(audio).toContain('flangerDepth.gain.value = 0.0038')
  expect(audio).toContain('const destination = this.weaponDestination(kind)')
})

test('ambient pulse is an explicit heartbeat clock for synced cues', () => {
  const audio = audioSource()

  expect(audio).toContain('private beatTimer = 0')
  expect(audio).toContain('private beatInterval = 0.7')
  expect(audio).toContain('private updateBeatClock(dt: number, intensity: number, mood: PlanetAudioMood)')
  expect(audio).toContain('private nextBeatDelay(subdivision = 1)')
  expect(audio).toContain('this.syncToBeat(() => this.tone')
})
