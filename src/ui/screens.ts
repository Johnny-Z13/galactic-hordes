import type { GameState, VectorShooter } from '../main'

export function makeScreens(self: VectorShooter) {
  const wrap = document.createElement('div')
  const screenList = [
    self['ui'].title,
    self['ui'].collection,
    self['ui'].powerups,
    self['ui'].sectorMap,
    self['ui'].station,
    self['ui'].levelup,
    self['ui'].planet,
    self['ui'].gameover,
    self['ui'].scores
  ]
  for (const screen of screenList) {
    screen.className = 'screen'
    wrap.append(screen)
  }
  self['ui'].gameover.className = 'screen gameover-screen'
  return wrap
}

export function showOnly(self: VectorShooter, which: GameState | null) {
  const screens: Partial<Record<GameState, HTMLElement>> = {
    title: self['ui'].title,
    collection: self['ui'].collection,
    powerups: self['ui'].powerups,
    sectorMap: self['ui'].sectorMap,
    station: self['ui'].station,
    levelup: self['ui'].levelup,
    planet: self['ui'].planet,
    gameover: self['ui'].gameover,
    scores: self['ui'].scores
  }
  for (const [name, el] of Object.entries(screens)) {
    el?.classList.toggle('visible', name === which)
  }
}
