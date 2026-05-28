import { clamp, formatTime, type VectorShooter } from '../main'
import { dist2 } from '../math-utils'
import { mutationSignalAlmostReady, mutationXpReadout } from '../mutation-progress'
import { weaponHudReadout } from '../weapon-signatures'
import { currentHudObjectiveReadout } from './hud-objective'
import { vitalCriticalClass } from './vital-meter'

export function makeHud(self: VectorShooter) {
  const hud = document.createElement('div')
  hud.className = 'hud'
  const top = document.createElement('div')
  top.className = 'topbar'
  const meters = document.createElement('div')
  meters.className = 'hud-meters'
  meters.append(
    meter('HULL', self['ui'].hull, self['ui'].hullFill, 'health', self['ui'].hullLabel, self['ui'].shieldFill),
    meter('XP', self['ui'].level, self['ui'].xpFill, 'xp', self['ui'].xpLabel)
  )
  const left = document.createElement('div')
  left.className = 'hud-cluster hud-cluster-left'
  left.append(chip('TIME', self['ui'].time), chip('SCORE', self['ui'].score), chip('KILLS', self['ui'].wave, 'kills'))
  const objective = chip('ROUTE', self['ui'].objective, 'objective wide')
  const weapon = chip('WEAPON', self['ui'].weapon, 'weapon wide')
  self['ui'].toast.className = 'toast'
  self['ui'].perf.className = 'perf'
  hud.append(top, self['ui'].toast, self['makeTouchControls']())
  top.append(meters, left, objective, weapon)
  return hud
}

export function updateHud(self: VectorShooter) {
  self['ui'].score.textContent = Math.floor(self['stats'].score).toString()
  self['ui'].time.textContent = formatTime(self['stats'].time)
  self['ui'].wave.textContent = self['stats'].kills.toString()
  self['ui'].high.textContent = Math.max(self['stats'].highScore, self['stats'].score).toString()
  const weaponReadout = weaponHudReadout({
    build: self['build'],
    evolved: self['evolved']
  })
  self['ui'].weapon.textContent = weaponReadout.text
  const objectiveReadout = currentHudObjectiveReadout(self)
  const objectiveLabel = self['ui'].objective.parentElement?.querySelector('.hud-label')
  self['ui'].objective.parentElement?.classList.toggle('signal-ready', objectiveReadout.label === 'SIGNAL')
  self['ui'].objective.parentElement?.classList.toggle('threat-inbound', objectiveReadout.label === 'WAVE')
  self['ui'].objective.parentElement?.classList.toggle('station-soon', objectiveReadout.label === 'STATION')
  if (objectiveLabel) objectiveLabel.textContent = objectiveReadout.label
  self['ui'].objective.textContent = objectiveReadout.text
  const beaconText = self['returnBeacon']
    ? ` // STATION ${Math.floor(Math.sqrt(dist2(self['returnBeacon'], self['player'])))}`
    : ''
  self['ui'].resources.textContent = `Scrap ${self['resources'].scrap}  Crystals ${self['resources'].crystal}  Cores ${self['resources'].cores}${beaconText}`
  if (self['state'] === 'surface' && self['surface']) {
    self['ui'].hullLabel.textContent = 'HEALTH'
    self['ui'].xpLabel.textContent = 'O2'
    self['ui'].hull.textContent = `${Math.ceil(self['surface'].pilot.health)}/${self['surface'].pilot.maxHealth}`
    self['ui'].level.textContent = `${Math.ceil(self['surface'].pilot.oxygen)}s`
    const healthRatio = self['surface'].pilot.health / self['surface'].pilot.maxHealth
    const oxygenRatio = self['surface'].pilot.oxygen / self['surface'].pilot.maxOxygen
    self['ui'].hullFill.style.width = `${clamp(healthRatio * 100, 0, 100)}%`
    self['ui'].hullFill.classList.toggle('critical', vitalCriticalClass(healthRatio) === 'critical')
    self['ui'].shieldFill.style.width = '0%'
    self['ui'].shieldFill.classList.toggle('visible', false)
    self['ui'].shieldFill.classList.toggle('depleted', false)
    self['ui'].shieldFill.classList.toggle('recharging', false)
    self['ui'].xpFill.style.width = `${clamp(oxygenRatio * 100, 0, 100)}%`
    self['ui'].xpFill.classList.toggle('critical', vitalCriticalClass(oxygenRatio) === 'critical')
    self['ui'].xpFill.classList.toggle('near-signal', false)
  } else {
    self['ui'].hullLabel.textContent = 'HULL'
    self['ui'].xpLabel.textContent = 'XP'
    self['ui'].level.textContent = mutationXpReadout(self['stats'])
    const shield = self['player'].maxShield > 0 ? ` +${Math.floor(self['player'].shield)}` : ''
    self['ui'].hull.textContent = `${Math.ceil(Math.max(0, self['player'].hull))}/${self['player'].maxHull}${shield}`
    const hullRatio = Math.max(0, self['player'].hull) / self['player'].maxHull
    const shieldRatio = self['player'].maxShield > 0 ? self['player'].shield / self['player'].maxShield : 0
    self['ui'].hullFill.style.width = `${clamp(hullRatio * 100, 0, 100)}%`
    self['ui'].hullFill.classList.toggle('critical', vitalCriticalClass(hullRatio) === 'critical')
    self['ui'].shieldFill.style.width = `${clamp(shieldRatio * 100, 0, 100)}%`
    self['ui'].shieldFill.classList.toggle('visible', self['player'].maxShield > 0)
    self['ui'].shieldFill.classList.toggle('depleted', self['player'].maxShield > 0 && self['player'].shield <= 0)
    self['ui'].shieldFill.classList.toggle('recharging', self['player'].maxShield > 0 && self['player'].shieldDelay > 0)
    self['ui'].xpFill.style.width = `${clamp((self['stats'].xp / self['stats'].nextXp) * 100, 0, 100)}%`
    self['ui'].xpFill.classList.toggle('critical', false)
    self['ui'].xpFill.classList.toggle('near-signal', mutationSignalAlmostReady(self['stats']))
  }
  self['updateTouchHud']()
  self['updatePerfHud']()
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
