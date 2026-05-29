import type { GameState } from '../game-states'
import type { DebriefReport } from '../debrief-report'
import { formatTime } from '../time-format'

interface DebriefScreenView extends Object {}

interface DebriefScreenRuntime {
  debrief: DebriefReport | null
  ui: {
    gameover: HTMLElement
  }
  scoreName: string
  stats: {
    score: number
    time: number
    level: number
    kills: number
    planets: number
  }
  returnToTitleFromGameOver(input: HTMLInputElement): void
  saveScoreFromInput(input: HTMLInputElement): void
  showScores(): void
  showOnly(which: GameState): void
}

function debriefRuntime(self: DebriefScreenView) {
  return self as DebriefScreenRuntime
}

function bindScoreNameInput(runtime: DebriefScreenRuntime, input: HTMLInputElement) {
  input.className = 'name-entry'
  input.maxLength = 12
  input.placeholder = 'ACE'
  input.autocapitalize = 'characters'
  input.autocomplete = 'name'
  input.inputMode = 'text'
  input.value = runtime.scoreName === 'ACE' ? '' : runtime.scoreName
  input.addEventListener('input', () => {
    runtime.scoreName = input.value.toUpperCase().replace(/[^A-Z0-9 _-]/g, '').slice(0, 12)
    input.value = runtime.scoreName
  })
  input.addEventListener('focus', () => input.select())
  input.addEventListener('blur', () => {
    if (!runtime.scoreName.trim()) runtime.scoreName = 'ACE'
  })
}

export function renderDebrief(self: DebriefScreenView) {
  const runtime = debriefRuntime(self)
  const debrief = runtime.debrief
  if (!debrief) return
  runtime.ui.gameover.innerHTML = ''
  const panel = document.createElement('div')
  panel.className = 'panel debrief-panel'
  const h = document.createElement('h1')
  h.className = 'title'
  h.textContent = debrief.title
  const copy = document.createElement('p')
  copy.className = 'copy'
  copy.textContent = debrief.copy
  const log = document.createElement('section')
  log.className = 'debrief-log'
  const logEyebrow = document.createElement('span')
  logEyebrow.textContent = 'EXPEDITION LOG'
  const logTitle = document.createElement('b')
  logTitle.textContent = debrief.journeyTitle
  const logList = document.createElement('ul')
  for (const highlight of debrief.highlights) {
    const item = document.createElement('li')
    item.textContent = highlight
    logList.append(item)
  }
  log.append(logEyebrow, logTitle, logList)
  const resources = document.createElement('div')
  resources.className = 'debrief-grid'
  resources.innerHTML = `
    <div><b>${debrief.resources.recovered.scrap}</b><span>Scrap Recovered</span></div>
    <div><b>${debrief.resources.recovered.crystal}</b><span>Crystals Recovered</span></div>
    <div><b>${debrief.resources.recovered.cores}</b><span>Cores Recovered</span></div>
    <div><b>${debrief.discoveries.length}</b><span>Discoveries Logged</span></div>
    <div><b>${debrief.lightYears}</b><span>Light Years</span></div>
    <div><b>${debrief.stationVisits.length}</b><span>Stations Docked</span></div>
  `
  const discoveries = document.createElement('p')
  discoveries.className = 'copy small'
  discoveries.textContent = debrief.discoveries.length
    ? debrief.discoveries.slice(0, 4).map((record) => record.title).join(' // ')
    : 'No new archive records.'
  const stationRoute = document.createElement('p')
  stationRoute.className = 'copy small'
  stationRoute.textContent = debrief.stationVisits.length
    ? `Station route: ${debrief.stationVisits.slice(0, 4).map((visit) => visit.stationName).join(' // ')}`
    : 'No stations docked this expedition.'
  const bonus = document.createElement('p')
  bonus.className = 'copy small'
  bonus.textContent = debrief.skippedBeacons > 0 ? `Deep route bonus from ${debrief.skippedBeacons} skipped station${debrief.skippedBeacons === 1 ? '' : 's'}.` : ''
  const input = document.createElement('input')
  bindScoreNameInput(runtime, input)
  const row = document.createElement('div')
  row.className = 'button-row'
  const continueButton = document.createElement('button')
  continueButton.className = 'vector-button'
  continueButton.textContent = 'Return to Title'
  continueButton.addEventListener('click', () => {
    runtime.returnToTitleFromGameOver(input)
  })
  const scores = document.createElement('button')
  scores.className = 'vector-button secondary'
  scores.textContent = 'Scores'
  scores.addEventListener('click', () => {
    runtime.saveScoreFromInput(input)
    runtime.showScores()
  })
  row.append(continueButton, scores)
  panel.append(h, copy, log, resources, discoveries, stationRoute, bonus, input, row)
  runtime.ui.gameover.append(panel)
  runtime.showOnly('gameover')
}

export function renderGameOver(self: DebriefScreenView) {
  const runtime = debriefRuntime(self)
  runtime.ui.gameover.innerHTML = ''
  const panel = document.createElement('div')
  panel.className = 'panel'
  const h = document.createElement('h1')
  h.className = 'title'
  h.textContent = 'SIGNAL LOST'
  const copy = document.createElement('p')
  copy.className = 'copy'
  copy.textContent = `Score ${Math.floor(runtime.stats.score)}. Survived ${formatTime(runtime.stats.time)}. Level ${runtime.stats.level}. Kills ${runtime.stats.kills}. Planets landed ${runtime.stats.planets}.`
  const input = document.createElement('input')
  bindScoreNameInput(runtime, input)
  const row = document.createElement('div')
  row.className = 'button-row'
  const retry = document.createElement('button')
  retry.className = 'vector-button'
  retry.textContent = 'Title Screen'
  retry.addEventListener('click', () => {
    runtime.returnToTitleFromGameOver(input)
  })
  const scores = document.createElement('button')
  scores.className = 'vector-button secondary'
  scores.textContent = 'Scores'
  scores.addEventListener('click', () => {
    runtime.saveScoreFromInput(input)
    runtime.showScores()
  })
  row.append(retry, scores)
  panel.append(h, copy, input, document.createElement('br'), document.createElement('br'), row)
  runtime.ui.gameover.append(panel)
  runtime.showOnly('gameover')
}
