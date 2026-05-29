import {
  availableSectorChoices,
  currentSectorNode,
  hexDistance,
  sectorNodeDecisionIntel,
  sectorNodeRunProfile,
  type SectorHazardTag,
  type SectorMap,
  type SectorNode,
  type SectorNodeRunProfile,
  type SectorWaveOrder
} from '../sector-map'
import type { GameState } from '../game-states'
import type { StationVisitRecord } from '../station-memory'

interface SectorMapView extends Object {}

interface SectorMapRuntime {
  state: GameState
  ui: {
    sectorMap: HTMLElement
  }
  resources: {
    scrap: number
  }
  sectorMap: SectorMap
  stationVisits: StationVisitRecord[]
  escape(value: string): string
  launchSectorNode(nodeId: string): void
  showOnly(which: GameState): void
}

function sectorMapRuntime(self: SectorMapView) {
  return self as SectorMapRuntime
}

export function showSectorMap(self: SectorMapView, message: string) {
  const runtime = sectorMapRuntime(self)
  runtime.state = 'sectorMap'
  runtime.ui.sectorMap.innerHTML = ''
  runtime.ui.sectorMap.className = 'screen sector-map-screen'
  const panel = document.createElement('div')
  panel.className = 'sector-map-panel'
  const top = document.createElement('div')
  top.className = 'sector-map-top'
  const titleBlock = document.createElement('div')
  titleBlock.className = 'sector-map-title'
  titleBlock.innerHTML = `<span>RUN ROUTE</span><h1>SECTOR MAP</h1><p>${runtime.escape(message)}</p>`
  const choices = availableSectorChoices(runtime.sectorMap)
  const current = currentSectorNode(runtime.sectorMap)
  const currentStationVisit = runtime.stationVisits.find((visit) => visit.nodeId === current.id)
  let selectedNodeId = ''
  const status = document.createElement('div')
  status.className = 'sector-map-status'
  status.innerHTML = `
      <span><b>${runtime.sectorMap.nodes.filter((node) => node.completed && node.kind !== 'mothership').length}</b> CLEARED</span>
      <span><b>${choices.length}</b> ROUTES</span>
      <span><b>${runtime.resources.scrap}</b> SCRAP</span>
    `
  top.append(titleBlock, status)

  const body = document.createElement('div')
  body.className = 'sector-map-body'
  const graph = document.createElement('div')
  graph.className = 'sector-map-graph sector-map-hexchart'
  const graphHeader = document.createElement('div')
  graphHeader.className = 'sector-map-graph-header'
  graphHeader.innerHTML = `<span>LOCAL HEX GRID</span><b>${choices.length} ADJACENT JUMPS</b>`
  graph.append(graphHeader)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.classList.add('sector-map-lines')
  svg.setAttribute('viewBox', '0 0 100 100')
  for (const node of runtime.sectorMap.nodes) {
    const pos = sectorNodePosition(runtime.sectorMap, node)
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    polygon.setAttribute('points', sectorWireHexPoints(pos.x, pos.y))
    polygon.classList.add('sector-wire-hex')
    polygon.dataset.nodeId = node.id
    if (node.frontier) polygon.classList.add('frontier')
    if (node.id === current.id) polygon.classList.add('current')
    if (node.completed) polygon.classList.add('completed')
    if (hexDistance(current, node) <= 1) polygon.classList.add('nearby')
    if (choices.some((choice) => choice.id === node.id)) polygon.classList.add('available')
    svg.append(polygon)
  }
  graph.append(svg)
  for (const node of runtime.sectorMap.nodes) {
    const pos = sectorNodePosition(runtime.sectorMap, node)
    const isAvailable = choices.some((choice) => choice.id === node.id)
    const stationVisit = runtime.stationVisits.find((visit) => visit.nodeId === node.id)
    const stateLabel = stationVisit ? 'DOCKED' : node.completed ? 'DONE' : node.id === runtime.sectorMap.currentNodeId ? 'HERE' : isAvailable ? 'READY' : 'LOCK'
    const button = document.createElement('button')
    button.type = 'button'
    button.className = sectorNodeClass(runtime.sectorMap, node, choices)
    button.style.left = `${pos.x}%`
    button.style.top = `${pos.y}%`
    button.dataset.label = node.label
    button.dataset.nodeId = node.id
    button.dataset.baseState = stateLabel
    if (isAvailable) button.dataset.edgeKey = sectorEdgeKey(current.id, node.id)
    button.setAttribute('aria-label', `${stateLabel} ${sectorKindLabel(node.kind)}: ${node.label}`)
    button.innerHTML = `
        <span class="sector-node-core" aria-hidden="true"></span>
      `
    button.title = stationVisit ? `${stationVisit.stationName}: ${stationVisit.contactName}, ${stationVisit.contactRole}` : `${node.label}: ${node.description}`
    button.disabled = !isAvailable
    button.addEventListener('click', () => selectSectorChoice(node.id))
    graph.append(button)
  }
  const details = document.createElement('div')
  details.className = 'sector-map-details'
  const currentPanel = document.createElement('div')
  currentPanel.className = 'sector-map-current'
  currentPanel.innerHTML = currentStationVisit
    ? `<span>CURRENT NODE // DOCKED</span><h2>${runtime.escape(currentStationVisit.stationName)}</h2><p>${runtime.escape(`${currentStationVisit.contactName}, ${currentStationVisit.contactRole}: ${currentStationVisit.rumor}`)}</p>`
    : `<span>CURRENT NODE</span><h2>${runtime.escape(current.label)}</h2><p>${runtime.escape(current.description)}</p>`
  const selectionReadout = document.createElement('div')
  selectionReadout.className = 'sector-selection-readout'
  const launchButton = document.createElement('button')
  launchButton.type = 'button'
  launchButton.className = 'vector-button sector-launch-button'
  launchButton.disabled = true
  launchButton.textContent = 'Select Sector'
  launchButton.addEventListener('click', () => {
    if (!selectedNodeId) return
    runtime.launchSectorNode(selectedNodeId)
  })
  details.append(selectionReadout, launchButton, sectorMapDebugReadout(runtime))
  body.append(currentPanel, graph, details)
  panel.append(top, body)
  runtime.ui.sectorMap.append(panel)
  runtime.showOnly('sectorMap')

  function selectSectorChoice(nodeId: string) {
    const selected = choices.find((choice) => choice.id === nodeId)
    if (!selected) return
    selectedNodeId = selected.id
    const selectedEdgeKey = sectorEdgeKey(current.id, selected.id)
    graph.querySelectorAll<HTMLButtonElement>('.sector-node').forEach((button) => {
      const isSelected = button.dataset.nodeId === selected.id
      button.classList.toggle('selected', isSelected)
    })
    graph.querySelectorAll<SVGPolygonElement>('.sector-wire-hex').forEach((hex) => {
      hex.classList.toggle('selected', hex.dataset.nodeId === selected.id)
    })
    selectionReadout.innerHTML = sectorSelectionReadout(runtime, selected)
    launchButton.disabled = false
    launchButton.textContent = `Launch ${sectorDisplayId(runtime.sectorMap, selected)}`
  }

  selectionReadout.innerHTML = choices.length
    ? sectorSelectionPlaceholder(runtime)
    : `<span>NO JUMP LOCK</span><h2>No Adjacent Hex</h2><p>No forward route is ready yet.</p>`
}

