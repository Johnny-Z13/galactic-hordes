import type { GameState } from '../game-states'
import { clamp, dist2 } from '../math-utils'
import { mutationSignalAlmostReady, mutationXpReadout } from '../mutation-progress'
import type { UpgradeId } from '../powerup-balance'
import type { SectorMap, SectorNodeRunProfile } from '../sector-map'
import type { ReturnBeaconState } from '../return-beacons'
import type { SurfaceEventKind } from '../surface-encounters'
import { formatTime } from '../time-format'
import { weaponHudReadout } from '../weapon-signatures'
import { currentHudObjectiveReadout } from './hud-objective'
import { vitalCriticalClass } from './vital-meter'

interface HudView extends Object {}

interface HudRuntime {
  ui: {
    hull: HTMLElement
    hullFill: HTMLElement
    hullLabel: HTMLElement
    shieldFill: HTMLElement
    level: HTMLElement
    xpFill: HTMLElement
    xpLabel: HTMLElement
    time: HTMLElement
    score: HTMLElement
    wave: HTMLElement
    objective: HTMLElement
    weapon: HTMLElement
    toast: HTMLElement
    perf: HTMLElement
    high: HTMLElement
    resources: HTMLElement
  }
  stats: {
    time: number
    kills: number
    level: number
    xp: number
    nextXp: number
    highScore: number
    planets: number
    score: number
  }
  build: Partial<Record<UpgradeId, number>>
  evolved: ReadonlySet<string>
  returnBeacon: ReturnBeaconState | null
  player: {
    x: number
    y: number
    hull: number
    maxHull: number
    shield: number
    maxShield: number
    shieldDelay: number
  }
  resources: {
    scrap: number
    crystal: number
    cores: number
  }
  state: GameState
  surface: {
    event: SurfaceEventKind
    pilot: {
      health: number
      maxHealth: number
      oxygen: number
      maxOxygen: number
    }
  } | null
  sectorMap: SectorMap
  nextReturnBeaconAt: number
  pendingUpgrades: number
  sectorNodeProfile: SectorNodeRunProfile
  firedSectorWaves: Set<string>
  sectorNodeStartedAt: number
  makeTouchControls(): HTMLElement
  updateTouchHud(): void
  updatePerfHud(): void
}

function hudRuntime(self: HudView) {
  return self as HudRuntime
}

export function makeHud(self: HudView) {
  const runtime = hudRuntime(self)
  const hud = document.createElement('div')
  hud.className = 'hud'
  const top = document.createElement('div')
  top.className = 'topbar'
  const meters = document.createElement('div')
  meters.className = 'hud-meters'
  meters.append(
    meter('HULL', runtime.ui.hull, runtime.ui.hullFill, 'health', runtime.ui.hullLabel, runtime.ui.shieldFill),
    meter('XP', runtime.ui.level, runtime.ui.xpFill, 'xp', runtime.ui.xpLabel)
  )
  const left = document.createElement('div')
  left.className = 'hud-cluster hud-cluster-left'
  left.append(chip('TIME', runtime.ui.time), chip('SCORE', runtime.ui.score), chip('KILLS', runtime.ui.wave, 'kills'))
  const objective = chip('ROUTE', runtime.ui.objective, 'objective wide')
  const weapon = chip('WEAPON', runtime.ui.weapon, 'weapon wide')
  runtime.ui.toast.className = 'toast'
  runtime.ui.perf.className = 'perf'
  hud.append(top, runtime.ui.toast, runtime.makeTouchControls())
  top.append(meters, left, objective, weapon)
  return hud
}

