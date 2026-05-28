import type { UpgradeBucket } from '../powerup-balance'
import type { SurfaceResourceKind } from '../surface-balance'
import type { PlanetArchetype } from '../surface-encounters'

export type PlanetAudioMood = PlanetArchetype | 'deepSpace' | 'title'
export type WeaponSoundKind = 'pulse' | 'prism' | 'rail' | 'needle' | 'surface'
export type AudioUpgradeCue = UpgradeBucket | 'evolution' | 'relic' | 'limit'
export type ExplosionSoundKind = 'small' | 'heavy' | 'surface' | 'gameover'
export type PickupSoundKind = 'xp' | 'repair' | 'magnet' | 'core' | 'chest' | SurfaceResourceKind | 'gift' | 'nav'

interface PlanetMoodProfile {
  root: number
  chord: [number, number, number]
  noise: number
  pulse: number
  wobble: number
  filter: number
}

interface WeaponSoundProfile {
  base: number
  upper: number
  wave: OscillatorType
  duration: number
  bend: number
  gain: number
  noise: number
  filter: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const rand = (min: number, max: number) => min + Math.random() * (max - min)

export class AudioDirector {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private sfx: GainNode | null = null
  private bed: GainNode | null = null
  private weaponBus: GainNode | null = null
  private flangerLfo: OscillatorNode | null = null
  private beatTimer = 0
  private beatInterval = 0.7
  private beatIndex = 0
  private ambientTimer = 0
  private mood: PlanetAudioMood = 'title'
  private unlocked = false
  private samples: Map<string, AudioBuffer> = new Map()
  private sampleUrls: Record<string, string> = {}
  private ambientLoop: { source: AudioBufferSourceNode; gain: GainNode; name: string } | null = null
  private planetMoods: Record<PlanetAudioMood, PlanetMoodProfile> = {
    title: { root: 55, chord: [0, 7, 12], noise: 0.012, pulse: 0.6, wobble: 0.4, filter: 820 },
    deepSpace: { root: 44, chord: [0, 5, 12], noise: 0.016, pulse: 0.48, wobble: 0.65, filter: 620 },
    cache: { root: 58, chord: [0, 7, 14], noise: 0.018, pulse: 0.68, wobble: 0.5, filter: 980 },
    hostile: { root: 41, chord: [0, 1, 7], noise: 0.03, pulse: 0.36, wobble: 0.9, filter: 520 },
    repair: { root: 62, chord: [0, 5, 9], noise: 0.01, pulse: 0.82, wobble: 0.28, filter: 1180 },
    relic: { root: 49, chord: [0, 7, 11], noise: 0.02, pulse: 0.52, wobble: 0.72, filter: 760 },
    strange: { root: 46, chord: [0, 6, 13], noise: 0.024, pulse: 0.44, wobble: 1.1, filter: 690 },
    lore: { root: 52, chord: [0, 3, 10], noise: 0.014, pulse: 0.72, wobble: 0.8, filter: 880 },
    horde: { root: 38, chord: [0, 1, 6], noise: 0.04, pulse: 0.3, wobble: 1.18, filter: 500 }
  }
  private weaponProfiles: Record<WeaponSoundKind, WeaponSoundProfile> = {
    pulse: { base: 310, upper: 890, wave: 'square', duration: 0.044, bend: 46, gain: 0.034, noise: 0.009, filter: 2500 },
    prism: { base: 420, upper: 1220, wave: 'triangle', duration: 0.052, bend: 82, gain: 0.032, noise: 0.006, filter: 3400 },
    rail: { base: 145, upper: 1480, wave: 'sawtooth', duration: 0.09, bend: -36, gain: 0.052, noise: 0.026, filter: 2100 },
    needle: { base: 760, upper: 1900, wave: 'square', duration: 0.065, bend: 180, gain: 0.038, noise: 0.014, filter: 3800 },
    surface: { base: 238, upper: 720, wave: 'square', duration: 0.048, bend: 24, gain: 0.04, noise: 0.018, filter: 1800 }
  }