function sectorEdgeKey(a: string, b: string) {
  return [a, b].sort().join('::')
}

function sectorWireHexPoints(x: number, y: number) {
  const size = 6.6
  const halfWidth = Math.sqrt(3) * size / 2
  return [
    [x, y - size],
    [x + halfWidth, y - size / 2],
    [x + halfWidth, y + size / 2],
    [x, y + size],
    [x - halfWidth, y + size / 2],
    [x - halfWidth, y - size / 2]
  ].map(([px, py]) => `${px.toFixed(2)},${py.toFixed(2)}`).join(' ')
}

function sectorNodePosition(sectorMap: SectorMap, node: SectorNode) {
  const radius = Math.max(1, Math.floor((sectorMap.columns - 1) / 2))
  const size = 6.6
  const hexX = Math.sqrt(3) * size * (node.q + node.r * 0.5)
  const hexY = 1.5 * size * node.r
  const x = 50 + hexX * (3 / radius)
  const y = 50 + hexY * (3 / radius)
  return { x, y }
}

function sectorNodeClass(sectorMap: SectorMap, node: SectorNode, choices: SectorNode[]) {
  const classes = ['sector-node', node.kind]
  const available = choices.some((choice) => choice.id === node.id)
  if (node.completed) classes.push('completed')
  if (node.id === sectorMap.currentNodeId) classes.push('current')
  if (available) classes.push('available')
  if (node.frontier) classes.push('sector-node-frontier')
  if (!node.completed && node.id !== sectorMap.currentNodeId && !available) classes.push('locked')
  return classes.join(' ')
}

