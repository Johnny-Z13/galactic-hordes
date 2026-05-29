import titleLogoMarkUrl from '../assets/title-logo-mark.png'
import { relics, upgrades, type RelicId, type Upgrade, type UpgradeBucket, type UpgradeId } from '../powerup-balance'
import {
  isMothershipDepartmentUnlocked,
  mothershipDepartmentUnlockText,
  mothershipDepartments,
  purchaseMothershipTier,
  type MothershipDepartmentId,
  type MothershipState
} from '../mothership-progression'
import { availableSectorChoices, currentSectorNode, type SectorMap } from '../sector-map'
import { clamp } from '../math-utils'
import type { DebriefReport } from '../debrief-report'
import type { MothershipConsoleView } from './mothership-ui-types'
import { renderManifestRelicLine, renderManifestSummary } from './workbench'
import { renderCollectionScreen } from './collection'
import { sectorNodeGlyph } from './sector-map-screen'

interface MothershipConsoleHost extends Object {}

interface MothershipConsoleRuntime {
  build: Record<UpgradeId, number>
  debrief: DebriefReport | null
  evolved: Set<UpgradeId>
  expandedMothershipDepartment: MothershipDepartmentId | null
  mothership: MothershipState
  mothershipConsoleView: MothershipConsoleView
  pendingUpgrades: number
  player: {
    hull: number
    maxHull: number
  }
  relics: Set<RelicId>
  sectorMap: SectorMap
  selectedMothershipDepartment: MothershipDepartmentId
  state: string
  stats: {
    level: number
    nextXp: number
    xp: number
  }
  ui: {
    title: HTMLElement
  }
  bucketLabel(bucket: UpgradeBucket): string
  currentFrontScreenScrollTop(screen: 'powerups'): number
  escape(value: string): string
  launchSectorNode(nodeId: string): void
  saveMothership(): void
  showOnly(which: 'title'): void
  showPowerUps(options?: { scrollTop?: number }): void
  start(): void
  toast(message: string): void
  upgradeLevelDetail(upgrade: Upgrade, level: number): string
}

function mothershipRuntime(self: MothershipConsoleHost) {
  return self as unknown as MothershipConsoleRuntime
}
export function renderBuildManifest(self: MothershipConsoleHost) {
  const runtime = mothershipRuntime(self)
  const wrap = document.createElement('div')
  wrap.className = 'build-manifest overview'
  const title = document.createElement('div')
  title.className = 'manifest-title'
  title.innerHTML = '<b>BUILD MANIFEST</b><span>locked systems, owned ranks, and evolution routes</span>'
  const chips = document.createElement('div')
  chips.className = 'manifest-grid'
  for (const upgrade of upgrades) {
    const level = runtime['build'][upgrade.id]
    const maxed = level >= upgrade.max
    const evolved = runtime['evolved'].has(upgrade.id)
    const catalyst = upgrade.catalyst ? relics.find((relic) => relic.id === upgrade.catalyst) : null
    const ready = maxed && catalyst && runtime['relics'].has(catalyst.id) && !evolved
    const chip = document.createElement('div')
    chip.className = `manifest-chip ${level > 0 ? 'owned' : 'locked'} ${maxed ? 'maxed' : ''} ${ready ? 'ready' : ''} ${evolved ? 'evolved' : ''} ${upgrade.bucket}`
    const route = evolved ? 'EVOLVED' : ready ? 'EVOLUTION READY' : catalyst ? `CATALYST: ${catalyst.name}` : upgrade.category === 'weapon' ? 'WEAPON SYSTEM' : 'SHIP SYSTEM'
    const currentEffect = level > 0 ? ` // ${runtime['upgradeLevelDetail'](upgrade, level)}` : ''
    chip.innerHTML = `
      <div class="manifest-chip-head">
        <strong>${runtime['escape'](upgrade.name)}</strong>
        <b>${level}/${upgrade.max}</b>
      </div>
      <span>${runtime['escape'](route + currentEffect)}</span>
      <em>${runtime['bucketLabel'](upgrade.bucket)}</em>
    `
    chips.append(chip)
  }
  const workbenchSelf = self as Parameters<typeof renderManifestSummary>[0]
  wrap.append(title, renderManifestSummary(workbenchSelf), chips, renderManifestRelicLine(workbenchSelf))
  return wrap
}