  unlock() {
    if (this.unlocked) return
    const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return
    this.context = new AudioCtor()
    this.master = this.context.createGain()
    this.sfx = this.context.createGain()
    this.bed = this.context.createGain()
    this.master.gain.value = 0.36
    this.sfx.gain.value = 1
    this.bed.gain.value = 0.55
    this.setupWeaponFlanger()
    const limiter = this.context.createDynamicsCompressor()
    limiter.threshold.value = -18
    limiter.ratio.value = 9
    limiter.attack.value = 0.004
    limiter.release.value = 0.16
    this.sfx.connect(this.master)
    this.bed.connect(this.master)
    this.master.connect(limiter)
    limiter.connect(this.context.destination)
    this.unlocked = true
    void this.loadRegisteredSamples()
  }

  registerSamples(urlsByName: Record<string, string>) {
    Object.assign(this.sampleUrls, urlsByName)
    if (this.unlocked) void this.loadRegisteredSamples()
  }

  private async loadRegisteredSamples() {
    if (!this.context) return
    const ctx = this.context
    const pending = Object.entries(this.sampleUrls).filter(([name]) => !this.samples.has(name))
    await Promise.all(pending.map(async ([name, url]) => {
      try {
        const res = await fetch(url)
        const bytes = await res.arrayBuffer()
        const buffer = await ctx.decodeAudioData(bytes)
        this.samples.set(name, buffer)
      } catch {
        // sample missing/undecodable: silently skip so procedural audio keeps working
      }
    }))
  }

  playSample(name: string, opts: { gain?: number; rate?: number } = {}) {
    if (!this.context || !this.sfx) return
    const buffer = this.samples.get(name)
    if (!buffer) return
    const source = this.context.createBufferSource()
    const amp = this.context.createGain()
    source.buffer = buffer
    source.playbackRate.value = opts.rate ?? 1
    amp.gain.value = opts.gain ?? 1
    source.connect(amp)
    amp.connect(this.sfx)
    source.start(this.context.currentTime)
  }

  startAmbientLoop(name: string, gain = 0.5) {
    if (!this.context || !this.bed) return
    if (this.ambientLoop?.name === name) return
    this.stopAmbientLoop()
    const buffer = this.samples.get(name)
    if (!buffer) return
    const source = this.context.createBufferSource()
    const amp = this.context.createGain()
    source.buffer = buffer
    source.loop = true
    amp.gain.value = 0
    source.connect(amp)
    amp.connect(this.bed)
    source.start(this.context.currentTime)
    amp.gain.linearRampToValueAtTime(gain, this.context.currentTime + 0.6)
    this.ambientLoop = { source, gain: amp, name }
  }

  stopAmbientLoop() {
    if (!this.context || !this.ambientLoop) return
    const { source, gain } = this.ambientLoop
    const now = this.context.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(0, now + 0.4)
    source.stop(now + 0.45)
    this.ambientLoop = null
  }

  update(dt: number, intensity: number, mood: PlanetAudioMood) {
    if (!this.context || !this.master || !this.bed) return
    this.mood = mood
    this.ambientTimer -= dt
    if (this.ambientTimer <= 0) {
      this.ambientTimer = this.emitAmbientMood(mood, intensity)
    }
    this.updateBeatClock(dt, intensity, mood)
  }

  fire(kind: WeaponSoundKind, power: number) {
    const profile = this.weaponProfiles[kind]
    const drive = Math.min(9, power)
    const low = profile.base + drive * 14
    const high = profile.upper + drive * 28
    const destination = this.weaponDestination(kind)
    this.tone(low, profile.duration, profile.wave, profile.gain, 0.006, kind === 'rail' ? -10 : -12, { destination, filter: profile.filter, bend: profile.bend })
    this.tone(high, profile.duration * 0.72, kind === 'prism' ? 'sine' : 'triangle', profile.gain * 0.46, 0.004, kind === 'needle' ? -13 : -16, { destination, filter: profile.filter + 900, bend: profile.bend * 0.5 })
    if (profile.noise > 0) this.noise(profile.duration * 0.75, profile.noise, kind === 'rail' ? -14 : -19, { destination, filter: profile.filter * 0.72, type: kind === 'surface' ? 'highpass' : 'bandpass' })
  }