function sectorDisplayId(sectorMap: SectorMap, node: SectorNode) {
  if (node.id === 'mothership') return 'Sector 00'
  const ordered = [...sectorMap.nodes]
    .filter((candidate) => candidate.id !== 'mothership')
    .sort((a, b) => a.config.depth - b.config.depth || a.q - b.q || a.r - b.r || a.label.localeCompare(b.label))
  const index = Math.max(0, ordered.findIndex((candidate) => candidate.id === node.id)) + 1
  return `Sector ${String(index).padStart(2, '0')}`
}

function sectorSelectionPlaceholder(runtime: SectorMapRuntime) {
  return `
        <span>JUMP TARGET</span>
        <h2>Select Adjacent Hex</h2>
        <p>Nearby hexes are illuminated from the current sector. Tap one to reveal the status readout before launch.</p>
        <span class="sector-choice-intel" aria-label="Jump selection state">
          <span>LOCAL LIGHT</span>
          <span>HEX WIREFRAME</span>
          <span>AWAITING LOCK</span>
        </span>
      `
}

function sectorSelectionReadout(runtime: SectorMapRuntime, node: SectorNode) {
  const profile = sectorNodeRunProfile(node)
  const intel = sectorNodeDecisionIntel(node)
  const hazards = sectorHazardsLabel(node.config.hazards)
  const planets = sectorPlanetLabel(node.config.planets.countMin, node.config.planets.countMax)
  return `
        <span>JUMP LOCK // ${runtime.escape(sectorKindLabel(node.kind))}</span>
        <h2>${runtime.escape(sectorDisplayId(runtime.sectorMap, node))} // ${runtime.escape(node.label.replace(/\s+\d+-\d+$/, ''))}</h2>
        <p>${runtime.escape(node.config.readout)}</p>
        <span class="sector-choice-intel" aria-label="Route decision intel">
          <span>${runtime.escape(intel.directive)}</span>
          <span>${runtime.escape(intel.reward)}</span>
          <span>${runtime.escape(intel.risk)}</span>
        </span>
        <span class="sector-choice-metrics" aria-label="Route metrics">
          <span><b>${planets}</b><em>PLANETS</em></span>
          <span><b>${node.config.waves.length}</b><em>${sectorWaveLabel(node.config.waveOrder)}</em></span>
          <span><b>${sectorFirstWaveLabel(node)}</b><em>CONTACT</em></span>
          <span><b>x${profile.spawnMultiplier.toFixed(2)}</b><em>PRESSURE</em></span>
          <span><b>${runtime.escape(hazards)}</b><em>HAZARDS</em></span>
        </span>
        <i class="sector-choice-readout">${runtime.escape(sectorNodeConfigSummary(node, profile))}</i>
      `
}

export function sectorNodeGlyph(kind: SectorNode['kind']) {
  return {
    mothership: 'M',
    hostile: 'H',
    planet: 'P',
    station: 'S',
    anomaly: 'A',
    boss: 'B',
    final: 'F'
  }[kind]
}

