import {
  availableSectorChoices,
  currentSectorNode,
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
  graph.className = 'sector-map-graph sector-map-starchart'
  const graphHeader = document.createElement('div')
  graphHeader.className = 'sector-map-graph-header'
  graphHeader.innerHTML = `<span>LOCAL STARCHART</span><b>${choices.length} ROUTES OPEN</b>`
  graph.append(graphHeader)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.classList.add('sector-map-lines')
  svg.setAttribute('viewBox', '0 0 100 100')
  for (const edge of runtime.sectorMap.edges) {
    const from = runtime.sectorMap.nodes.find((node) => node.id === edge.from)
    const to = runtime.sectorMap.nodes.find((node) => node.id === edge.to)
    if (!from || !to) continue
    const a = sectorNodePosition(runtime.sectorMap, from)
    const b = sectorNodePosition(runtime.sectorMap, to)
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', `${a.x}`)
    line.setAttribute('y1', `${a.y}`)
    line.setAttribute('x2', `${b.x}`)
    line.setAttribute('y2', `${b.y}`)
    line.classList.add(from.completed && to.completed ? 'completed' : from.id === runtime.sectorMap.currentNodeId ? 'available' : 'locked')
    svg.append(line)
  }
  graph.append(svg)
  for (const node of runtime.sectorMap.nodes) {
    const pos = sectorNodePosition(runtime.sectorMap, node)
    const isAvailable = choices.some((choice) => choice.id === node.id)
    const stationVisit = runtime.stationVisits.find((visit) => visit.nodeId === node.id)
    const stateLabel = stationVisit ? 'DOCKED' : node.completed ? 'DONE' : node.id === runtime.sectorMap.currentNodeId ? 'HERE' : isAvailable ? 'OPEN' : 'LOCK'
    const button = document.createElement('button')
    button.type = 'button'
    button.className = sectorNodeClass(runtime.sectorMap, node, choices)
    button.style.left = `${pos.x}%`
    button.style.top = `${pos.y}%`
    button.dataset.label = node.label
    button.setAttribute('aria-label', `${sectorKindLabel(node.kind)}: ${node.label}`)
    button.innerHTML = `
        <span class="sector-node-core"><span class="sector-node-glyph">${sectorNodeGlyph(node.kind)}</span></span>
        <span class="sector-node-label">${runtime.escape(node.label.replace(/\s+\d+-\d+$/, ''))}</span>
        <span class="sector-node-state">${stateLabel}</span>
      `
    button.title = stationVisit ? `${stationVisit.stationName}: ${stationVisit.contactName}, ${stationVisit.contactRole}` : `${node.label}: ${node.description}`
    button.disabled = !isAvailable
    button.addEventListener('click', () => runtime.launchSectorNode(node.id))
    graph.append(button)
  }
  const legend = document.createElement('div')
  legend.className = 'sector-map-legend'
  legend.innerHTML = `
      <span><i class="legend-swatch planet"></i>Planet</span>
      <span><i class="legend-swatch hostile"></i>Combat</span>
      <span><i class="legend-swatch anomaly"></i>Hazard</span>
      <span><i class="legend-swatch station"></i>Station</span>
    `
  graph.append(legend)

  const details = document.createElement('div')
  details.className = 'sector-map-details'
  const current = currentSectorNode(runtime.sectorMap)
  const currentStationVisit = runtime.stationVisits.find((visit) => visit.nodeId === current.id)
  const heading = document.createElement('div')
  heading.className = 'sector-map-current'
  heading.innerHTML = currentStationVisit
    ? `<span>CURRENT NODE // DOCKED</span><h2>${runtime.escape(currentStationVisit.stationName)}</h2><p>${runtime.escape(`${currentStationVisit.contactName}, ${currentStationVisit.contactRole}: ${currentStationVisit.rumor}`)}</p>`
    : `<span>CURRENT NODE</span><h2>${runtime.escape(current.label)}</h2><p>${runtime.escape(current.description)}</p>`
  const list = document.createElement('div')
  list.className = 'sector-choice-list'
  for (const choice of choices) {
    const profile = sectorNodeRunProfile(choice)
    const intel = sectorNodeDecisionIntel(choice)
    const hazards = sectorHazardsLabel(choice.config.hazards)
    const planets = sectorPlanetLabel(choice.config.planets.countMin, choice.config.planets.countMax)
    const option = document.createElement('button')
    option.type = 'button'
    option.className = `sector-choice ${choice.kind}`
    option.innerHTML = `
        <span class="sector-choice-head">
          <span class="sector-choice-kind">${runtime.escape(sectorKindLabel(choice.kind))}</span>
          <b class="sector-choice-title">${runtime.escape(choice.label)}</b>
        </span>
        <small>${runtime.escape(choice.config.readout)}</small>
        <span class="sector-choice-intel" aria-label="Route decision intel">
          <span>${runtime.escape(intel.directive)}</span>
          <span>${runtime.escape(intel.reward)}</span>
          <span>${runtime.escape(intel.risk)}</span>
        </span>
        <span class="sector-choice-metrics" aria-label="Route metrics">
          <span><b>${planets}</b><em>PLANETS</em></span>
          <span><b>${choice.config.waves.length}</b><em>${sectorWaveLabel(choice.config.waveOrder)}</em></span>
          <span><b>${sectorFirstWaveLabel(choice)}</b><em>CONTACT</em></span>
          <span><b>x${profile.spawnMultiplier.toFixed(2)}</b><em>PRESSURE</em></span>
          <span><b>${runtime.escape(hazards)}</b><em>HAZARDS</em></span>
        </span>
        <i class="sector-choice-readout">${runtime.escape(sectorNodeConfigSummary(choice, profile))}</i>
      `
    option.addEventListener('click', () => runtime.launchSectorNode(choice.id))
    list.append(option)
  }
  if (!choices.length) {
    const empty = document.createElement('p')
    empty.className = 'copy small'
    empty.textContent = 'No forward route is open yet.'
    list.append(empty)
  }
  list.append(sectorMapDebugReadout(runtime))
  details.append(heading, list)
  body.append(graph, details)
  panel.append(top, body)
  runtime.ui.sectorMap.append(panel)
  runtime.showOnly('sectorMap')
}

function sectorNodePosition(sectorMap: SectorMap, node: SectorNode) {
  const x = 8 + (node.column / Math.max(1, sectorMap.columns - 1)) * 84
  const y = node.id === 'mothership' ? 48 : node.kind === 'final' ? 48 : 18 + node.row * 20
  return { x, y }
}

function sectorNodeClass(sectorMap: SectorMap, node: SectorNode, choices: SectorNode[]) {
  const classes = ['sector-node', node.kind]
  const available = choices.some((choice) => choice.id === node.id)
  if (node.completed) classes.push('completed')
  if (node.id === sectorMap.currentNodeId) classes.push('current')
  if (available) classes.push('available')
  if (!node.completed && node.id !== sectorMap.currentNodeId && !available) classes.push('locked')
  return classes.join(' ')
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
