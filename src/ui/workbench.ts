import type { VectorShooter, WorkbenchChoice, AudioUpgradeCue } from '../main'
import { evolutions, relics, upgrades, workbenchBalance, type Upgrade, type UpgradeId } from '../powerup-balance'
import { workbenchUnlockEdges, workbenchUpgradeRows, type WorkbenchUpgradeRow } from '../workbench-rolls'
import { workbenchBayDefinitions, workbenchBayForUpgrade, type WorkbenchBayDefinition } from '../workbench-bays'
import { weaponHudReadout } from '../weapon-signatures'
export function renderLevelUp(self: VectorShooter, title: string, copy: string) {
  self['levelUpTitle'] = title
  self['levelUpCopy'] = copy
  self['ui'].levelup.innerHTML = ''
  const panel = document.createElement('div')
  panel.className = 'panel workbench-panel'
  const h = document.createElement('h1')
  h.className = 'title'
  h.textContent = title
  const p = document.createElement('p')
  p.className = 'copy'
  p.textContent = copy
  const actions = document.createElement('div')
  actions.className = 'workbench-actions'
  const view = document.createElement('div')
  view.className = 'workbench-view manifest'
  actions.append(...renderWorkbenchExitActions(self))
  if (self['mothership'].departments.workbench >= 4 && self['pendingUpgrades'] > 0) {
    const recycle = document.createElement('button')
    recycle.className = 'workbench-command recycle'
    recycle.textContent = 'Recycle Signal'
    recycle.addEventListener('click', () => recycleWorkbenchSignal(self))
    actions.append(recycle)
  }
  view.append(renderWorkbenchInstallSurface(self))
  panel.append(h, p)
  if (actions.children.length) panel.append(actions)
  panel.append(view)
  self['ui'].levelup.append(panel)
  self['showOnly']('levelup')
}

export function renderWorkbenchExitActions(self: VectorShooter) {
  const buttons: HTMLButtonElement[] = []
  const continueButton = document.createElement('button')
  continueButton.type = 'button'
  continueButton.className = 'workbench-command primary'
  continueButton.textContent = workbenchContinueLabel(self)
  continueButton.addEventListener('click', () => continueFromWorkbench(self))
  buttons.push(continueButton)

  const backButton = document.createElement('button')
  backButton.type = 'button'
  backButton.className = 'workbench-command secondary'
  backButton.textContent = workbenchBackLabel(self)
  backButton.addEventListener('click', () => backFromWorkbench(self))
  buttons.push(backButton)
  return buttons
}

export function workbenchContinueLabel(self: VectorShooter) {
  if (self['takeoffAfterWorkbench']) return 'Launch Now'
  if (self['returnToSectorMapAfterWorkbench']) return 'Route Map'
  return 'Resume Flight'
}

export function workbenchBackLabel(self: VectorShooter) {
  if (self['takeoffAfterWorkbench']) return 'Back to Surface'
  if (self['returnToSectorMapAfterWorkbench']) return 'Back to Station'
  return 'Back'
}

export function continueFromWorkbench(self: VectorShooter) {
  if (self['workbenchInstalling']) return
  self['showOnly'](null)
  if (self['takeoffAfterWorkbench']) {
    self['takeoffAfterWorkbench'] = false
    self['startTakeoff']({ skipWorkbench: true })
    return
  }
  if (self['returnToSectorMapAfterWorkbench']) {
    self['returnToSectorMapAfterWorkbench'] = false
    self['leaveStationForSectorMap']()
    return
  }
  self['state'] = 'playing'
  self['toast'](self['pendingUpgrades'] > 0 ? `${self['pendingUpgrades']} SIGNAL${self['pendingUpgrades'] === 1 ? '' : 'S'} HELD IN BUFFER` : 'WORKBENCH CLOSED')
}

