import './sim-lab.css'
import { countRecordToData, escapeHtml, renderBarChart } from './sim-charts'
import { formatSeconds } from './sim-metrics'
import type { SimBatchOptions, SimBatchSummary, SimDifficulty, SimPolicyId } from './sim-types'

const worker = new Worker(new URL('./sim-worker.ts', import.meta.url), { type: 'module' })
const runButton = document.querySelector<HTMLButtonElement>('#run')!
const exportButton = document.querySelector<HTMLButtonElement>('#export')!
const progress = document.querySelector<HTMLElement>('#progress')!
const summaryEl = document.querySelector<HTMLElement>('#summary')!
const flagsEl = document.querySelector<HTMLElement>('#flags')!
const chartsEl = document.querySelector<HTMLElement>('#charts')!
const runsTable = document.querySelector<HTMLElement>('#runsTable')!
let lastSummary: SimBatchSummary | null = null

const presets = {
  quick10: { runs: 10, maxSeconds: 900, policy: 'balanced', difficulty: 'normal' },
  balance50: { runs: 50, maxSeconds: 1200, policy: 'balanced', difficulty: 'normal' },
  fullArc: { runs: 100, maxSeconds: 1800, policy: 'balanced', difficulty: 'normal' },
  planetVariety: { runs: 30, maxSeconds: 1200, policy: 'planetHunter', difficulty: 'normal' },
  economySweep: { runs: 30, maxSeconds: 1200, policy: 'greedyCache', difficulty: 'normal' },
  latePressure: { runs: 20, maxSeconds: 1800, policy: 'stress', difficulty: 'stress' }
} as const

function inputNumber(id: string) {
  return Number(document.querySelector<HTMLInputElement>(`#${id}`)!.value)
}

function setNumber(id: string, value: number) {
  document.querySelector<HTMLInputElement>(`#${id}`)!.value = String(value)
}

function setSelect(id: string, value: string) {
  document.querySelector<HTMLSelectElement>(`#${id}`)!.value = value
}

function options(): SimBatchOptions {
  return {
    runs: inputNumber('runs'),
    seed: inputNumber('seed'),
    maxSeconds: inputNumber('maxSeconds'),
    policy: document.querySelector<HTMLSelectElement>('#policy')!.value as SimPolicyId,
    difficulty: document.querySelector<HTMLSelectElement>('#difficulty')!.value as SimDifficulty
  }
}