export function showMothership(self: MothershipConsoleHost, options: { scrollTop?: number } = {}) {
  const runtime = mothershipRuntime(self)
  runtime['state'] = 'mothership'
  runtime['ui'].title.innerHTML = ''
  runtime['ui'].title.className = 'screen mothership-screen'
  const archiveRecordCount = Object.keys(runtime['mothership'].archive.records).length
  const firstCommand = !runtime['debrief']
    && archiveRecordCount === 0
    && runtime['mothership'].resources.scrap === 0
    && runtime['mothership'].resources.crystal === 0
    && runtime['mothership'].resources.cores === 0
  const shell = document.createElement('div')
  shell.className = `mothership-command ${firstCommand ? 'first-command' : ''}`
  const header = document.createElement('header')
  header.className = 'mothership-command-top'
  const intro = document.createElement('div')
  intro.className = 'mothership-command-title'
  intro.innerHTML = firstCommand
    ? '<span>COMMAND DECK</span><h1>MOTHERSHIP</h1><p>First scout is hot. Find a signal world, crack one cache, and bring something impossible home.</p>'
    : '<span>COMMAND DECK</span><h1>MOTHERSHIP</h1><p>Scout systems docked. Spend recovered cargo, review the ship, then launch the next expedition.</p>'
  if (runtime['debrief']) intro.append(renderMothershipLastReport(self))
  const resources = document.createElement('div')
  resources.className = 'mothership-resources'
  resources.innerHTML = `
    <span><b>Scrap</b>${runtime['mothership'].resources.scrap}</span>
    <span><b>Crystals</b>${runtime['mothership'].resources.crystal}</span>
    <span><b>Cores</b>${runtime['mothership'].resources.cores}</span>
  `
  header.append(intro, resources)

  const flight = document.createElement('section')
  flight.className = 'mothership-flight'
  const status = document.createElement('div')
  status.className = 'mothership-launch-meters'
  const hullPct = clamp(Math.max(0, runtime['player'].hull) / Math.max(1, runtime['player'].maxHull), 0, 1)
  const xpPct = clamp(runtime['stats'].xp / Math.max(1, runtime['stats'].nextXp), 0, 1)
  status.append(
    mothershipMeter(self, 'Hull Integrity', `${Math.round(hullPct * 100)}%`, hullPct, 'health'),
    mothershipMeter(self, 'Mutation XP', `LV ${runtime['stats'].level} // ${Math.floor(runtime['stats'].xp)}/${runtime['stats'].nextXp}`, xpPct, 'xp'),
    mothershipMeter(self, 'Archive Signal', `${archiveRecordCount} records`, clamp(archiveRecordCount / 18, 0, 1), 'archive')
  )
  const shipBay = document.createElement('div')
  shipBay.className = 'mothership-ship-bay'
  const ship = document.createElement('img')
  ship.src = titleLogoMarkUrl
  ship.alt = 'Scout ship docked nose north'
  ship.className = 'mothership-ship-art'
  const launch = document.createElement('button')
  launch.className = 'vector-button start-button mothership-launch'
  launch.textContent = 'Open Sector Map'
  launch.addEventListener('click', () => runtime['start']())
  shipBay.append(ship, launch, status)
  const launchStack = document.createElement('div')
  launchStack.className = 'mothership-launch-stack'
  launchStack.append(shipBay)
  launchStack.append(renderMothershipRoutePreview(self))
  if (firstCommand) launchStack.append(renderFirstMothershipBriefing(self))
  flight.append(launchStack)

  shell.append(header, flight)
  runtime['ui'].title.append(shell)
  runtime['showOnly']('title')
  if (options.scrollTop !== undefined) {
    const restoreScroll = () => {
      shell.scrollTop = clamp(options.scrollTop ?? 0, 0, Math.max(0, shell.scrollHeight - shell.clientHeight))
    }
    restoreScroll()
    requestAnimationFrame(restoreScroll)
  }
}

