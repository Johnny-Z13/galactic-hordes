import titleLogoMarkUrl from '../assets/title-logo-mark.png'
import { relics, upgrades } from '../powerup-balance'
import {
  isMothershipDepartmentUnlocked,
  mothershipDepartmentUnlockText,
  mothershipDepartments,
  purchaseMothershipTier,
  type MothershipDepartmentId
} from '../mothership-progression'
import { availableSectorChoices, currentSectorNode } from '../sector-map'
import { clamp, type MothershipConsoleView, type VectorShooter } from '../main'
import { renderManifestRelicLine, renderManifestSummary } from './workbench'
import { renderCollectionScreen } from './collection'
import { sectorNodeGlyph } from './sector-map-screen'
export function renderBuildManifest(self: VectorShooter) {
  const wrap = document.createElement('div')
  wrap.className = 'build-manifest overview'
  const title = document.createElement('div')
  title.className = 'manifest-title'
  title.innerHTML = '<b>BUILD MANIFEST</b><span>locked systems, owned ranks, and evolution routes</span>'
  const chips = document.createElement('div')
  chips.className = 'manifest-grid'
  for (const upgrade of upgrades) {
    const level = self['build'][upgrade.id]
    const maxed = level >= upgrade.max
    const evolved = self['evolved'].has(upgrade.id)
    const catalyst = upgrade.catalyst ? relics.find((relic) => relic.id === upgrade.catalyst) : null
    const ready = maxed && catalyst && self['relics'].has(catalyst.id) && !evolved
    const chip = document.createElement('div')
    chip.className = `manifest-chip ${level > 0 ? 'owned' : 'locked'} ${maxed ? 'maxed' : ''} ${ready ? 'ready' : ''} ${evolved ? 'evolved' : ''} ${upgrade.bucket}`
    const route = evolved ? 'EVOLVED' : ready ? 'EVOLUTION READY' : catalyst ? `CATALYST: ${catalyst.name}` : upgrade.category === 'weapon' ? 'WEAPON SYSTEM' : 'SHIP SYSTEM'
    const currentEffect = level > 0 ? ` // ${self['upgradeLevelDetail'](upgrade, level)}` : ''
    chip.innerHTML = `
      <div class="manifest-chip-head">
        <strong>${self['escape'](upgrade.name)}</strong>
        <b>${level}/${upgrade.max}</b>
      </div>
      <span>${self['escape'](route + currentEffect)}</span>
      <em>${self['bucketLabel'](upgrade.bucket)}</em>
    `
    chips.append(chip)
  }
  wrap.append(title, renderManifestSummary(self), chips, renderManifestRelicLine(self))
  return wrap
}