export function updateHud(self: HudView) {
  const runtime = hudRuntime(self)
  runtime.ui.score.textContent = Math.floor(runtime.stats.score).toString()
  runtime.ui.time.textContent = formatTime(runtime.stats.time)
  runtime.ui.wave.textContent = runtime.stats.kills.toString()
  runtime.ui.high.textContent = Math.max(runtime.stats.highScore, runtime.stats.score).toString()
  const weaponReadout = weaponHudReadout({
    build: runtime.build,
    evolved: runtime.evolved
  })
  runtime.ui.weapon.textContent = weaponReadout.text
  const objectiveReadout = currentHudObjectiveReadout(runtime)
  const objectiveLabel = runtime.ui.objective.parentElement?.querySelector('.hud-label')
  runtime.ui.objective.parentElement?.classList.toggle('signal-ready', objectiveReadout.label === 'SIGNAL')
  runtime.ui.objective.parentElement?.classList.toggle('threat-inbound', objectiveReadout.label === 'WAVE')
  runtime.ui.objective.parentElement?.classList.toggle('station-soon', objectiveReadout.label === 'STATION')
  if (objectiveLabel) objectiveLabel.textContent = objectiveReadout.label
  runtime.ui.objective.textContent = objectiveReadout.text
  const beaconText = runtime.returnBeacon
    ? ` // STATION ${Math.floor(Math.sqrt(dist2(runtime.returnBeacon, runtime.player)))}`
    : ''
  runtime.ui.resources.textContent = `Scrap ${runtime.resources.scrap}  Crystals ${runtime.resources.crystal}  Cores ${runtime.resources.cores}${beaconText}`
  if (runtime.state === 'surface' && runtime.surface) {
    runtime.ui.hullLabel.textContent = 'HEALTH'
    runtime.ui.xpLabel.textContent = 'O2'
    runtime.ui.hull.textContent = `${Math.ceil(runtime.surface.pilot.health)}/${runtime.surface.pilot.maxHealth}`
    runtime.ui.level.textContent = `${Math.ceil(runtime.surface.pilot.oxygen)}s`
    const healthRatio = runtime.surface.pilot.health / runtime.surface.pilot.maxHealth
    const oxygenRatio = runtime.surface.pilot.oxygen / runtime.surface.pilot.maxOxygen
    runtime.ui.hullFill.style.width = `${clamp(healthRatio * 100, 0, 100)}%`
    runtime.ui.hullFill.classList.toggle('critical', vitalCriticalClass(healthRatio) === 'critical')
    runtime.ui.shieldFill.style.width = '0%'
    runtime.ui.shieldFill.classList.toggle('visible', false)
    runtime.ui.shieldFill.classList.toggle('depleted', false)
    runtime.ui.shieldFill.classList.toggle('recharging', false)
    runtime.ui.xpFill.style.width = `${clamp(oxygenRatio * 100, 0, 100)}%`
    runtime.ui.xpFill.classList.toggle('critical', vitalCriticalClass(oxygenRatio) === 'critical')
    runtime.ui.xpFill.classList.toggle('near-signal', false)
  } else {
    runtime.ui.hullLabel.textContent = 'HULL'
    runtime.ui.xpLabel.textContent = 'XP'
    runtime.ui.level.textContent = mutationXpReadout(runtime.stats)
    const shield = runtime.player.maxShield > 0 ? ` +${Math.floor(runtime.player.shield)}` : ''
    runtime.ui.hull.textContent = `${Math.ceil(Math.max(0, runtime.player.hull))}/${runtime.player.maxHull}${shield}`
    const hullRatio = Math.max(0, runtime.player.hull) / runtime.player.maxHull
    const shieldRatio = runtime.player.maxShield > 0 ? runtime.player.shield / runtime.player.maxShield : 0
    runtime.ui.hullFill.style.width = `${clamp(hullRatio * 100, 0, 100)}%`
    runtime.ui.hullFill.classList.toggle('critical', vitalCriticalClass(hullRatio) === 'critical')
    runtime.ui.shieldFill.style.width = `${clamp(shieldRatio * 100, 0, 100)}%`
    runtime.ui.shieldFill.classList.toggle('visible', runtime.player.maxShield > 0)
    runtime.ui.shieldFill.classList.toggle('depleted', runtime.player.maxShield > 0 && runtime.player.shield <= 0)
    runtime.ui.shieldFill.classList.toggle('recharging', runtime.player.maxShield > 0 && runtime.player.shieldDelay > 0)
    runtime.ui.xpFill.style.width = `${clamp((runtime.stats.xp / runtime.stats.nextXp) * 100, 0, 100)}%`
    runtime.ui.xpFill.classList.toggle('critical', false)
    runtime.ui.xpFill.classList.toggle('near-signal', mutationSignalAlmostReady(runtime.stats))
  }
  runtime.updateTouchHud()
  runtime.updatePerfHud()
}

function meter(label: string, value: HTMLElement, fill: HTMLElement, tone: string, labelEl = document.createElement('span'), shieldFill?: HTMLElement) {
  const meter = document.createElement('div')
  meter.className = `hud-meter ${tone}`
  const meta = document.createElement('div')
  meta.className = 'hud-meter-meta'
  labelEl.textContent = label
  value.className = 'hud-meter-value'
  meta.append(labelEl, value)
  const bar = document.createElement('div')
  bar.className = 'hud-meter-bar'
  fill.className = `hud-meter-fill ${tone}`
  if (shieldFill) shieldFill.className = 'hud-meter-shield-fill'
  bar.append(fill)
  if (shieldFill) bar.append(shieldFill)
  meter.append(meta, bar)
  return meter
}

function chip(label: string, value: HTMLElement, tone = '') {
  const chip = document.createElement('div')
  chip.className = `hud-chip ${tone}`.trim()
  const l = document.createElement('span')
  l.className = 'hud-label'
  l.textContent = label
  value.className = 'hud-value'
  chip.append(l, value)
  return chip
}