  hit() {
    this.impact(1.2)
    this.tone(140, 0.065, 'triangle', 0.022, 0.01, -20, { bend: -34, filter: 820 })
  }

  impact(power = 1) {
    const intensity = clamp(power, 0.65, 1.45)
    const spark = 980 + Math.random() * 180
    this.noise(0.032, 0.062 * intensity, -14, { filter: 3600 + spark, type: 'highpass' })
    this.noise(0.052, 0.036 * intensity, -19, { filter: 1850 + spark * 0.35, type: 'bandpass' })
    this.tone(spark, 0.038, 'square', 0.03 * intensity, 0.003, -15, { bend: 420, filter: 5200 })
    setTimeout(() => this.tone(spark * 1.48, 0.032, 'triangle', 0.022 * intensity, 0.003, -17, { bend: -260, filter: 6400 }), 18)
  }

  pickup(kind: PickupSoundKind = 'xp') {
    const base = {
      xp: 760,
      repair: 520,
      magnet: 980,
      core: 620,
      chest: 430,
      crystal: 840,
      scrap: 360,
      cache: 560,
      gift: 700,
      nav: 1040
    }[kind]
    const wave: OscillatorType = kind === 'scrap' || kind === 'chest' ? 'square' : kind === 'repair' ? 'triangle' : 'sine'
    this.tone(base + Math.random() * 70, 0.075, wave, 0.034, 0.01, -15, { filter: base * 3, bend: kind === 'magnet' || kind === 'nav' ? 120 : 22 })
    if (kind === 'chest' || kind === 'cache' || kind === 'core') this.tone(base * 1.5, 0.11, 'triangle', 0.026, 0.018, -17, { filter: 2400 })
  }

  level() {
    this.tone(360, 0.12, 'triangle', 0.05, 0.02, -12, { filter: 1800 })
    setTimeout(() => this.tone(540, 0.14, 'triangle', 0.055, 0.02, -12, { filter: 2200 }), 70)
    setTimeout(() => this.tone(810, 0.18, 'triangle', 0.07, 0.02, -12, { filter: 2800 }), 140)
    this.syncToBeat(() => this.tone(720, 0.08, 'sine', 0.026, 0.012, -18, { filter: 2600 }), 2)
  }

  install(cue: AudioUpgradeCue, rare = false) {
    const root = {
      weapons: 520,
      navigation: 680,
      survival: 390,
      economy: 760,
      planetcraft: 470,
      spacesuit: 580,
      control: 610,
      evolution: 300,
      relic: 260,
      limit: 860
    }[cue]
    const wave: OscillatorType = cue === 'weapons' || cue === 'control' ? 'square' : cue === 'relic' || cue === 'evolution' ? 'sawtooth' : 'triangle'
    this.tone(root, 0.08, wave, 0.043, 0.008, rare ? -10 : -13, { filter: 1900, bend: cue === 'evolution' ? 120 : 34 })
    setTimeout(() => this.tone(root * (cue === 'survival' ? 1.34 : 1.5), 0.1, 'square', 0.03, 0.006, rare ? -11 : -15, { filter: 2600 }), 55)
    setTimeout(() => this.tone(root * (rare ? 2.08 : 1.88), 0.13, 'sine', 0.034, 0.006, rare ? -10 : -14, { filter: 3400 }), 120)
    if (rare) this.noise(0.1, 0.08, -17, { filter: cue === 'relic' ? 920 : 1700, type: 'bandpass' })
  }

  upgrade(cue: AudioUpgradeCue, rare = false) {
    const root = {
      weapons: 640,
      navigation: 820,
      survival: 460,
      economy: 920,
      planetcraft: 560,
      spacesuit: 700,
      control: 740,
      evolution: 380,
      relic: 320,
      limit: 980
    }[cue]
    this.tone(root, 0.06, 'triangle', 0.04, 0.006, rare ? -10 : -14, { filter: 2600, bend: 48 })
    setTimeout(() => this.tone(root * 1.62, 0.09, 'sine', 0.036, 0.006, rare ? -10 : -15, { filter: 3600, bend: rare ? 86 : 38 }), 48)
    if (rare) setTimeout(() => this.tone(root * 2.12, 0.12, 'square', 0.026, 0.008, -15, { filter: 4200 }), 112)
  }