function sectorKindLabel(kind: SectorNode['kind']) {
  return {
    mothership: 'MOTHERSHIP',
    hostile: 'COMBAT',
    planet: 'PLANET',
    station: 'STATION',
    anomaly: 'ANOMALY',
    boss: 'BOSS',
    final: 'FINAL'
  }[kind]
}

function sectorWaveLabel(wave: SectorWaveOrder) {
  return {
    scouts: 'SCOUTS',
    swarm: 'SWARM',
    ambush: 'AMBUSH',
    bulwark: 'BULWARK',
    cathedral: 'CATHEDRAL'
  }[wave]
}

function sectorNodeConfigSummary(node: SectorNode, profile: SectorNodeRunProfile) {
  if (node.kind === 'station') return 'REPAIR / WORKBENCH / SCAN'
  const modifierSummary = [
    profile.enemyPacket.id === 'baseline' ? '' : profile.enemyPacket.label,
    profile.rewardShape.id === 'balanced' ? '' : profile.rewardShape.label,
    ...profile.modifiers.map((modifier) => modifier.label)
  ].filter(Boolean).slice(0, 3).join(' + ')
  return [
    `PLANETS ${sectorPlanetLabel(node.config.planets.countMin, node.config.planets.countMax)}`,
    `WAVES ${node.config.waves.length} ${sectorWaveLabel(node.config.waveOrder)}`,
    `FIRST ${sectorFirstWaveLabel(node)}`,
    `HAZARDS ${sectorHazardsLabel(node.config.hazards)}`,
    `PRESSURE x${profile.spawnMultiplier.toFixed(2)}`,
    modifierSummary
  ].filter(Boolean).join(' / ')
}

function sectorFirstWaveLabel(node: SectorNode) {
  const firstWave = node.config.waves[0]
  return firstWave ? `${firstWave.atSeconds}s` : '--'
}

function sectorMapDebugReadout(runtime: SectorMapRuntime) {
  const wrap = document.createElement('details')
  wrap.className = 'sector-debug-readout'
  const rows = runtime.sectorMap.nodes
    .filter((node) => node.kind !== 'mothership')
    .sort((a, b) => a.column - b.column || a.row - b.row)
    .map((node) => {
      const profile = sectorNodeRunProfile(node)
      const waveSummary = node.config.waves.map((wave) => `${wave.atSeconds}s:${wave.label}`).join(', ')
      return `
          <div class="sector-debug-row ${runtime.escape(node.kind)}">
            <b>${runtime.escape(node.label)}</b>
            <span>${runtime.escape(node.config.templateId)} / d${node.config.depth.toFixed(2)} / ${runtime.escape(node.config.pace)}</span>
            <span>${runtime.escape(node.config.enemyPacket.label)} / ${runtime.escape(node.config.rewardShape.label)} / ${runtime.escape(node.config.modifiers.map((modifier) => modifier.label).join(' + '))}</span>
            <span>PLANETS ${sectorPlanetLabel(node.config.planets.countMin, node.config.planets.countMax)} / ${runtime.escape(node.config.planets.density)} / ${runtime.escape(sectorHazardsLabel(node.config.hazards))}</span>
            <span>PRESSURE x${profile.spawnMultiplier.toFixed(2)} / REWARD x${profile.rewardMultiplier.toFixed(2)} / WAVES ${runtime.escape(waveSummary)}</span>
          </div>
        `
    })
    .join('')
  wrap.innerHTML = `<summary>ROUTE DEBUG</summary>${rows}`
  return wrap
}

function sectorPlanetLabel(min: number, max: number) {
  return min === max ? `${min}` : `${min}-${max}`
}

function sectorHazardsLabel(hazards: SectorHazardTag[]) {
  const labels: Record<SectorHazardTag, string> = {
    clear: 'CLEAR',
    asteroids: 'ASTEROIDS',
    hunterWing: 'HUNTER WING',
    derelictCache: 'DERELICT CACHE',
    nebula: 'NEBULA'
  }
  return hazards.map((hazard) => labels[hazard]).join(' + ')
}
