import type { SectorStationService } from '../sector-map'
import { availableSectorChoices } from '../sector-map'
import type { StationDockReport } from '../station-dock-report'
import type { VectorShooter } from '../main'
import { sectorNodeGlyph } from './sector-map-screen'

export function showStationDock(self: VectorShooter, report: StationDockReport) {
  self['stationDockReport'] = report
  self['state'] = 'station'
  self['ui'].station.innerHTML = ''
  self['ui'].station.className = 'screen station-dock-screen'
  const panel = document.createElement('div')
  panel.className = 'station-command-panel'
  const signalCopy = self['pendingUpgrades'] > 0
    ? `${self['pendingUpgrades']} mutation signal${self['pendingUpgrades'] === 1 ? '' : 's'} banked`
    : 'No mutation signals banked'
  panel.innerHTML = `
      <div class="station-command-header">
        <span>STATION COMMAND</span>
        <h1>${self['escape'](report.stationName)}</h1>
        <p>${self['escape'](report.fiction)}</p>
      </div>
      <div class="station-command-status">
        <div><b>${self['escape'](report.nodeLabel)}</b><span>route berth</span></div>
        <div><b>${Math.max(0, report.repaired)}</b><span>hull repaired</span></div>
        <div><b>${self['resources'].scrap}</b><span>scrap manifest</span></div>
        <div><b>${signalCopy}</b><span>workbench buffer</span></div>
      </div>
    `
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
  workbench.disabled = self['pendingUpgrades'] <= 0
  workbench.addEventListener('click', () => self['openStationWorkbench']())
  serviceActions.append(workbench)
  const contact = document.createElement('div')
  contact.className = 'station-contact-panel'
  contact.innerHTML = `
      <b>${self['escape'](report.contactName)}</b>
      <span>${self['escape'](report.contactRole)}</span>
      <p>${self['escape'](report.rumor)}</p>
    `
  const cargo = document.createElement('div')
  cargo.className = 'station-cargo-grid'
  cargo.innerHTML = `
      <div><b>${self['resources'].scrap}</b><span>SCRAP</span></div>
      <div><b>${self['resources'].crystal}</b><span>CRYSTALS</span></div>
      <div><b>${self['resources'].cores}</b><span>CORES</span></div>
      <div><b>${self['pendingUpgrades']}</b><span>SIGNALS</span></div>
    `
  const routeStatus = document.createElement('p')
  routeStatus.textContent = report.routeStatus
  const routeActions = document.createElement('div')
  routeActions.className = 'station-command-actions'
  const route = document.createElement('button')
  route.type = 'button'
  route.className = 'station-command-button'
  route.textContent = 'Route Map'
  route.addEventListener('click', () => self['leaveStationForSectorMap']())
  routeActions.append(route)
  sections.append(
    stationCommandSection(self, 'SERVICES', 'repair / trade / workbench', [serviceList, serviceCopy, serviceActions], true),
    stationCommandSection(self, 'CONTACT', report.contactRole.toUpperCase(), [contact], false),
    stationCommandSection(self, 'CARGO MANIFEST', `${self['resources'].scrap} scrap / ${self['resources'].crystal} crystal`, [cargo], false),
    stationCommandSection(self, 'ROUTE MAP', 'departure lane ready', [stationRouteMap(self, report), routeStatus, routeActions], false)
  )
  panel.append(sections)
  self['ui'].station.append(panel)
  self['showOnly']('station')
}

function stationCommandSection(self: VectorShooter, title: string, status: string, children: HTMLElement[], open: boolean) {
  const section = document.createElement('details')
  section.className = 'station-command-section'
  section.open = open
  const summary = document.createElement('summary')
  summary.innerHTML = `<span>${self['escape'](title)}</span><b>${self['escape'](status)}</b>`
  section.append(summary, ...children)
  return section
}

function stationRouteMap(self: VectorShooter, report: StationDockReport) {
  const map = document.createElement('div')
  map.className = 'station-route-map'
  const availableChoices = availableSectorChoices(self['sectorMap'])
  for (const node of self['sectorMap'].nodes) {
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
