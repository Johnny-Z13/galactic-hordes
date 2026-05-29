import type { VectorShooter } from '../main'
import { formatTime } from '../time-format'

export function renderDebrief(self: VectorShooter) {
  if (!self['debrief']) return
  self['ui'].gameover.innerHTML = ''
  const panel = document.createElement('div')
  panel.className = 'panel debrief-panel'
  const h = document.createElement('h1')
  h.className = 'title'
  h.textContent = self['debrief'].title
  const copy = document.createElement('p')
  copy.className = 'copy'
  copy.textContent = self['debrief'].copy
  const log = document.createElement('section')
  log.className = 'debrief-log'
  const logEyebrow = document.createElement('span')
  logEyebrow.textContent = 'EXPEDITION LOG'
  const logTitle = document.createElement('b')
  logTitle.textContent = self['debrief'].journeyTitle
  const logList = document.createElement('ul')
  for (const highlight of self['debrief'].highlights) {
    const item = document.createElement('li')
    item.textContent = highlight
    logList.append(item)
  }
  log.append(logEyebrow, logTitle, logList)
  const resources = document.createElement('div')
  resources.className = 'debrief-grid'
  resources.innerHTML = `
    <div><b>${self['debrief'].resources.recovered.scrap}</b><span>Scrap Recovered</span></div>
    <div><b>${self['debrief'].resources.recovered.crystal}</b><span>Crystals Recovered</span></div>
    <div><b>${self['debrief'].resources.recovered.cores}</b><span>Cores Recovered</span></div>
    <div><b>${self['debrief'].discoveries.length}</b><span>Discoveries Logged</span></div>
    <div><b>${self['debrief'].lightYears}</b><span>Light Years</span></div>
    <div><b>${self['debrief'].stationVisits.length}</b><span>Stations Docked</span></div>
  `
  const discoveries = document.createElement('p')
  discoveries.className = 'copy small'
  discoveries.textContent = self['debrief'].discoveries.length
    ? self['debrief'].discoveries.slice(0, 4).map((record) => record.title).join(' // ')
    : 'No new archive records.'
  const stationRoute = document.createElement('p')
  stationRoute.className = 'copy small'
  stationRoute.textContent = self['debrief'].stationVisits.length
    ? `Station route: ${self['debrief'].stationVisits.slice(0, 4).map((visit) => visit.stationName).join(' // ')}`
    : 'No stations docked this expedition.'
  const bonus = document.createElement('p')
  bonus.className = 'copy small'
  bonus.textContent = self['debrief'].skippedBeacons > 0 ? `Deep route bonus from ${self['debrief'].skippedBeacons} skipped station${self['debrief'].skippedBeacons === 1 ? '' : 's'}.` : ''
  const input = document.createElement('input')
  input.className = 'name-entry'
  input.maxLength = 12
  input.placeholder = 'ACE'
  input.autocapitalize = 'characters'
  input.autocomplete = 'name'
  input.inputMode = 'text'
  input.value = self['scoreName'] === 'ACE' ? '' : self['scoreName']
  input.addEventListener('input', () => {
    self['scoreName'] = input.value.toUpperCase().replace(/[^A-Z0-9 _-]/g, '').slice(0, 12)
    input.value = self['scoreName']
  })
  input.addEventListener('focus', () => input.select())
  input.addEventListener('blur', () => {
    if (!self['scoreName'].trim()) self['scoreName'] = 'ACE'
  })
  const row = document.createElement('div')
  row.className = 'button-row'
  const continueButton = document.createElement('button')
  continueButton.className = 'vector-button'
  continueButton.textContent = 'Return to Title'
  continueButton.addEventListener('click', () => {
    self['returnToTitleFromGameOver'](input)
  })
  const scores = document.createElement('button')
  scores.className = 'vector-button secondary'
  scores.textContent = 'Scores'
  scores.addEventListener('click', () => {
    self['saveScoreFromInput'](input)
    self['showScores']()
  })
  row.append(continueButton, scores)
  panel.append(h, copy, log, resources, discoveries, stationRoute, bonus, input, row)
  self['ui'].gameover.append(panel)
  self['showOnly']('gameover')
}

export function renderGameOver(self: VectorShooter) {
  self['ui'].gameover.innerHTML = ''
  const panel = document.createElement('div')
  panel.className = 'panel'
  const h = document.createElement('h1')
  h.className = 'title'
  h.textContent = 'SIGNAL LOST'
  const copy = document.createElement('p')
  copy.className = 'copy'
  copy.textContent = `Score ${Math.floor(self['stats'].score)}. Survived ${formatTime(self['stats'].time)}. Level ${self['stats'].level}. Kills ${self['stats'].kills}. Planets landed ${self['stats'].planets}.`
  const input = document.createElement('input')
  input.className = 'name-entry'
  input.maxLength = 12
  input.placeholder = 'ACE'
  input.autocapitalize = 'characters'
  input.autocomplete = 'name'
  input.inputMode = 'text'
  input.value = self['scoreName'] === 'ACE' ? '' : self['scoreName']
  input.addEventListener('input', () => {
    self['scoreName'] = input.value.toUpperCase().replace(/[^A-Z0-9 _-]/g, '').slice(0, 12)
    input.value = self['scoreName']
  })
  input.addEventListener('focus', () => input.select())
  input.addEventListener('blur', () => {
    if (!self['scoreName'].trim()) self['scoreName'] = 'ACE'
  })
  const row = document.createElement('div')
  row.className = 'button-row'
  const retry = document.createElement('button')
  retry.className = 'vector-button'
  retry.textContent = 'Title Screen'
  retry.addEventListener('click', () => {
    self['returnToTitleFromGameOver'](input)
  })
  const scores = document.createElement('button')
  scores.className = 'vector-button secondary'
  scores.textContent = 'Scores'
  scores.addEventListener('click', () => {
    self['saveScoreFromInput'](input)
    self['showScores']()
  })
  row.append(retry, scores)
  panel.append(h, copy, input, document.createElement('br'), document.createElement('br'), row)
  self['ui'].gameover.append(panel)
  self['showOnly']('gameover')
}