export function backFromWorkbench(self: VectorShooter) {
  if (self['workbenchInstalling']) return
  if (self['returnToSectorMapAfterWorkbench'] && self['stationDockReport']) {
    const report = self['stationDockReport']
    self['returnToSectorMapAfterWorkbench'] = false
    self['showStationDock'](report)
    return
  }
  self['showOnly'](null)
  if (self['takeoffAfterWorkbench'] && self['surface']) {
    self['takeoffAfterWorkbench'] = false
    self['state'] = 'surface'
    self['toast']('WORKBENCH CLOSED')
    return
  }
  self['state'] = 'playing'
  self['toast']('WORKBENCH CLOSED')
}

export function currentLevelUpScrollTop(self: VectorShooter) {
  const panel = self['ui'].levelup.querySelector<HTMLElement>('.workbench-panel')
  const view = self['ui'].levelup.querySelector<HTMLElement>('.workbench-view')
  return Math.max(panel?.scrollTop ?? 0, view?.scrollTop ?? 0)
}

export function restoreLevelUpScroll(self: VectorShooter, scrollTop: number) {
  const restore = () => {
    const panel = self['ui'].levelup.querySelector<HTMLElement>('.workbench-panel')
    const view = self['ui'].levelup.querySelector<HTMLElement>('.workbench-view')
    if (panel) panel.scrollTop = scrollTop
    if (view) view.scrollTop = scrollTop
  }
  restore()
  window.requestAnimationFrame(restore)
}

export function recycleWorkbenchSignal(self: VectorShooter) {
  if (self['workbenchInstalling'] || self['pendingUpgrades'] <= 0 || self['mothership'].departments.workbench < 4) return
  const scrap = workbenchBalance.recycleScrapBase + Math.floor(self['stats'].level * workbenchBalance.recycleScrapPerLevel)
  const crystal = workbenchBalance.recycleCrystalBase + Math.floor(self['stats'].planets * workbenchBalance.recycleCrystalPerPlanet)
  self['resources'].scrap += scrap
  self['resources'].crystal += crystal
  self['pendingUpgrades'] = Math.max(0, self['pendingUpgrades'] - 1)
  self['toast'](`SIGNAL RECYCLED: +${scrap} SCRAP +${crystal} CRYSTALS`)
  if (self['pendingUpgrades'] > 0) {
    self['refreshLevelUp']('SHIPBOARD WORKBENCH', `${self['pendingUpgrades']} mutation signal${self['pendingUpgrades'] === 1 ? '' : 's'} remain before takeoff.`)
    return
  }
  self['showOnly'](null)
  if (self['takeoffAfterWorkbench']) {
    self['takeoffAfterWorkbench'] = false
    self['startTakeoff']()
  } else if (self['returnToSectorMapAfterWorkbench']) {
    self['returnToSectorMapAfterWorkbench'] = false
    self['showSectorMap']('Station service recycled. Choose the next jump.')
  } else {
    self['state'] = 'playing'
  }
}

export function beginWorkbenchInstall(self: VectorShooter, choice: WorkbenchChoice, button: HTMLButtonElement) {
  if (self['workbenchInstalling']) return
  if (!canApplyWorkbenchChoice(self, choice)) {
    button.disabled = true
    button.classList.add('invalid')
    self['toast']('SYSTEM ALREADY MAXED')
    self['refreshLevelUp']('SHIPBOARD WORKBENCH', `${self['pendingUpgrades']} mutation signal${self['pendingUpgrades'] === 1 ? '' : 's'} remain before takeoff.`)
    return
  }
  self['workbenchInstalling'] = true
  const rare = choice.kind !== 'upgrade' || choice.upgrade.rarity < workbenchBalance.rareInstallRarityThreshold
  self['audio'].install(installCueFor(self, choice), rare)
  const color = choice.kind === 'evolution' || choice.kind === 'relic' ? '#fff27a' : choice.kind === 'limit' ? '#70a8ff' : self['upgradeFxColor'](choice.upgrade)
  button.style.setProperty('--install-color', color)
  const anchor = self['surface']?.ship ?? self['player']
  self['burst'](anchor.x, anchor.y, color, rare ? 28 : 18, rare ? 260 : 190)
  button.classList.add('selected')
  for (const el of Array.from(self['ui'].levelup.querySelectorAll<HTMLButtonElement>('.workbench-install-choice'))) el.disabled = true
  window.setTimeout(
    () => self['applyWorkbenchChoice'](choice),
    (rare ? workbenchBalance.rareInstallDelaySeconds : workbenchBalance.installDelaySeconds) * 1000
  )
}

