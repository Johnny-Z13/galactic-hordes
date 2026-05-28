import type { VectorShooter } from '../main'
import { renderCollectionScreen } from './collection'
import { renderMothershipMetaSystems } from './mothership-console'

export function showCollection(self: VectorShooter, options: { scrollTop?: number } = {}) {
  self['state'] = 'collection'
  self['ui'].collection.innerHTML = ''
  self['ui'].collection.className = 'screen collection-route-screen'
  const shell = document.createElement('div')
  shell.className = 'front-subscreen collection-subscreen'
  const header = document.createElement('header')
  header.className = 'front-subscreen-head'
  header.innerHTML = `
      <div><span>RELICS / COLLECTION</span><h1>ARCHIVE</h1></div>
      <p>${Object.keys(self['mothership'].archive.records).length} recovered records stored in mothership memory.</p>
    `
  const back = document.createElement('button')
  back.className = 'vector-button secondary'
  back.type = 'button'
  back.textContent = 'Back'
  back.addEventListener('click', () => self['showTitle']())
  header.append(back)
  shell.append(header, renderCollectionScreen(self))
  self['ui'].collection.append(shell)
  self['showOnly']('collection')
  self['restoreFrontScreenScroll']('collection', options.scrollTop)
}

export function showPowerUps(self: VectorShooter, options: { scrollTop?: number } = {}) {
  self['state'] = 'powerups'
  self['ui'].powerups.innerHTML = ''
  self['ui'].powerups.className = 'screen powerups-route-screen'
  const shell = document.createElement('div')
  shell.className = 'front-subscreen powerups-subscreen'
  const header = document.createElement('header')
  header.className = 'front-subscreen-head'
  header.innerHTML = `
      <div><span>POWER UP</span><h1>META SYSTEMS</h1></div>
      <p>Spend recovered cargo on permanent mothership departments before launching.</p>
    `
  const resources = document.createElement('div')
  resources.className = 'mothership-resources front-subscreen-resources'
  resources.innerHTML = `
      <span><b>Scrap</b>${self['mothership'].resources.scrap}</span>
      <span><b>Crystals</b>${self['mothership'].resources.crystal}</span>
      <span><b>Cores</b>${self['mothership'].resources.cores}</span>
    `
  const back = document.createElement('button')
  back.className = 'vector-button secondary'
  back.type = 'button'
  back.textContent = 'Back'
  back.addEventListener('click', () => self['showTitle']())
  header.append(resources, back)
  shell.append(header, renderMothershipMetaSystems(self))
  self['ui'].powerups.append(shell)
  self['showOnly']('powerups')
  self['restoreFrontScreenScroll']('powerups', options.scrollTop)
}