function renderSummary(summary: SimBatchSummary) {
  lastSummary = summary
  exportButton.disabled = false
  summaryEl.innerHTML = `
    ${metricCard('Median Survival', formatSeconds(summary.survival.medianSeconds))}
    ${metricCard('Best Survival', formatSeconds(summary.survival.bestSeconds))}
    ${metricCard('10m Survival', `${Math.round(summary.survival.tenMinuteRate * 100)}%`)}
    ${metricCard('Destroyed', `${Math.round(summary.survival.destroyedRate * 100)}%`)}
    ${metricCard('First Kill', formatSeconds(summary.firstMinute.medianFirstKillSec))}
    ${metricCard('Kills 0-60s', summary.firstMinute.averageKillsFirst60Sec.toFixed(1))}
    ${metricCard('First Landing', formatSeconds(summary.firstMinute.medianFirstLandingSec))}
    ${metricCard('First Workbench', formatSeconds(summary.firstMinute.medianFirstWorkbenchSec))}
    ${metricCard('Avg Nodes', summary.route.averageNodesCleared.toFixed(1))}
    ${metricCard('Final Reached', `${summary.route.finalReached}/${summary.options.runs}`)}
    ${metricCard('Median Final Clear', summary.route.medianFinalClearSeconds === null ? 'none' : formatSeconds(summary.route.medianFinalClearSeconds))}
    ${metricCard('Avg Planets', summary.planets.averageLandings.toFixed(1))}
    ${metricCard('Zero-Planet', `${Math.round(summary.planets.zeroLandingRate * 100)}%`)}
    ${metricCard('Avg Scrap', summary.economy.averageScrap.toFixed(0))}
    ${metricCard('Avg Damage', summary.combat.averageDamageTaken.toFixed(0))}
  `
  flagsEl.innerHTML = summary.balanceFlags.length
    ? `<h2>Balance Flags</h2><ul>${summary.balanceFlags.map((flag) => `<li>${escapeHtml(flag)}</li>`).join('')}</ul>`
    : '<h2>Balance Flags</h2><p>No balance flags for this batch.</p>'
  chartsEl.innerHTML = [
    renderBarChart('Route Templates', countRecordToData(summary.route.templateCounts)),
    renderBarChart('Planet Archetypes', countRecordToData(summary.planets.archetypeCounts)),
    renderBarChart('Surface Scenarios', countRecordToData(summary.planets.scenarioCounts)),
    renderBarChart('Death Causes', countRecordToData(summary.combat.deathCauseCounts)),
    renderBarChart('Upgrade Choices', countRecordToData(summary.upgrades.chosenCounts))
  ].join('')
  runsTable.innerHTML = `
    <h2>Runs</h2>
    <table>
      <thead>
        <tr>
          <th>Seed</th>
          <th>Outcome</th>
          <th>Time</th>
          <th>First Kill</th>
          <th>First Landing</th>
          <th>First Workbench</th>
          <th>Nodes</th>
          <th>Planets</th>
          <th>Damage</th>
          <th>Kills</th>
          <th>Scrap</th>
          <th>Flags</th>
        </tr>
      </thead>
      <tbody>
        ${summary.runs.map((run) => `
          <tr>
            <td>${run.seed}</td>
            <td>${escapeHtml(run.outcome)}</td>
            <td>${formatSeconds(run.seconds)}</td>
            <td>${run.firstMinute.firstKillSec === null ? '-' : formatSeconds(run.firstMinute.firstKillSec)}</td>
            <td>${run.firstMinute.firstLandingSec === null ? '-' : formatSeconds(run.firstMinute.firstLandingSec)}</td>
            <td>${run.firstMinute.firstWorkbenchSec === null ? '-' : formatSeconds(run.firstMinute.firstWorkbenchSec)}</td>
            <td>${run.nodesCleared}</td>
            <td>${run.planetsLanded}</td>
            <td>${run.damageTaken}</td>
            <td>${run.kills}</td>
            <td>${run.economy.scrap}</td>
            <td>${run.flags.length ? escapeHtml(run.flags.join(', ')) : '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

function metricCard(label: string, value: string) {
  return `<article><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></article>`
}

worker.onmessage = (event: MessageEvent) => {
  if (event.data.kind === 'progress') progress.textContent = `Running ${event.data.completed}/${event.data.total}...`
  if (event.data.kind === 'summary') {
    runButton.disabled = false
    progress.textContent = 'Complete.'
    renderSummary(event.data.summary)
  }
}

runButton.addEventListener('click', () => {
  runButton.disabled = true
  exportButton.disabled = true
  progress.textContent = 'Starting...'
  summaryEl.innerHTML = ''
  flagsEl.innerHTML = ''
  chartsEl.innerHTML = ''
  runsTable.innerHTML = ''
  worker.postMessage({ kind: 'runBatch', options: options() })
})

exportButton.addEventListener('click', () => {
  if (!lastSummary) return
  const blob = new Blob([JSON.stringify(lastSummary, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `galactic-hordes-sim-summary-${lastSummary.options.seed}.json`
  link.click()
  URL.revokeObjectURL(url)
})

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-preset]')) {
  button.addEventListener('click', () => {
    const preset = presets[button.dataset.preset as keyof typeof presets]
    setNumber('runs', preset.runs)
    setNumber('maxSeconds', preset.maxSeconds)
    setSelect('policy', preset.policy)
    setSelect('difficulty', preset.difficulty)
  })
}
