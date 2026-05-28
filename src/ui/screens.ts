import type { VectorShooter } from '../main'

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