export function installCueFor(self: VectorShooter, choice: WorkbenchChoice): AudioUpgradeCue {
  if (choice.kind === 'upgrade') return choice.upgrade.bucket
  return choice.kind
}

export function canApplyWorkbenchChoice(self: VectorShooter, choice: WorkbenchChoice) {
  if (choice.kind === 'upgrade') return self['pendingUpgrades'] > 0 && self['build'][choice.upgrade.id] < choice.upgrade.max && isWorkbenchUpgradeUnlocked(self, choice.upgrade.id) && !workbenchBayBalanceGate(self, choice.upgrade)
  if (choice.kind === 'evolution') {
    const upgrade = upgrades.find((candidate) => candidate.id === choice.evolution.weapon)
    return !!upgrade && self['build'][choice.evolution.weapon] >= upgrade.max && self['relics'].has(choice.evolution.relic) && !self['evolved'].has(choice.evolution.weapon)
  }
  if (choice.kind === 'relic') return !self['relics'].has(choice.relic.id)
  return true
}

export function choiceTitle(self: VectorShooter, choice: WorkbenchChoice) {
  if (choice.kind === 'upgrade') return choice.upgrade.name
  if (choice.kind === 'evolution') return choice.evolution.name
  if (choice.kind === 'relic') return choice.relic.name
  return choice.name
}

export function workbenchChoiceRoute(self: VectorShooter, choice: WorkbenchChoice, currentLevel: number) {
  if (choice.kind === 'upgrade') return `INSTALL RANK ${Math.min(currentLevel + 1, choice.upgrade.max)}/${choice.upgrade.max}`
  if (choice.kind === 'evolution') return 'EVOLUTION READY'
  if (choice.kind === 'relic') return 'RELIC SIGNAL'
  return 'LIMIT BREAK'
}

export function choiceDetail(self: VectorShooter, choice: WorkbenchChoice) {
  if (choice.kind === 'upgrade') return self['upgradeLevelDetail'](choice.upgrade, self['build'][choice.upgrade.id] + 1)
  if (choice.kind === 'evolution') return choice.evolution.description
  if (choice.kind === 'relic') return choice.relic.description + (choice.relic.downside ? ` Risk: ${choice.relic.downside}` : '')
  return choice.description
}

export function choiceKindLabel(self: VectorShooter, choice: WorkbenchChoice) {
  if (choice.kind === 'upgrade') return `${self['build'][choice.upgrade.id]}/${choice.upgrade.max}`
  if (choice.kind === 'evolution') return 'EVOLVE'
  if (choice.kind === 'relic') return 'RELIC'
  return 'LIMIT'
}

export function choiceCategoryLabel(self: VectorShooter, choice: WorkbenchChoice) {
  if (choice.kind === 'upgrade') return self['bucketLabel'](choice.upgrade.bucket)
  if (choice.kind === 'evolution') return 'EVOLUTION'
  if (choice.kind === 'relic') return 'RELIC'
  return 'LIMIT BREAK'
}

