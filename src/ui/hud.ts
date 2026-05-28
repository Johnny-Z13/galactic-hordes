import { clamp, formatTime, type VectorShooter } from '../main'
import { dist2 } from '../math-utils'
import { weaponHudReadout } from '../weapon-signatures'
import { vitalCriticalClass } from './vital-meter'

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
  } else {
    self['ui'].hullLabel.textContent = 'HULL'
    self['ui'].xpLabel.textContent = 'XP'
    self['ui'].level.textContent = `LV ${self['stats'].level}`
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
  }
  self['updateTouchHud']()
  self['updatePerfHud']()
}
