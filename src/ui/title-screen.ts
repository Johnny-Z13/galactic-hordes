import titleLogoMarkUrl from '../assets/title-logo-mark.png'
import type { VectorShooter } from '../main'

export function showTitle(self: VectorShooter) {
  self['state'] = 'title'
  self['ui'].title.innerHTML = ''
  self['ui'].title.className = 'screen title-screen'
  const recordCount = Object.keys(self['mothership'].archive.records).length
  const maxedDepartments = Object.values(self['mothership'].departments).filter((tier) => tier > 0).length
  const panel = document.createElement('div')
  panel.className = 'title-panel'
  const top = document.createElement('div')
  top.className = 'front-menu-top'
  const quit = document.createElement('button')
  quit.className = 'front-menu-pill danger'
  quit.type = 'button'
  quit.textContent = 'Quit'
  quit.addEventListener('click', () => self['toast']('SIGNAL HELD'))
  const cargo = document.createElement('div')
  cargo.className = 'front-menu-cargo'
  cargo.innerHTML = `<img src="${titleLogoMarkUrl}" alt=""><b>${self['mothership'].resources.cores}</b>`
  const options = document.createElement('button')
  options.className = 'front-menu-pill'
  options.type = 'button'
  options.textContent = 'Options'
  options.addEventListener('click', () => self['cycleGraphicsMode']())
  top.append(quit, cargo, options)

  const wordmark = document.createElement('h1')
  wordmark.className = 'title-wordmark'
  wordmark.innerHTML = '<span>GALACTIC</span><span>HORDES</span>'
  const spacer = document.createElement('div')
  spacer.className = 'front-menu-spacer'
  const row = document.createElement('div')
  row.className = 'title-actions'
  const start = document.createElement('button')
  start.className = 'vector-button start-button'
  start.textContent = 'Start'
  start.addEventListener('click', () => self['showMothership']())
  const collection = document.createElement('button')
  collection.className = 'vector-button secondary'
  collection.textContent = 'Collection'
  collection.addEventListener('click', () => self['showCollection']())
  const powerups = document.createElement('button')
  powerups.className = 'vector-button'
  powerups.textContent = 'Power Up'
  powerups.addEventListener('click', () => self['showPowerUps']())
  const scores = document.createElement('button')
  scores.className = 'vector-button secondary'
  scores.textContent = 'Scores'
  scores.addEventListener('click', () => self['showScores']())
  const reset = document.createElement('button')
  reset.className = 'vector-button secondary danger tiny'
  reset.textContent = 'Reset Progress'
  reset.addEventListener('click', () => {
    if (reset.dataset.confirm === 'true') {
      self['resetPersistentProgress']()
      return
    }
    reset.dataset.confirm = 'true'
    reset.textContent = 'Confirm Reset'
  })
  const footer = document.createElement('div')
  footer.className = 'front-menu-footer'
  footer.innerHTML = `
      <span><b>${recordCount}</b> discoveries</span>
      <span><b>${maxedDepartments}</b> systems</span>
      <span><b>${self['highs'][0]?.score ?? 0}</b> best</span>
    `
  row.append(start, collection, powerups, scores, reset)
  panel.append(top, wordmark, spacer, row, footer)
  self['ui'].title.append(panel)
  self['showOnly']('title')
}