export function renderMothershipLastReport(self: MothershipConsoleHost) {
  const runtime = mothershipRuntime(self)
  const report = document.createElement('section')
  report.className = 'mothership-last-report-card'
  if (!runtime['debrief']) return report
  const eyebrow = document.createElement('span')
  eyebrow.textContent = runtime['debrief'].title
  const title = document.createElement('b')
  title.textContent = runtime['debrief'].journeyTitle
  const highlights = document.createElement('ul')
  highlights.className = 'mothership-last-report-highlights'
  for (const highlight of runtime['debrief'].highlights.slice(0, 2)) {
    const item = document.createElement('li')
    item.textContent = highlight
    highlights.append(item)
  }
  const cargo = document.createElement('em')
  cargo.textContent = `Scrap ${runtime['debrief'].resources.recovered.scrap} // Crystals ${runtime['debrief'].resources.recovered.crystal} // Cores ${runtime['debrief'].resources.recovered.cores}`
  report.append(eyebrow, title, highlights, cargo)
  return report
}
export function mothershipMeter(self: MothershipConsoleHost, label: string, value: string, pct: number, tone: string) {
  const runtime = mothershipRuntime(self)
  const meter = document.createElement('div')
  meter.className = `mothership-meter ${tone}`
  meter.innerHTML = `
    <div><span>${runtime['escape'](label)}</span><b>${runtime['escape'](value)}</b></div>
    <i><em style="width:${clamp(pct, 0, 1) * 100}%"></em></i>
  `
  return meter
}

