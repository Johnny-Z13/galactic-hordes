import type { GameState } from '../game-states'
import { scoreExpeditionLogEntries, type ScoreEntry } from '../score-history'
import { formatTime } from '../time-format'

interface ScoresScreenView extends Object {}

interface ScoresScreenRuntime {
  state: GameState
  ui: {
    scores: HTMLElement
  }
  highs: ScoreEntry[]
  escape(value: string): string
  showTitle(): void
  resetPersistentProgress(): void
  showOnly(which: GameState): void
}

function scoresRuntime(self: ScoresScreenView) {
  return self as ScoresScreenRuntime
}

function renderScoreExpeditionLog(runtime: ScoresScreenRuntime, entries: ScoreEntry[]) {
  const storyEntries = scoreExpeditionLogEntries(entries)
  if (!storyEntries.length) return null
  const log = document.createElement('section')
  log.className = 'score-expedition-log'
  const heading = document.createElement('div')
  heading.className = 'score-expedition-heading'
  const eyebrow = document.createElement('span')
  eyebrow.textContent = 'EXPEDITION ARCHIVE'
  const title = document.createElement('b')
  title.textContent = 'Notable Runs'
  heading.append(eyebrow, title)
  const cards = document.createElement('div')
  cards.className = 'score-expedition-cards'
  for (const entry of storyEntries) {
    const card = document.createElement('article')
    card.className = 'score-expedition-card'
    const name = document.createElement('b')
    name.textContent = entry.journeyTitle ?? 'Expedition'
    const meta = document.createElement('span')
    meta.textContent = `${runtime.escape(entry.name)} // ${entry.score} pts // ${formatTime(entry.time)} // ${entry.lightYears ?? 0} LY`
    const highlight = document.createElement('p')
    highlight.textContent = entry.highlights?.[0] ?? ''
    const resources = document.createElement('em')
    resources.textContent = `Scrap ${entry.resources?.scrap ?? 0} // Crystals ${entry.resources?.crystal ?? 0} // Cores ${entry.resources?.cores ?? 0}`
    card.append(name, meta, highlight, resources)
    cards.append(card)
  }
  log.append(heading, cards)
  return log
}

export function showScores(self: ScoresScreenView) {
  const runtime = scoresRuntime(self)
  runtime.state = 'scores'
  runtime.ui.scores.innerHTML = ''
  const panel = document.createElement('div')
  panel.className = 'panel'
  const h = document.createElement('h1')
  h.className = 'title'
  h.textContent = 'HIGH SCORES'
  const table = document.createElement('table')
  table.className = 'score-table'
  table.innerHTML = '<thead><tr><th>Pilot</th><th>Score</th><th>Time</th><th>Level</th><th>Kills</th></tr></thead>'
  const body = document.createElement('tbody')
  for (const s of runtime.highs.slice(0, 8)) {
    const tr = document.createElement('tr')
    tr.innerHTML = `<td>${runtime.escape(s.name)}</td><td>${s.score}</td><td>${formatTime(s.time)}</td><td>${s.level}</td><td>${s.kills}</td>`
    body.append(tr)
  }
  if (!body.children.length) {
    const tr = document.createElement('tr')
    tr.innerHTML = '<td colspan="5">No signals recorded yet.</td>'
    body.append(tr)
  }
  table.append(body)
  const row = document.createElement('div')
  row.className = 'button-row'
  const back = document.createElement('button')
  back.className = 'vector-button'
  back.textContent = 'Back'
  back.addEventListener('click', () => runtime.showTitle())
  const reset = document.createElement('button')
  reset.className = 'vector-button secondary danger'
  reset.textContent = 'Reset Save'
  reset.addEventListener('click', () => {
    if (reset.dataset.confirm === 'true') {
      runtime.resetPersistentProgress()
      return
    }
    reset.dataset.confirm = 'true'
    reset.textContent = 'Confirm Reset'
  })
  row.append(back, reset)
  const log = renderScoreExpeditionLog(runtime, runtime.highs)
  panel.append(h, table)
  if (log) panel.append(log)
  panel.append(row)
  runtime.ui.scores.append(panel)
  runtime.showOnly('scores')
}