export function choiceWeaponPreview(self: VectorShooter, choice: WorkbenchChoice) {
  const nextBuild = { ...self['build'] }
  const nextEvolved = new Set(self['evolved'])

  if (choice.kind === 'upgrade') {
    if (choice.upgrade.bucket !== 'weapons') return ''
    const currentLevel = self['build'][choice.upgrade.id]
    if (currentLevel >= choice.upgrade.max) return ''
    nextBuild[choice.upgrade.id] = Math.min(currentLevel + 1, choice.upgrade.max)
  } else if (choice.kind === 'evolution') {
    if (nextEvolved.has(choice.evolution.weapon)) return ''
    nextEvolved.add(choice.evolution.weapon)
  } else {
    return ''
  }

  const current = weaponHudReadout({ build: self['build'], evolved: self['evolved'] })
  const next = weaponHudReadout({ build: nextBuild, evolved: nextEvolved })
  return current.text === next.text ? '' : `NEXT: ${next.text}`
}

export function isWorkbenchUpgradeUnlocked(self: VectorShooter, id: UpgradeId) {
  const rows = workbenchUpgradeRows(upgrades, self['build'], [], workbenchExtraUnlockedIds(self))
  return rows.some((row) => row.upgrade.id === id && row.status !== 'locked')
}

export function workbenchBayOwnedRanks(self: VectorShooter, bay: WorkbenchBayDefinition) {
  return bay.upgradeIds.reduce((sum, id) => {
    const upgrade = upgrades.find((candidate) => candidate.id === id)
    return sum + Math.min(self['build'][id], upgrade?.max ?? self['build'][id])
  }, 0)
}

export function workbenchBayHasUpgradeableSystem(self: VectorShooter, bay: WorkbenchBayDefinition) {
  return bay.upgradeIds.some((id) => {
    const upgrade = upgrades.find((candidate) => candidate.id === id)
    return !!upgrade && isWorkbenchUpgradeUnlocked(self, id) && self['build'][id] < upgrade.max
  })
}

export function workbenchBayBalanceGate(self: VectorShooter, upgrade: Upgrade) {
  const bay = workbenchBayForUpgrade(upgrade)
  if (bay.id === 'spacesuit') return ''
  const activeBays = workbenchBayDefinitions.filter((candidate) => candidate.id !== 'spacesuit' && workbenchBayHasUpgradeableSystem(self, candidate))
  if (activeBays.length < 2) return ''
  const lowestRanks = Math.min(...activeBays.map((candidate) => workbenchBayOwnedRanks(self, candidate)))
  const bayRanks = workbenchBayOwnedRanks(self, bay)
  const maxLead = 2
  if (bayRanks <= lowestRanks + maxLead) return ''
  const catchupTarget = lowestRanks + 1
  return `SYNC LOCK // upgrade another bay to ${catchupTarget}+ ranks`
}

export function renderManifestSummary(self: VectorShooter) {
  const summary = document.createElement('div')
  summary.className = 'manifest-summary'
  const ownedCount = upgrades.filter((upgrade) => self['build'][upgrade.id] > 0).length
  const maxedCount = upgrades.filter((upgrade) => self['build'][upgrade.id] >= upgrade.max).length
  const limitCount = Object.values(self['limitBreaks']).reduce((sum, value) => sum + value, 0)
  summary.innerHTML = `
    <div><b>${ownedCount}/${upgrades.length}</b><span>systems</span></div>
    <div><b>${maxedCount}</b><span>maxed</span></div>
    <div><b>${self['relics'].size}/${relics.length}</b><span>relics</span></div>
    <div><b>${self['evolved'].size}/${evolutions.length}</b><span>evolved</span></div>
    <div><b>${limitCount}</b><span>limits</span></div>
  `
  return summary
}

export function renderManifestRelicLine(self: VectorShooter) {
  const relicLine = document.createElement('div')
  relicLine.className = 'manifest-relics'
  relicLine.textContent = self['relics'].size > 0
    ? Array.from(self['relics']).map((id) => relics.find((relic) => relic.id === id)?.name ?? id).join(' // ')
    : 'No relics installed yet.'
  return relicLine
}

export function workbenchExtraUnlockedIds(self: VectorShooter): UpgradeId[] {
  return self['discoverySuitOffer'] ? ['suitO2'] : []
}