  boom(kind: ExplosionSoundKind = 'small') {
    const big = kind === 'heavy' || kind === 'gameover'
    const surface = kind === 'surface'
    this.noise(big ? 0.34 : surface ? 0.2 : 0.16, big ? 0.2 : 0.11, big ? -8 : -12, { filter: big ? 520 : 880, type: 'lowpass' })
    this.noise(big ? 0.16 : 0.08, big ? 0.1 : 0.046, big ? -14 : -18, { filter: big ? 1600 : 2400, type: 'bandpass' })
    this.tone(big ? 52 : surface ? 74 : 92, big ? 0.36 : 0.18, 'sawtooth', big ? 0.09 : 0.044, 0.018, big ? -8 : -13, { bend: big ? -28 : -16, filter: big ? 760 : 1100 })
    if (kind === 'gameover') setTimeout(() => this.tone(38, 0.55, 'triangle', 0.07, 0.04, -12, { bend: -10, filter: 620 }), 120)
  }

  land() {
    this.tone(160, 0.15, 'sine', 0.05, 0.02, -16, { bend: -22, filter: 900 })
    this.tone(240, 0.22, 'triangle', 0.045, 0.03, -15, { bend: -38, filter: 1300 })
    this.noise(0.12, 0.04, -20, { filter: 620, type: 'lowpass' })
  }

  planetSignal(mood: PlanetAudioMood) {
    const profile = this.planetMoods[mood]
    for (let i = 0; i < profile.chord.length; i += 1) {
      const note = this.note(profile.root, profile.chord[i] + 12)
      setTimeout(() => this.syncToBeat(() => this.tone(note, 0.12, i === 1 ? 'square' : 'triangle', 0.032, 0.014, -15, { filter: profile.filter + note * 2, bend: profile.wobble * 16 }), 2), i * 68)
    }
    this.noise(0.11, profile.noise * 2.6, -21, { filter: profile.filter, type: 'bandpass' })
  }

  private emitAmbientMood(mood: PlanetAudioMood, intensity: number) {
    if (!this.bed) return 1
    const bed = this.bed
    const profile = this.planetMoods[mood]
    const chord = profile.chord[Math.floor(Math.random() * profile.chord.length)]
    const low = this.note(profile.root, chord - 12)
    const dur = clamp(0.9 + Math.random() * 0.75 - intensity * 0.24, 0.44, 1.45)
    this.tone(low + rand(-profile.wobble * 3, profile.wobble * 3), dur, mood === 'hostile' ? 'sawtooth' : 'triangle', 0.024, 0.08, -24, { destination: bed, filter: profile.filter, bend: rand(-profile.wobble * 18, profile.wobble * 18) })
    if (Math.random() < 0.62) this.noise(0.08 + profile.noise * 4, profile.noise, -25, { destination: bed, filter: profile.filter + rand(-120, 220), type: mood === 'repair' ? 'lowpass' : 'bandpass' })
    return clamp(profile.pulse * 1.65 + Math.random() * 0.5, 0.55, 1.8)
  }

  private updateBeatClock(dt: number, intensity: number, mood: PlanetAudioMood) {
    if (!this.bed) return
    this.beatTimer -= dt
    if (this.beatTimer > 0) return
    const profile = this.planetMoods[mood]
    this.beatInterval = clamp(profile.pulse - intensity * 0.2, 0.24, 0.9)
    this.beatTimer = this.beatInterval
    this.heartbeat(mood, intensity)
    this.beatIndex += 1
  }

  private heartbeat(mood: PlanetAudioMood, intensity: number) {
    if (!this.bed) return
    const profile = this.planetMoods[mood]
    const accent = this.beatIndex % 4 === 0
    const chord = profile.chord[this.beatIndex % profile.chord.length]
    const note = this.note(profile.root, chord + Math.floor(intensity * 5))
    this.tone(note, 0.075, 'sawtooth', 0.024, 0.035, -18, { destination: this.bed, filter: profile.filter + note })
    this.tone(profile.root * 0.5, accent ? 0.12 : 0.08, 'sine', accent ? 0.02 : 0.012, 0.025, accent ? -23 : -27, { destination: this.bed, filter: profile.filter * 0.7 })
    if (Math.random() < 0.36 + intensity * 0.24) this.noise(0.055, profile.noise, -23, { destination: this.bed, filter: profile.filter, type: 'bandpass' })
  }