export function showMothership(self: VectorShooter, options: { scrollTop?: number } = {}) {
  self['state'] = 'mothership'
  self['ui'].title.innerHTML = ''
  self['ui'].title.className = 'screen mothership-screen'
  const archiveRecordCount = Object.keys(self['mothership'].archive.records).length
  const firstCommand = !self['debrief']
    && archiveRecordCount === 0
    && self['mothership'].resources.scrap === 0
    && self['mothership'].resources.crystal === 0
    && self['mothership'].resources.cores === 0
  const shell = document.createElement('div')
  shell.className = `mothership-command ${firstCommand ? 'first-command' : ''}`
  const header = document.createElement('header')
  header.className = 'mothership-command-top'
  const intro = document.createElement('div')
  intro.className = 'mothership-command-title'
  intro.innerHTML = firstCommand
    ? '<span>COMMAND DECK</span><h1>MOTHERSHIP</h1><p>First scout is hot. Find a signal world, crack one cache, and bring something impossible home.</p>'
    : '<span>COMMAND DECK</span><h1>MOTHERSHIP</h1><p>Scout systems docked. Spend recovered cargo, review the ship, then launch the next expedition.</p>'
  if (self['debrief']) {
    const lastRun = document.createElement('p')
    lastRun.className = 'mothership-last-report'
    lastRun.textContent = `${self['debrief'].title} // ${self['debrief'].discoveries.length} discoveries // Scrap ${self['debrief'].resources.recovered.scrap} // Crystals ${self['debrief'].resources.recovered.crystal} // Cores ${self['debrief'].resources.recovered.cores}`
    intro.append(lastRun)
  }
  const resources = document.createElement('div')
  resources.className = 'mothership-resources'
  resources.innerHTML = `
    <span><b>Scrap</b>${self['mothership'].resources.scrap}</span>
    <span><b>Crystals</b>${self['mothership'].resources.crystal}</span>
    <span><b>Cores</b>${self['mothership'].resources.cores}</span>
  `
  header.append(intro, resources)

  const flight = document.createElement('section')
  flight.className = 'mothership-flight'
  const status = document.createElement('div')
  status.className = 'mothership-launch-meters'
  const hullPct = clamp(Math.max(0, self['player'].hull) / Math.max(1, self['player'].maxHull), 0, 1)
  const xpPct = clamp(self['stats'].xp / Math.max(1, self['stats'].nextXp), 0, 1)
  status.append(
    mothershipMeter(self, 'Hull Integrity', `${Math.round(hullPct * 100)}%`, hullPct, 'health'),
    mothershipMeter(self, 'Mutation XP', `LV ${self['stats'].level} // ${Math.floor(self['stats'].xp)}/${self['stats'].nextXp}`, xpPct, 'xp'),
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
  launch.textContent = 'Launch Expedition'
  launch.addEventListener('click', () => self['start']())
  shipBay.append(ship, launch, status)
  const launchStack = document.createElement('div')
  launchStack.className = 'mothership-launch-stack'
  launchStack.append(shipBay)
  launchStack.append(renderMothershipRoutePreview(self))
  if (firstCommand) launchStack.append(renderFirstMothershipBriefing(self))
  flight.append(launchStack)

  shell.append(header, flight)
  self['ui'].title.append(shell)
  self['showOnly']('title')
  if (options.scrollTop !== undefined) {
    const restoreScroll = () => {
      shell.scrollTop = clamp(options.scrollTop ?? 0, 0, Math.max(0, shell.scrollHeight - shell.clientHeight))
    }
    restoreScroll()
    requestAnimationFrame(restoreScroll)
  }
}

export function mothershipMeter(self: VectorShooter, label: string, value: string, pct: number, tone: string) {
  const meter = document.createElement('div')
  meter.className = `mothership-meter ${tone}`
  meter.innerHTML = `
    <div><span>${self['escape'](label)}</span><b>${self['escape'](value)}</b></div>
    <i><em style="width:${clamp(pct, 0, 1) * 100}%"></em></i>
  `
  return meter
}

export function renderMothershipRoutePreview(self: VectorShooter) {
  const preview = document.createElement('section')
  preview.className = 'mothership-route-preview'
  const choices = availableSectorChoices(self['sectorMap'])
  const current = currentSectorNode(self['sectorMap'])
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
      <span>${self['escape'](current.label)} // ${choices.length} jump routes armed</span>
    </div>
    <div class="mothership-route-map" aria-label="Sector route preview">
      <svg class="mothership-route-lines" viewBox="0 0 100 100" aria-hidden="true">
        ${lines.map((line, index) => `<line class="${index < 3 ? 'available' : ''}" x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}"></line>`).join('')}
      </svg>
      ${nodeMarkup.map((node) => `
        <button class="mothership-route-node ${self['escape'](node.className)}" style="left:${node.x}%;top:${node.y}%" type="button" ${node.className.includes('available') ? '' : 'disabled'}>
          <span>${self['escape'](node.label)}</span><em>${self['escape'](node.text)}</em>
        </button>
      `).join('')}
    </div>
  `
  preview.querySelectorAll<HTMLButtonElement>('.mothership-route-node.available').forEach((button, index) => {
    const node = choices[index]
    button.addEventListener('click', () => {
      if (!node) return
      self['toast'](`${node.label}: ${node.description}`)
    })
  })
  return preview
}

export function refreshMetaPowerUps(self: VectorShooter, scrollTop?: number) {
  if (self['state'] === 'powerups') {
    self['showPowerUps']({ scrollTop })
    return
  }
  showMothership(self, { scrollTop })
}

export function renderFirstMothershipBriefing(self: VectorShooter) {
  const briefing = document.createElement('section')
  briefing.className = 'mothership-first-briefing'
  briefing.innerHTML = `
    <div><b>First Directive</b><span>Land on a bright planet signal.</span></div>
    <div><b>Surface Order</b><span>Collect cache signals before O2 collapses.</span></div>
    <div><b>Return Prize</b><span>Bring back records to wake the ship systems.</span></div>
  `
  return briefing
}

export function renderMothershipConsoleStack(self: VectorShooter) {
  const consolePanel = document.createElement('div')
  consolePanel.className = 'mothership-console-stack'
  const tabs = document.createElement('div')
  tabs.className = 'mothership-console-tabs'
  tabs.append(
    mothershipConsoleTab(self, 'Workbench', 'workbench', `${self['pendingUpgrades']} signals`),
    mothershipConsoleTab(self, 'Build', 'manifest', 'systems')
  )
  const content = document.createElement('div')
  content.className = `mothership-console-content ${self['mothershipConsoleView']}`
  if (self['mothershipConsoleView'] === 'manifest') {
    content.append(renderBuildManifest(self))
  } else {
    const panel = document.createElement('div')
    panel.className = 'mothership-console-panel'
    panel.innerHTML = `
      <b>Workbench Bay</b>
      <span>${self['pendingUpgrades']} mutation signal${self['pendingUpgrades'] === 1 ? '' : 's'} banked</span>
      <p>Mutation choices install during expeditions. Review current systems or inspect the permanent collection before launch.</p>
    `
    content.append(panel)
  }
  consolePanel.append(tabs, content)
  return consolePanel
}

export function mothershipConsoleTab(self: VectorShooter, label: string, view: MothershipConsoleView, meta: string) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `mothership-console-tab ${self['mothershipConsoleView'] === view ? 'active' : ''}`
  button.setAttribute('aria-label', `${label}: ${meta}`)
  button.setAttribute('aria-pressed', String(self['mothershipConsoleView'] === view))
  button.innerHTML = `<span>${self['escape'](label)}</span><b>${self['escape'](meta)}</b>`
  button.addEventListener('click', () => {
    if (self['mothershipConsoleView'] === view) return
    self['mothershipConsoleView'] = view
    const scrollTop = self['ui'].title.querySelector<HTMLElement>('.mothership-command')?.scrollTop ?? 0
    showMothership(self, { scrollTop })
  })
  return button
}

export function mothershipStation(self: VectorShooter, title: string, copy: string, actionLabel: string, action: () => void) {
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

export function lockedStation(self: VectorShooter, title: string, copy: string) {
  const card = document.createElement('div')
  card.className = 'station-card locked'
  card.innerHTML = `<h2>${self['escape'](title)}</h2><p>${self['escape'](copy)}</p><span>OFFLINE</span>`
  return card
}

export function renderMothershipMetaSystems(self: VectorShooter) {
  const departments: MothershipDepartmentId[] = ['scanner', 'workbench', 'archive', 'shipyard', 'signalCore', 'hangarCrew']
  if (!departments.includes(self['selectedMothershipDepartment'])) self['selectedMothershipDepartment'] = 'scanner'
  if (self['expandedMothershipDepartment'] && !departments.includes(self['expandedMothershipDepartment'])) self['expandedMothershipDepartment'] = null
  const window = document.createElement('section')
  window.className = 'permanent-upgrades-window meta-upgrade-window'
  const rail = document.createElement('div')
  rail.className = 'meta-upgrade-rail'
  for (const id of departments) rail.append(metaDepartmentEntry(self, id))
  window.append(rail)
  return window
}

export function metaDepartmentToggle(self: VectorShooter, id: MothershipDepartmentId) {
  const definition = mothershipDepartments[id]
  const tier = self['mothership'].departments[id]
  const maxTier = definition.tiers.length
  const tierPct = clamp(tier / Math.max(1, maxTier), 0, 1)
  const next = definition.tiers[tier]
  const unlocked = isMothershipDepartmentUnlocked(self['mothership'], id)
  const button = document.createElement('button')
  button.type = 'button'
  button.id = `mothership-department-${id}-toggle`
  button.className = `meta-department-toggle ${self['expandedMothershipDepartment'] === id ? 'active' : ''} ${unlocked ? '' : 'locked'}`.trim()
  button.setAttribute('aria-controls', `mothership-department-${id}-panel`)
  button.setAttribute('aria-pressed', String(self['expandedMothershipDepartment'] === id))
  button.setAttribute('aria-expanded', String(self['expandedMothershipDepartment'] === id))
  button.addEventListener('click', () => {
    const scrollTop = self['state'] === 'powerups'
      ? self['currentFrontScreenScrollTop']('powerups')
      : self['ui'].title.querySelector<HTMLElement>('.mothership-command')?.scrollTop ?? 0
    if (self['expandedMothershipDepartment'] === id) {
      self['expandedMothershipDepartment'] = null
    } else {
      self['selectedMothershipDepartment'] = id
      self['expandedMothershipDepartment'] = id
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
    <i class="meta-department-code">${self['escape'](definition.name.split(' ').map((part) => part[0] ?? '').join('').slice(0, 3).toUpperCase())}</i>
    <div class="meta-department-copy">
      <div class="meta-department-topline">
        <strong>${self['escape'](definition.name)}</strong>
        <b>${tier}/${maxTier}</b>
      </div>
      <span>${self['escape'](status)}</span>
    </div>
  `
  button.append(meter)
  return button
}

export function metaDepartmentEntry(self: VectorShooter, id: MothershipDepartmentId) {
  const entry = document.createElement('div')
  entry.className = `meta-department-entry ${self['expandedMothershipDepartment'] === id ? 'expanded' : ''}`
  entry.append(metaDepartmentToggle(self, id))
  if (self['expandedMothershipDepartment'] === id) entry.append(metaDepartmentDetail(self, id))
  return entry
}

export function metaDepartmentDetail(self: VectorShooter, id: MothershipDepartmentId) {
  const definition = mothershipDepartments[id]
  const tier = self['mothership'].departments[id]
  const maxTier = definition.tiers.length
  const tierPct = clamp(tier / Math.max(1, maxTier), 0, 1)
  const next = definition.tiers[tier]
  const unlocked = isMothershipDepartmentUnlocked(self['mothership'], id)
  const detail = document.createElement('article')
  detail.className = `meta-upgrade-detail ${unlocked ? '' : 'locked'}`.trim()
  detail.id = `mothership-department-${id}-panel`
  detail.setAttribute('role', 'region')
  detail.setAttribute('aria-labelledby', `mothership-department-${id}-toggle`)
  const header = document.createElement('div')
  header.className = 'meta-upgrade-detail-head'
  header.innerHTML = `
    <div>
      <b>${self['escape'](definition.name)}</b>
      <span>${self['escape'](unlocked ? definition.description : `Locked system. Unlock by completing ${mothershipDepartmentUnlockText(id)}.`)}</span>
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
      <b>${index + 1}. ${self['escape'](candidate.name)}</b>
      <span>${self['escape'](candidate.description)}</span>
      <em>${self['escape'](cost)}</em>
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

export function buyMothershipDepartment(self: VectorShooter, id: MothershipDepartmentId) {
  const scrollTop = self['state'] === 'powerups'
    ? self['currentFrontScreenScrollTop']('powerups')
    : self['ui'].title.querySelector<HTMLElement>('.mothership-command')?.scrollTop ?? 0
  const result = purchaseMothershipTier(self['mothership'], id)
  if (!result.ok) {
    self['toast'](result.reason)
    return
  }
  self['mothership'] = result.state
  self['saveMothership']()
  self['toast'](`${result.purchased.name.toUpperCase()} ONLINE`)
  refreshMetaPowerUps(self, scrollTop)
}