export function workbenchSectionLabel(self: VectorShooter, label: string) {
  const el = document.createElement('div')
  el.className = 'workbench-section-label'
  el.innerHTML = `<b>${self['escape'](label)}</b><span></span>`
  return el
}

export function renderWorkbenchChoiceChip(self: VectorShooter, choice: WorkbenchChoice) {
  const chip = document.createElement('button')
  chip.type = 'button'
  const level = choice.kind === 'upgrade' ? self['build'][choice.upgrade.id] : 0
  const kindClass = choice.kind === 'upgrade' ? choice.upgrade.bucket : choice.kind
  const weaponPreview = choiceWeaponPreview(self, choice)
  chip.className = `manifest-chip available workbench-install-choice ${kindClass}`
  chip.addEventListener('click', () => beginWorkbenchInstall(self, choice, chip))
  chip.innerHTML = `
    <i class="manifest-chip-node">${self['escape'](choiceKindLabel(self, choice))}</i>
    <div class="manifest-chip-head">
      <strong>${self['escape'](choiceTitle(self, choice))}</strong>
      <b>${self['escape'](workbenchChoiceRoute(self, choice, level))}</b>
    </div>
    <span>${self['escape'](choiceDetail(self, choice))}</span>
    ${weaponPreview ? `<small class="workbench-weapon-preview">${self['escape'](weaponPreview)}</small>` : ''}
    <em>${self['escape'](choiceCategoryLabel(self, choice))}</em>
  `
  return chip
}

export function maxedUnlockText(self: VectorShooter, upgrade: Upgrade) {
  const unlocked = workbenchUnlockEdges
    .filter((edge) => edge.source === upgrade.id)
    .flatMap((edge) => edge.unlocks)
    .map((id) => upgrades.find((candidate) => candidate.id === id)?.name ?? id)
  if (unlocked.length) return `UNLOCKED: ${unlocked.join(' // ')}`
  return self['upgradeLevelDetail'](upgrade, upgrade.max)
}

