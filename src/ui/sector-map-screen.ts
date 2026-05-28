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
import type { VectorShooter } from '../main'

export function showSectorMap(self: VectorShooter, message: string) {
  self['state'] = 'sectorMap'
  self['ui'].sectorMap.innerHTML = ''
  self['ui'].sectorMap.className = 'screen sector-map-screen'
  const panel = document.createElement('div')
  panel.className = 'sector-map-panel'
  const top = document.createElement('div')
  top.className = 'sector-map-top'
  const titleBlock = document.createElement('div')
  titleBlock.className = 'sector-map-title'
  titleBlock.innerHTML = `<span>RUN ROUTE</span><h1>SECTOR MAP</h1><p>${self['escape'](message)}</p>`
  const choices = availableSectorChoices(self['sectorMap'])
  const status = document.createElement('div')
  status.className = 'sector-map-status'
  status.innerHTML = `
      <span><b>${self['sectorMap'].nodes.filter((node) => node.completed && node.kind !== 'mothership').length}</b> CLEARED</span>
      <span><b>${choices.length}</b> ROUTES</span>
      <span><b>${self['resources'].scrap}</b> SCRAP</span>
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
  for (const edge of self['sectorMap'].edges) {
    const from = self['sectorMap'].nodes.find((node) => node.id === edge.from)
    const to = self['sectorMap'].nodes.find((node) => node.id === edge.to)
    if (!from || !to) continue
    const a = sectorNodePosition(self['sectorMap'], from)
    const b = sectorNodePosition(self['sectorMap'], to)
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', `${a.x}`)
    line.setAttribute('y1', `${a.y}`)
    line.setAttribute('x2', `${b.x}`)
    line.setAttribute('y2', `${b.y}`)
    line.classList.add(from.completed && to.completed ? 'completed' : from.id === self['sectorMap'].currentNodeId ? 'available' : 'locked')
    svg.append(line)
  }
  graph.append(svg)
  for (const node of self['sectorMap'].nodes) {
    const pos = sectorNodePosition(self['sectorMap'], node)
    const isAvailable = choices.some((choice) => choice.id === node.id)
    const stationVisit = self['stationVisits'].find((visit) => visit.nodeId === node.id)
    const stateLabel = stationVisit ? 'DOCKED' : node.completed ? 'DONE' : node.id === self['sectorMap'].currentNodeId ? 'HERE' : isAvailable ? 'OPEN' : 'LOCK'
    const button = document.createElement('button')
    button.type = 'button'
    button.className = sectorNodeClass(self['sectorMap'], node, choices)
    button.style.left = `${pos.x}%`
    button.style.top = `${pos.y}%`
    button.dataset.label = node.label
    button.setAttribute('aria-label', `${sectorKindLabel(node.kind)}: ${node.label}`)
    button.innerHTML = `
        <span class="sector-node-core"><span class="sector-node-glyph">${sectorNodeGlyph(node.kind)}</span></span>
        <span class="sector-node-label">${self['escape'](node.label.replace(/\s+\d+-\d+$/, ''))}</span>
        <span class="sector-node-state">${stateLabel}</span>
      `
    button.title = stationVisit ? `${stationVisit.stationName}: ${stationVisit.contactName}, ${stationVisit.contactRole}` : `${node.label}: ${node.description}`
    button.disabled = !isAvailable
    button.addEventListener('click', () => self['launchSectorNode'](node.id))
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
  const current = currentSectorNode(self['sectorMap'])
  const currentStationVisit = self['stationVisits'].find((visit) => visit.nodeId === current.id)
  const heading = document.createElement('div')
  heading.className = 'sector-map-current'
  heading.innerHTML = currentStationVisit
    ? `<span>CURRENT NODE // DOCKED</span><h2>${self['escape'](currentStationVisit.stationName)}</h2><p>${self['escape'](`${currentStationVisit.contactName}, ${currentStationVisit.contactRole}: ${currentStationVisit.rumor}`)}</p>`
    : `<span>CURRENT NODE</span><h2>${self['escape'](current.label)}</h2><p>${self['escape'](current.description)}</p>`
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
          <span class="sector-choice-kind">${self['escape'](sectorKindLabel(choice.kind))}</span>
          <b class="sector-choice-title">${self['escape'](choice.label)}</b>
        </span>
        <small>${self['escape'](choice.config.readout)}</small>
        <span class="sector-choice-intel" aria-label="Route decision intel">
          <span>${self['escape'](intel.directive)}</span>
          <span>${self['escape'](intel.reward)}</span>
          <span>${self['escape'](intel.risk)}</span>
        </span>
        <span class="sector-choice-metrics" aria-label="Route metrics">
          <span><b>${planets}</b><em>PLANETS</em></span>
          <span><b>${choice.config.waves.length}</b><em>${sectorWaveLabel(choice.config.waveOrder)}</em></span>
          <span><b>${sectorFirstWaveLabel(choice)}</b><em>CONTACT</em></span>
          <span><b>x${profile.spawnMultiplier.toFixed(2)}</b><em>PRESSURE</em></span>
          <span><b>${self['escape'](hazards)}</b><em>HAZARDS</em></span>
        </span>
        <i class="sector-choice-readout">${self['escape'](sectorNodeConfigSummary(choice, profile))}</i>
      `
    option.addEventListener('click', () => self['launchSectorNode'](choice.id))
    list.append(option)
  }
  if (!choices.length) {
    const empty = document.createElement('p')
    empty.className = 'copy small'
    empty.textContent = 'No forward route is open yet.'
    list.append(empty)
  }
  list.append(sectorMapDebugReadout(self))
  details.append(heading, list)
  body.append(graph, details)
  panel.append(top, body)
  self['ui'].sectorMap.append(panel)
  self['showOnly']('sectorMap')
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

function sectorMapDebugReadout(self: VectorShooter) {
  const wrap = document.createElement('details')
  wrap.className = 'sector-debug-readout'
  const rows = self['sectorMap'].nodes
    .filter((node) => node.kind !== 'mothership')
    .sort((a, b) => a.column - b.column || a.row - b.row)
    .map((node) => {
      const profile = sectorNodeRunProfile(node)
      const waveSummary = node.config.waves.map((wave) => `${wave.atSeconds}s:${wave.label}`).join(', ')
      return `
          <div class="sector-debug-row ${self['escape'](node.kind)}">
            <b>${self['escape'](node.label)}</b>
            <span>${self['escape'](node.config.templateId)} / d${node.config.depth.toFixed(2)} / ${self['escape'](node.config.pace)}</span>
            <span>${self['escape'](node.config.enemyPacket.label)} / ${self['escape'](node.config.rewardShape.label)} / ${self['escape'](node.config.modifiers.map((modifier) => modifier.label).join(' + '))}</span>
            <span>PLANETS ${sectorPlanetLabel(node.config.planets.countMin, node.config.planets.countMax)} / ${self['escape'](node.config.planets.density)} / ${self['escape'](sectorHazardsLabel(node.config.hazards))}</span>
            <span>PRESSURE x${profile.spawnMultiplier.toFixed(2)} / REWARD x${profile.rewardMultiplier.toFixed(2)} / WAVES ${self['escape'](waveSummary)}</span>
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
