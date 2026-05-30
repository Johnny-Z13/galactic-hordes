import type { GameState } from '../game-states'
import { availableSectorChoices, type SectorMap, type SectorStationService } from '../sector-map'
import type { StationDockReport } from '../station-dock-report'
import { sectorNodeGlyph } from './sector-map-screen'

interface StationDockView extends Object {}

interface StationDockRuntime {
  stationDockReport: StationDockReport | null
  state: GameState
  ui: {
    station: HTMLElement
  }
  pendingUpgrades: number
  resources: {
    scrap: number
    crystal: number
    cores: number
  }
  sectorMap: SectorMap
  escape(value: string): string
  openStationWorkbench(): void
  leaveStationForSectorMap(): void
  showOnly(which: GameState): void
}

function stationDockRuntime(self: StationDockView) {
  return self as StationDockRuntime
}

export function showStationDock(self: StationDockView, report: StationDockReport) {
  const runtime = stationDockRuntime(self)
  runtime.stationDockReport = report
  runtime.state = 'station'
  runtime.ui.station.innerHTML = ''
  runtime.ui.station.className = 'screen station-dock-screen'
  const panel = document.createElement('div')
  panel.className = 'station-command-panel'
  const signalCopy = runtime.pendingUpgrades > 0
    ? `${runtime.pendingUpgrades} mutation signal${runtime.pendingUpgrades === 1 ? '' : 's'} banked`
    : 'No mutation signals banked'
  panel.innerHTML = `
      <div class="station-command-header">
        <span>STATION COMMAND</span>
        <h1>${runtime.escape(report.stationName)}</h1>
        <p>${runtime.escape(report.fiction)}</p>
      </div>
      <div class="station-command-status">
        <div><b>${runtime.escape(report.nodeLabel)}</b><span>route berth</span></div>
        <div><b>${Math.max(0, report.repaired)}</b><span>hull repaired</span></div>
        <div><b>${runtime.resources.scrap}</b><span>scrap manifest</span></div>
        <div><b>${signalCopy}</b><span>workbench buffer</span></div>
      </div>
    `
  const departure = document.createElement('div')
  departure.className = 'station-departure-panel'
  departure.innerHTML = `
      <div>
        <span>DISCOVERIES BANKED</span>
        <b>Ready For Next Jump</b>
        <p>${runtime.escape(`${report.routeStatus} ${signalCopy}. Choose a sector from the map, then launch.`)}</p>
      </div>
    `
  const launch = document.createElement('button')
  launch.type = 'button'
  launch.className = 'station-command-button primary station-launch-button'
  launch.textContent = 'Launch'
  launch.setAttribute('aria-label', 'Launch: choose sector from map')
  launch.addEventListener('click', () => runtime.leaveStationForSectorMap())
  departure.append(launch)
  const sections = document.createElement('div')
  sections.className = 'station-command-sections'
  const serviceList = document.createElement('div')
  serviceList.className = 'station-service-list'
  for (const service of report.services) {
    const chip = document.createElement('span')
    chip.textContent = stationServiceLabel(service)
    serviceList.append(chip)
  }
  const serviceCopy = document.createElement('p')
  serviceCopy.textContent = report.serviceLine
  const serviceActions = document.createElement('div')
  serviceActions.className = 'station-command-actions'
  const workbench = document.createElement('button')
  workbench.type = 'button'
  workbench.className = 'station-command-button primary'
  workbench.textContent = 'Open Workbench'
  workbench.disabled = runtime.pendingUpgrades <= 0
  workbench.addEventListener('click', () => runtime.openStationWorkbench())
  serviceActions.append(workbench)
  const contact = document.createElement('div')
  contact.className = 'station-contact-panel'
  contact.innerHTML = `
      <b>${runtime.escape(report.contactName)}</b>
      <span>${runtime.escape(report.contactRole)}</span>
      <p>${runtime.escape(report.rumor)}</p>
    `
  const cargo = document.createElement('div')
  cargo.className = 'station-cargo-grid'
  cargo.innerHTML = `
      <div><b>${runtime.resources.scrap}</b><span>SCRAP</span></div>
      <div><b>${runtime.resources.crystal}</b><span>CRYSTALS</span></div>
      <div><b>${runtime.resources.cores}</b><span>CORES</span></div>
      <div><b>${runtime.pendingUpgrades}</b><span>SIGNALS</span></div>
    `
  const routeStatus = document.createElement('p')
  routeStatus.textContent = report.routeStatus
  const routeActions = document.createElement('div')
  routeActions.className = 'station-command-actions'
  const route = document.createElement('button')
  route.type = 'button'
  route.className = 'station-command-button'
  route.textContent = 'Route Map'
  route.addEventListener('click', () => runtime.leaveStationForSectorMap())
  routeActions.append(route)
  sections.append(
    stationCommandSection(runtime, 'SERVICES', 'repair / trade / workbench', [serviceList, serviceCopy, serviceActions], true),
    stationCommandSection(runtime, 'CONTACT', report.contactRole.toUpperCase(), [contact], false),
    stationCommandSection(runtime, 'CARGO MANIFEST', `${runtime.resources.scrap} scrap / ${runtime.resources.crystal} crystal`, [cargo], false),
    stationCommandSection(runtime, 'ROUTE MAP', 'departure lane ready', [stationRouteMap(runtime, report), routeStatus, routeActions], true)
  )
  panel.append(departure)
  panel.append(sections)
  runtime.ui.station.append(panel)
  runtime.showOnly('station')
}

function stationCommandSection(runtime: StationDockRuntime, title: string, status: string, children: HTMLElement[], open: boolean) {
  const section = document.createElement('details')
  section.className = 'station-command-section'
  section.open = open
  const summary = document.createElement('summary')
  summary.innerHTML = `<span>${runtime.escape(title)}</span><b>${runtime.escape(status)}</b>`
  section.append(summary, ...children)
  return section
}

function stationRouteMap(runtime: StationDockRuntime, report: StationDockReport) {
  const map = document.createElement('div')
  map.className = 'station-route-map'
  const availableChoices = availableSectorChoices(runtime.sectorMap)
  for (const node of runtime.sectorMap.nodes) {
    const marker = document.createElement('span')
    const state = node.id === report.nodeId
      ? 'current'
      : node.completed
        ? 'complete'
        : availableChoices.some((choice) => choice.id === node.id)
          ? 'available'
          : 'locked'
    marker.className = `station-route-node ${state}`
    marker.textContent = sectorNodeGlyph(node.kind)
    marker.title = node.id === report.nodeId ? report.stationName : node.label
    map.append(marker)
  }
  return map
}

function stationServiceLabel(service: SectorStationService) {
  const labels: Record<SectorStationService, string> = {
    repair: 'Hull Repair',
    workbench: 'Workbench',
    trade: 'Trade',
    scan: 'Route Scan'
  }
  return labels[service]
}