  private nextBeatDelay(subdivision = 1) {
    const step = this.beatInterval / Math.max(1, subdivision)
    if (step <= 0) return 0
    return clamp(this.beatTimer % step, 0, step)
  }

  private syncToBeat(fn: () => void, subdivision = 1) {
    const delay = this.nextBeatDelay(subdivision)
    if (delay <= 0.018) fn()
    else setTimeout(fn, delay * 1000)
  }

  private note(root: number, semitones: number) {
    return root * Math.pow(2, semitones / 12)
  }

  private setupWeaponFlanger() {
    if (!this.context || !this.sfx) return
    const weaponBus = this.context.createGain()
    const flangerDelay = this.context.createDelay(0.03)
    const flangerFeedback = this.context.createGain()
    const flangerWet = this.context.createGain()
    const flangerLfo = this.context.createOscillator()
    const flangerDepth = this.context.createGain()

    weaponBus.gain.value = 1
    flangerDelay.delayTime.value = 0.006
    flangerFeedback.gain.value = 0.18
    flangerWet.gain.value = 0.16
    flangerLfo.type = 'sine'
    flangerLfo.frequency.value = 0.16
    flangerDepth.gain.value = 0.0038

    flangerLfo.connect(flangerDepth)
    flangerDepth.connect(flangerDelay.delayTime)
    weaponBus.connect(this.sfx)
    weaponBus.connect(flangerDelay)
    flangerDelay.connect(flangerFeedback)
    flangerFeedback.connect(flangerDelay)
    flangerDelay.connect(flangerWet)
    flangerWet.connect(this.sfx)
    flangerLfo.start()

    this.weaponBus = weaponBus
    this.flangerLfo = flangerLfo
  }

  private weaponDestination(kind: WeaponSoundKind) {
    if (kind === 'surface') return undefined
    return this.weaponBus ?? undefined
  }

  private tone(freq: number, duration: number, type: OscillatorType, gain: number, attack: number, db: number, options: { bend?: number; filter?: number; destination?: AudioNode } = {}) {
    if (!this.context || !this.sfx) return
    const now = this.context.currentTime
    const osc = this.context.createOscillator()
    const filter = this.context.createBiquadFilter()
    const amp = this.context.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    if (options.bend) osc.frequency.exponentialRampToValueAtTime(Math.max(24, freq + options.bend), now + duration)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(options.filter ?? 1800 + freq, now)
    amp.gain.setValueAtTime(0.0001, now)
    amp.gain.exponentialRampToValueAtTime(gain * Math.pow(10, db / 20), now + attack)
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.connect(filter)
    filter.connect(amp)
    amp.connect(options.destination ?? this.sfx)
    osc.start(now)
    osc.stop(now + duration + 0.02)
  }

  private noise(duration: number, gain: number, db: number, options: { filter?: number; type?: BiquadFilterType; destination?: AudioNode } = {}) {
    if (!this.context || !this.sfx) return
    const now = this.context.currentTime
    const buffer = this.context.createBuffer(1, this.context.sampleRate * duration, this.context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) {
      const crush = i % 5 === 0 ? Math.random() * 2 - 1 : data[i - 1] || 0
      data[i] = crush * (1 - i / data.length)
    }
    const source = this.context.createBufferSource()
    const filter = this.context.createBiquadFilter()
    const amp = this.context.createGain()
    source.buffer = buffer
    filter.type = options.type ?? 'bandpass'
    filter.frequency.value = options.filter ?? 420 + Math.random() * 1400
    filter.Q.value = 1.8
    amp.gain.value = gain * Math.pow(10, db / 20)
    source.connect(filter)
    filter.connect(amp)
    amp.connect(options.destination ?? this.sfx)
    source.start(now)
  }
}