export function renderWorkbenchUpgradeChip(self: VectorShooter, upgrade: Upgrade) {
  const chip = document.createElement('button')
  chip.type = 'button'
  const next = Math.min(self['build'][upgrade.id] + 1, upgrade.max)
  const weaponPreview = choiceWeaponPreview(self, { kind: 'upgrade', upgrade })
  chip.className = `manifest-chip available workbench-install-choice offer-ready ${upgrade.bucket}`
  chip.addEventListener('click', () => beginWorkbenchInstall(self, { kind: 'upgrade', upgrade }, chip))
  chip.innerHTML = `
    <i class="manifest-chip-node">UP</i>
    <div class="manifest-chip-head">
      <strong>${self['escape'](upgrade.name)}</strong>
      <b>${self['build'][upgrade.id]}/${upgrade.max}</b>
    </div>
    <span>${self['escape'](`INSTALL RANK ${next}/${upgrade.max} // ${self['upgradeLevelDetail'](upgrade, next)}`)}</span>
    ${weaponPreview ? `<small class="workbench-weapon-preview">${self['escape'](weaponPreview)}</small>` : ''}
    <em>${self['bucketLabel'](upgrade.bucket)}</em>
  `
  return chip
}

export function renderWorkbenchContextChip(self: VectorShooter, upgrade: Upgrade, status: 'MAXED' | 'LOCKED' | 'STANDBY', detail: string, extraClass = '') {
  const level = self['build'][upgrade.id]
  const chip = document.createElement('div')
  chip.className = `manifest-chip ${level > 0 ? 'owned' : 'unowned'} status-${status.toLowerCase()} ${status === 'LOCKED' ? 'locked future' : ''} ${status === 'MAXED' ? 'maxed' : ''} ${extraClass} ${upgrade.bucket}`
  chip.innerHTML = `
    <i class="manifest-chip-node">${self['escape'](status)}</i>
    <div class="manifest-chip-head">
      <strong>${self['escape'](upgrade.name)}</strong>
      <b>${level}/${upgrade.max}</b>
    </div>
    <span>${self['escape'](`${status} // ${detail}`)}</span>
    <em>${self['bucketLabel'](upgrade.bucket)}</em>
  `
  return chip
}

export function renderWorkbenchBayToggle(
  self: VectorShooter,
  bay: WorkbenchBayDefinition,
  rows: Array<WorkbenchUpgradeRow<Upgrade>>,
  offeredUpgradeChoices: Map<UpgradeId, WorkbenchChoice>
) {
  const bayRows = rows.filter((row) => bay.upgradeIds.includes(row.upgrade.id))
  const totalRanks = bayRows.reduce((sum, row) => sum + row.upgrade.max, 0)
  const ownedRanks = bayRows.reduce((sum, row) => sum + Math.min(self['build'][row.upgrade.id], row.upgrade.max), 0)
  const maxedCount = bayRows.filter((row) => row.status === 'maxed').length
  const lockedCount = bayRows.filter((row) => row.status === 'locked').length
  const upgradeableCount = bayRows.filter((row) => row.status === 'standby' && !workbenchBayBalanceGate(self, row.upgrade)).length
  const nextRow = bayRows.find((row) => row.status === 'standby' && !workbenchBayBalanceGate(self, row.upgrade))
    ?? bayRows.find((row) => row.status === 'standby')
    ?? bayRows.find((row) => row.status === 'locked')
    ?? bayRows[0]
  const progress = totalRanks > 0 ? ownedRanks / totalRanks : 0
  const button = document.createElement('button')
  button.type = 'button'
  button.id = `workbench-bay-${bay.id}-toggle`
  button.className = `workbench-bay-toggle ${self['expandedWorkbenchBay'] === bay.id ? 'active' : ''} ${upgradeableCount > 0 ? 'has-offer' : ''} ${lockedCount === bayRows.length ? 'locked' : ''}`.trim()
  button.setAttribute('aria-controls', `workbench-bay-${bay.id}-panel`)
  button.setAttribute('aria-expanded', String(self['expandedWorkbenchBay'] === bay.id))
  button.addEventListener('click', () => {
    const scrollTop = currentLevelUpScrollTop(self)
    if (self['expandedWorkbenchBay'] === bay.id) {
      self['expandedWorkbenchBay'] = null
    } else {
      self['selectedWorkbenchBay'] = bay.id
      self['expandedWorkbenchBay'] = bay.id
    }
    renderLevelUp(self, self['levelUpTitle'], self['levelUpCopy'])
    restoreLevelUpScroll(self, scrollTop)
  })
  const nextStatus = nextRow
    ? offeredUpgradeChoices.has(nextRow.upgrade.id)
      ? `Upgrade ready: ${nextRow.upgrade.name}`
      : nextRow.status === 'locked'
        ? `Locked: ${nextRow.upgrade.name}`
        : nextRow.status === 'maxed'
          ? 'Bay complete'
          : `Next: ${nextRow.upgrade.name}`
    : 'Bay complete'
  button.innerHTML = `
    <i class="workbench-bay-code">${self['escape'](bay.shortLabel.slice(0, 3).toUpperCase())}</i>
    <div class="workbench-bay-copy">
      <div class="workbench-bay-topline">
        <strong>${self['escape'](bay.label)}</strong>
        <b>${ownedRanks}/${totalRanks}</b>
      </div>
      <span>${self['escape'](nextStatus)}</span>
      <div class="workbench-bay-meter"><i style="width: ${Math.round(progress * 100)}%"></i></div>
      <em>${maxedCount}/${bayRows.length} maxed${lockedCount > 0 ? ` // ${lockedCount} locked` : ''}${upgradeableCount > 0 ? ` // ${upgradeableCount} ready` : ''}</em>
    </div>
  `
  return button
}

export function renderWorkbenchBayEntry(
  self: VectorShooter,
  bay: WorkbenchBayDefinition,
  rows: Array<WorkbenchUpgradeRow<Upgrade>>,
  offeredUpgradeChoices: Map<UpgradeId, WorkbenchChoice>
) {
  const entry = document.createElement('div')
  entry.className = `workbench-bay-entry ${self['expandedWorkbenchBay'] === bay.id ? 'expanded' : ''}`
  entry.append(renderWorkbenchBayToggle(self, bay, rows, offeredUpgradeChoices))
  if (self['expandedWorkbenchBay'] === bay.id) entry.append(renderWorkbenchBayDetail(self, bay, rows, offeredUpgradeChoices))
  return entry
}

export function renderWorkbenchBayDetail(
  self: VectorShooter,
  bay: WorkbenchBayDefinition,
  rows: Array<WorkbenchUpgradeRow<Upgrade>>,
  offeredUpgradeChoices: Map<UpgradeId, WorkbenchChoice>
) {
  const detail = document.createElement('div')
  detail.className = 'workbench-bay-detail'
  detail.id = `workbench-bay-${bay.id}-panel`
  detail.setAttribute('role', 'region')
  detail.setAttribute('aria-labelledby', `workbench-bay-${bay.id}-toggle`)
  const head = document.createElement('div')
  head.className = 'workbench-bay-detail-head'
  head.innerHTML = `<div><b>${self['escape'](bay.label)}</b><span>${self['escape'](bay.summary)}</span></div><em>${self['escape'](bay.shortLabel.toUpperCase())} DATABASE</em>`
  const grid = document.createElement('div')
  grid.className = 'manifest-grid workbench-bay-grid'
  for (const row of rows.filter((candidate) => bay.upgradeIds.includes(candidate.upgrade.id))) {
    if (row.status === 'maxed') {
      grid.append(renderWorkbenchContextChip(self, row.upgrade, 'MAXED', maxedUnlockText(self, row.upgrade)))
    } else if (row.status === 'locked') {
      grid.append(renderWorkbenchContextChip(self, row.upgrade, 'LOCKED', row.requirement ?? 'Future workbench unlock', 'future'))
    } else if (!workbenchBayBalanceGate(self, row.upgrade)) {
      grid.append(renderWorkbenchUpgradeChip(self, row.upgrade))
    } else {
      grid.append(renderWorkbenchContextChip(self, row.upgrade, 'STANDBY', workbenchBayBalanceGate(self, row.upgrade), 'standby'))
    }
  }
  detail.append(head, grid)
  return detail
}

export function renderWorkbenchInstallSurface(self: VectorShooter) {
  const wrap = document.createElement('div')
  wrap.className = 'build-manifest workbench'
  const title = document.createElement('div')
  title.className = 'manifest-title'
  title.innerHTML = '<b>SHIP WORKBENCH</b><span>open a bay // spend signals on unlocked systems</span>'
  const offeredUpgradeChoices = new Map<UpgradeId, WorkbenchChoice>()
  if (!workbenchBayDefinitions.some((bay) => bay.id === self['selectedWorkbenchBay'])) self['selectedWorkbenchBay'] = 'weapons'
  if (self['expandedWorkbenchBay'] && !workbenchBayDefinitions.some((bay) => bay.id === self['expandedWorkbenchBay'])) self['expandedWorkbenchBay'] = null

  const rows = workbenchUpgradeRows(upgrades, self['build'], [], workbenchExtraUnlockedIds(self))

  const bayShell = document.createElement('div')
  bayShell.className = 'workbench-bay-shell'
  const bayList = document.createElement('div')
  bayList.className = 'workbench-bay-list'
  for (const bay of workbenchBayDefinitions) bayList.append(renderWorkbenchBayEntry(self, bay, rows, offeredUpgradeChoices))
  bayShell.append(bayList)

  wrap.append(
    title,
    renderManifestSummary(self),
    workbenchSectionLabel(self, 'SYSTEM BAYS'),
    bayShell
  )

  wrap.append(renderManifestRelicLine(self))
  return wrap
}