export function renderMothershipRoutePreview(self: MothershipConsoleHost) {
  const runtime = mothershipRuntime(self)
  const preview = document.createElement('section')
  preview.className = 'mothership-route-preview'
  const choices = availableSectorChoices(runtime['sectorMap'])
  const current = currentSectorNode(runtime['sectorMap'])
  const lines = [
    { x1: 8, y1: 52, x2: 28, y2: 24 },
    { x1: 8, y1: 52, x2: 28, y2: 52 },
    { x1: 8, y1: 52, x2: 28, y2: 78 },
    { x1: 28, y1: 24, x2: 56, y2: 34 },
    { x1: 28, y1: 52, x2: 56, y2: 52 },
    { x1: 28, y1: 78, x2: 56, y2: 66 },
    { x1: 56, y1: 52, x2: 88, y2: 52 }
  ]
  const nodeMarkup = [
    { label: 'M', x: 8, y: 52, className: 'current', text: 'MOTHERSHIP' },
    ...choices.slice(0, 3).map((node, index) => ({
      label: sectorNodeGlyph(node.kind),
      x: 28,
      y: [24, 52, 78][index],
      className: `available ${node.kind}`,
      text: node.label
    })),
    { label: 'F', x: 88, y: 52, className: 'locked final', text: 'LAST STAND' }
  ]
  preview.innerHTML = `
    <div class="mothership-route-head">
      <b>SECTOR MAP</b>
      <span>${runtime['escape'](current.label)} // ${choices.length} jump routes armed</span>
    </div>
    <div class="mothership-route-map" aria-label="Sector route preview">
      <svg class="mothership-route-lines" viewBox="0 0 100 100" aria-hidden="true">
        ${lines.map((line, index) => `<line class="${index < 3 ? 'available' : ''}" x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}"></line>`).join('')}
      </svg>
      ${nodeMarkup.map((node) => `
        <button class="mothership-route-node ${runtime['escape'](node.className)}" style="left:${node.x}%;top:${node.y}%" type="button" ${node.className.includes('available') ? '' : 'disabled'}>
          <span>${runtime['escape'](node.label)}</span><em>${runtime['escape'](node.text)}</em>
        </button>
      `).join('')}
    </div>
  `
  preview.querySelectorAll<HTMLButtonElement>('.mothership-route-node.available').forEach((button, index) => {
    const node = choices[index]
    button.setAttribute('aria-label', `Launch ${node.label}`)
    button.addEventListener('click', () => {
      if (!node) return
      runtime['launchSectorNode'](node.id)
    })
  })
  return preview
}

export function refreshMetaPowerUps(self: MothershipConsoleHost, scrollTop?: number) {
  const runtime = mothershipRuntime(self)
  if (runtime['state'] === 'powerups') {
    runtime['showPowerUps']({ scrollTop })
    return
  }
  showMothership(self, { scrollTop })
}

export function renderFirstMothershipBriefing(self: MothershipConsoleHost) {
  const briefing = document.createElement('section')
  briefing.className = 'mothership-first-briefing'
  briefing.innerHTML = `
    <div><b>First Directive</b><span>Land on a bright planet signal.</span></div>
    <div><b>Surface Order</b><span>Collect cache signals before O2 collapses.</span></div>
    <div><b>Return Prize</b><span>Bring back records to wake the ship systems.</span></div>
  `
  return briefing
}

export function renderMothershipConsoleStack(self: MothershipConsoleHost) {
  const runtime = mothershipRuntime(self)
  const consolePanel = document.createElement('div')
  consolePanel.className = 'mothership-console-stack'
  const tabs = document.createElement('div')
  tabs.className = 'mothership-console-tabs'
  tabs.append(
    mothershipConsoleTab(self, 'Workbench', 'workbench', `${runtime['pendingUpgrades']} signals`),
    mothershipConsoleTab(self, 'Build', 'manifest', 'systems')
  )
  const content = document.createElement('div')
  content.className = `mothership-console-content ${runtime['mothershipConsoleView']}`
  if (runtime['mothershipConsoleView'] === 'manifest') {
    content.append(renderBuildManifest(self))
  } else {
    const panel = document.createElement('div')
    panel.className = 'mothership-console-panel'
    panel.innerHTML = `
      <b>Workbench Bay</b>
      <span>${runtime['pendingUpgrades']} mutation signal${runtime['pendingUpgrades'] === 1 ? '' : 's'} banked</span>
      <p>Mutation choices install during expeditions. Review current systems or inspect the permanent collection before launch.</p>
    `
    content.append(panel)
  }
  consolePanel.append(tabs, content)
  return consolePanel
}

export function mothershipConsoleTab(self: MothershipConsoleHost, label: string, view: MothershipConsoleView, meta: string) {
  const runtime = mothershipRuntime(self)
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `mothership-console-tab ${runtime['mothershipConsoleView'] === view ? 'active' : ''}`
  button.setAttribute('aria-label', `${label}: ${meta}`)
  button.setAttribute('aria-pressed', String(runtime['mothershipConsoleView'] === view))
  button.innerHTML = `<span>${runtime['escape'](label)}</span><b>${runtime['escape'](meta)}</b>`
  button.addEventListener('click', () => {
    if (runtime['mothershipConsoleView'] === view) return
    runtime['mothershipConsoleView'] = view
    const scrollTop = (runtime['ui'].title as HTMLElement).querySelector<HTMLElement>('.mothership-command')?.scrollTop ?? 0
    showMothership(self, { scrollTop })
  })
  return button
}

export function mothershipStation(self: MothershipConsoleHost, title: string, copy: string, actionLabel: string, action: () => void) {
  const card = document.createElement('div')
  card.className = 'station-card'
  const h = document.createElement('h2')
  h.textContent = title
  const p = document.createElement('p')
  p.textContent = copy
  const button = document.createElement('button')
  button.className = 'vector-button'
  button.textContent = actionLabel
  button.addEventListener('click', action)
  card.append(h, p, button)
  return card
}

export function lockedStation(self: MothershipConsoleHost, title: string, copy: string) {
  const runtime = mothershipRuntime(self)
  const card = document.createElement('div')
  card.className = 'station-card locked'
  card.innerHTML = `<h2>${runtime['escape'](title)}</h2><p>${runtime['escape'](copy)}</p><span>OFFLINE</span>`
  return card
}

export function renderMothershipMetaSystems(self: MothershipConsoleHost) {
  const runtime = mothershipRuntime(self)
  const departments: MothershipDepartmentId[] = ['scanner', 'workbench', 'archive', 'shipyard', 'signalCore', 'hangarCrew']
  if (!departments.includes(runtime['selectedMothershipDepartment'])) runtime['selectedMothershipDepartment'] = 'scanner'
  if (runtime['expandedMothershipDepartment'] && !departments.includes(runtime['expandedMothershipDepartment'])) runtime['expandedMothershipDepartment'] = null
  const window = document.createElement('section')
  window.className = 'permanent-upgrades-window meta-upgrade-window'
  const rail = document.createElement('div')
  rail.className = 'meta-upgrade-rail'
  for (const id of departments) rail.append(metaDepartmentEntry(self, id))
  window.append(rail)
  return window
}

export function metaDepartmentToggle(self: MothershipConsoleHost, id: MothershipDepartmentId) {
  const runtime = mothershipRuntime(self)
  const definition = mothershipDepartments[id]
  const tier = runtime['mothership'].departments[id]
  const maxTier = definition.tiers.length
  const tierPct = clamp(tier / Math.max(1, maxTier), 0, 1)
  const next = definition.tiers[tier]
  const unlocked = isMothershipDepartmentUnlocked(runtime['mothership'], id)
  const button = document.createElement('button')
  button.type = 'button'
  button.id = `mothership-department-${id}-toggle`
  button.className = `meta-department-toggle ${runtime['expandedMothershipDepartment'] === id ? 'active' : ''} ${unlocked ? '' : 'locked'}`.trim()
  button.setAttribute('aria-controls', `mothership-department-${id}-panel`)
  button.setAttribute('aria-pressed', String(runtime['expandedMothershipDepartment'] === id))
  button.setAttribute('aria-expanded', String(runtime['expandedMothershipDepartment'] === id))
  button.addEventListener('click', () => {
    const scrollTop = runtime['state'] === 'powerups'
      ? runtime['currentFrontScreenScrollTop']('powerups')
      : (runtime['ui'].title as HTMLElement).querySelector<HTMLElement>('.mothership-command')?.scrollTop ?? 0
    if (runtime['expandedMothershipDepartment'] === id) {
      runtime['expandedMothershipDepartment'] = null
    } else {
      runtime['selectedMothershipDepartment'] = id
      runtime['expandedMothershipDepartment'] = id
    }
    refreshMetaPowerUps(self, scrollTop)
  })
  const meter = document.createElement('div')
  meter.className = 'station-tier-meter'
  meter.setAttribute('aria-label', `${definition.name} tier ${tier} of ${maxTier}`)
  const fill = document.createElement('i')
  fill.className = 'station-tier-fill'
  fill.style.width = `${tierPct * 100}%`
  meter.append(fill)
  const status = unlocked ? next ? `Next: ${next.name}` : 'Fully online' : `Locked: ${mothershipDepartmentUnlockText(id)}`
  button.innerHTML = `
    <i class="meta-department-code">${runtime['escape'](definition.name.split(' ').map((part) => part[0] ?? '').join('').slice(0, 3).toUpperCase())}</i>
    <div class="meta-department-copy">
      <div class="meta-department-topline">
        <strong>${runtime['escape'](definition.name)}</strong>
        <b>${tier}/${maxTier}</b>
      </div>
      <span>${runtime['escape'](status)}</span>
    </div>
  `
  button.append(meter)
  return button
}

export function metaDepartmentEntry(self: MothershipConsoleHost, id: MothershipDepartmentId) {
  const runtime = mothershipRuntime(self)
  const entry = document.createElement('div')
  entry.className = `meta-department-entry ${runtime['expandedMothershipDepartment'] === id ? 'expanded' : ''}`
  entry.append(metaDepartmentToggle(self, id))
  if (runtime['expandedMothershipDepartment'] === id) entry.append(metaDepartmentDetail(self, id))
  return entry
}

export function metaDepartmentDetail(self: MothershipConsoleHost, id: MothershipDepartmentId) {
  const runtime = mothershipRuntime(self)
  const definition = mothershipDepartments[id]
  const tier = runtime['mothership'].departments[id]
  const maxTier = definition.tiers.length
  const tierPct = clamp(tier / Math.max(1, maxTier), 0, 1)
  const next = definition.tiers[tier]
  const unlocked = isMothershipDepartmentUnlocked(runtime['mothership'], id)
  const detail = document.createElement('article')
  detail.className = `meta-upgrade-detail ${unlocked ? '' : 'locked'}`.trim()
  detail.id = `mothership-department-${id}-panel`
  detail.setAttribute('role', 'region')
  detail.setAttribute('aria-labelledby', `mothership-department-${id}-toggle`)
  const header = document.createElement('div')
  header.className = 'meta-upgrade-detail-head'
  header.innerHTML = `
    <div>
      <b>${runtime['escape'](definition.name)}</b>
      <span>${runtime['escape'](unlocked ? definition.description : `Locked system. Unlock by completing ${mothershipDepartmentUnlockText(id)}.`)}</span>
    </div>
    <em>Tier ${tier}/${maxTier}</em>
  `
  const meter = document.createElement('div')
  meter.className = 'station-tier-meter meta-detail-meter'
  meter.setAttribute('aria-label', `${definition.name} tier ${tier} of ${maxTier}`)
  const fill = document.createElement('i')
  fill.className = 'station-tier-fill'
  fill.style.width = `${tierPct * 100}%`
  meter.append(fill)
  const ladder = document.createElement('div')
  ladder.className = 'meta-tier-ladder'
  definition.tiers.forEach((candidate, index) => {
    const row = document.createElement('div')
    const state = index < tier ? 'complete' : index === tier && unlocked ? 'current' : 'locked'
    row.className = `meta-tier-row ${state}`
    const cost = index < tier
      ? 'INSTALLED'
      : `Scrap ${candidate.cost.scrap} // Crystals ${candidate.cost.crystal} // Cores ${candidate.cost.cores}`
    row.innerHTML = `
      <b>${index + 1}. ${runtime['escape'](candidate.name)}</b>
      <span>${runtime['escape'](candidate.description)}</span>
      <em>${runtime['escape'](cost)}</em>
    `
    ladder.append(row)
  })
  const button = document.createElement('button')
  button.className = 'vector-button secondary'
  button.textContent = unlocked ? next ? 'Authorize Upgrade' : 'Fully Online' : 'Locked'
  button.disabled = !next || !unlocked
  button.addEventListener('click', () => buyMothershipDepartment(self, id))
  detail.append(header, meter, ladder, button)
  return detail
}

export function buyMothershipDepartment(self: MothershipConsoleHost, id: MothershipDepartmentId) {
  const runtime = mothershipRuntime(self)
  const scrollTop = runtime['state'] === 'powerups'
    ? runtime['currentFrontScreenScrollTop']('powerups')
    : (runtime['ui'].title as HTMLElement).querySelector<HTMLElement>('.mothership-command')?.scrollTop ?? 0
  const result = purchaseMothershipTier(runtime['mothership'], id)
  if (!result.ok) {
    runtime['toast'](result.reason)
    return
  }
  runtime['mothership'] = result.state
  runtime['saveMothership']()
  runtime['toast'](`${result.purchased.name.toUpperCase()} ONLINE`)
  refreshMetaPowerUps(self, scrollTop)
}
