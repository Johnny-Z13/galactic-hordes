import type { AudioUpgradeCue } from '../audio/audio-director'
import { evolutions, relics, upgrades, workbenchBalance, type RelicId, type Upgrade, type UpgradeBucket, type UpgradeId } from '../powerup-balance'
import { workbenchUnlockEdges, workbenchUpgradeRows, type WorkbenchUpgradeRow } from '../workbench-rolls'
import { workbenchBayDefinitions, workbenchBayForUpgrade, type WorkbenchBayDefinition, type WorkbenchBayId } from '../workbench-bays'
import type { WorkbenchChoice } from '../workbench-choices'
import { weaponHudReadout } from '../weapon-signatures'
import type { GameState } from '../game-states'
import type { MothershipState, ResourceBundle } from '../mothership-progression'
import type { StationDockReport } from '../station-dock-report'

export const workbenchTopOfferCap = 5

interface WorkbenchHost extends Object {}

interface WorkbenchRuntime {
  audio: {
    install(cue: AudioUpgradeCue, rare: boolean): void
  }
  build: Record<UpgradeId, number>
  discoverySuitOffer: boolean
  evolved: Set<UpgradeId>
  expandedWorkbenchBay: WorkbenchBayId | null
  levelUpCopy: string
  levelUpTitle: string
  limitBreaks: Record<string, number>
  mothership: MothershipState
  pendingUpgrades: number
  player: {
    x: number
    y: number
  }
  relics: Set<RelicId>
  resources: ResourceBundle
  returnToSectorMapAfterWorkbench: boolean
  selectedWorkbenchBay: WorkbenchBayId
  state: string
  stationDockReport: StationDockReport | null
  stats: {
    level: number
    planets: number
  }
  surface: {
    ship: {
      x: number
      y: number
    }
  } | null
  takeoffAfterWorkbench: boolean
  ui: {
    levelup: HTMLElement
  }
  workbenchInstalling: boolean
  applyWorkbenchChoice(choice: WorkbenchChoice): void
  bucketLabel(bucket: UpgradeBucket): string
  burst(x: number, y: number, color: string, count: number, speed: number): void
  escape(value: string): string
  leaveStationForSectorMap(): void
  refreshLevelUp(title?: string, copy?: string): void
  showOnly(which: GameState | null): void
  showSectorMap(message?: string): void
  showStationDock(report: StationDockReport): void
  startTakeoff(options?: { urgent?: boolean; skipWorkbench?: boolean }): void
  toast(message: string): void
  upgradeFxColor(upgrade: Upgrade): string
  upgradeLevelDetail(upgrade: Upgrade, level: number): string
}

function workbenchRuntime(self: WorkbenchHost) {
  return self as unknown as WorkbenchRuntime
}

export interface WorkbenchWeaponPreviewRuntime {
  build: Record<string, number>
  evolved: Set<string>
}

function workbenchWeaponPreviewRuntime(self: WorkbenchHost) {
  return workbenchRuntime(self) as WorkbenchWeaponPreviewRuntime
}

export function renderLevelUp(self: WorkbenchHost, title: string, copy: string) {
  const runtime = workbenchRuntime(self)
  runtime['levelUpTitle'] = title
  runtime['levelUpCopy'] = copy
  runtime['ui'].levelup.innerHTML = ''
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
  if (runtime['mothership'].departments.workbench >= 4 && runtime['pendingUpgrades'] > 0) {
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
  runtime['ui'].levelup.append(panel)
  runtime['showOnly']('levelup')
}

export function renderWorkbenchExitActions(self: WorkbenchHost) {
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

export function workbenchContinueLabel(self: WorkbenchHost) {
  const runtime = workbenchRuntime(self)
  if (runtime['takeoffAfterWorkbench']) return 'Launch Now'
  if (runtime['returnToSectorMapAfterWorkbench']) return 'Route Map'
  return 'Resume Flight'
}

export function workbenchBackLabel(self: WorkbenchHost) {
  const runtime = workbenchRuntime(self)
  if (runtime['takeoffAfterWorkbench']) return 'Back to Surface'
  if (runtime['returnToSectorMapAfterWorkbench']) return 'Back to Station'
  return 'Back'
}

export function continueFromWorkbench(self: WorkbenchHost) {
  const runtime = workbenchRuntime(self)
  if (runtime['workbenchInstalling']) return
  runtime['showOnly'](null)
  if (runtime['takeoffAfterWorkbench']) {
    runtime['takeoffAfterWorkbench'] = false
    runtime['startTakeoff']({ skipWorkbench: true })
    return
  }
  if (runtime['returnToSectorMapAfterWorkbench']) {
    runtime['returnToSectorMapAfterWorkbench'] = false
    runtime['leaveStationForSectorMap']()
    return
  }
  runtime['state'] = 'playing'
  runtime['toast'](runtime['pendingUpgrades'] > 0 ? `${runtime['pendingUpgrades']} SIGNAL${runtime['pendingUpgrades'] === 1 ? '' : 'S'} HELD IN BUFFER` : 'WORKBENCH CLOSED')
}

export function backFromWorkbench(self: WorkbenchHost) {
  const runtime = workbenchRuntime(self)
  if (runtime['workbenchInstalling']) return
  if (runtime['returnToSectorMapAfterWorkbench'] && runtime['stationDockReport']) {
    const report = runtime['stationDockReport']
    runtime['returnToSectorMapAfterWorkbench'] = false
    runtime['showStationDock'](report)
    return
  }
  runtime['showOnly'](null)
  if (runtime['takeoffAfterWorkbench'] && runtime['surface']) {
    runtime['takeoffAfterWorkbench'] = false
    runtime['state'] = 'surface'
    runtime['toast']('WORKBENCH CLOSED')
    return
  }
  runtime['state'] = 'playing'
  runtime['toast']('WORKBENCH CLOSED')
}

export function currentLevelUpScrollTop(self: WorkbenchHost) {
  const runtime = workbenchRuntime(self)
  const levelup = runtime['ui'].levelup as HTMLElement
  const panel = levelup.querySelector<HTMLElement>('.workbench-panel')
  const view = levelup.querySelector<HTMLElement>('.workbench-view')
  return Math.max(panel?.scrollTop ?? 0, view?.scrollTop ?? 0)
}

export function restoreLevelUpScroll(self: WorkbenchHost, scrollTop: number) {
  const runtime = workbenchRuntime(self)
  const restore = () => {
    const levelup = runtime['ui'].levelup as HTMLElement
    const panel = levelup.querySelector<HTMLElement>('.workbench-panel')
    const view = levelup.querySelector<HTMLElement>('.workbench-view')
    if (panel) panel.scrollTop = scrollTop
    if (view) view.scrollTop = scrollTop
  }
  restore()
  window.requestAnimationFrame(restore)
}

export function recycleWorkbenchSignal(self: WorkbenchHost) {
  const runtime = workbenchRuntime(self)
  if (runtime['workbenchInstalling'] || runtime['pendingUpgrades'] <= 0 || runtime['mothership'].departments.workbench < 4) return
  const scrap = workbenchBalance.recycleScrapBase + Math.floor(runtime['stats'].level * workbenchBalance.recycleScrapPerLevel)
  const crystal = workbenchBalance.recycleCrystalBase + Math.floor(runtime['stats'].planets * workbenchBalance.recycleCrystalPerPlanet)
  runtime['resources'].scrap += scrap
  runtime['resources'].crystal += crystal
  runtime['pendingUpgrades'] = Math.max(0, runtime['pendingUpgrades'] - 1)
  runtime['toast'](`SIGNAL RECYCLED: +${scrap} SCRAP +${crystal} CRYSTALS`)
  if (runtime['pendingUpgrades'] > 0) {
    runtime['refreshLevelUp']('SHIPBOARD WORKBENCH', `${runtime['pendingUpgrades']} mutation signal${runtime['pendingUpgrades'] === 1 ? '' : 's'} remain before takeoff.`)
    return
  }
  runtime['showOnly'](null)
  if (runtime['takeoffAfterWorkbench']) {
    runtime['takeoffAfterWorkbench'] = false
    runtime['startTakeoff']()
  } else if (runtime['returnToSectorMapAfterWorkbench']) {
    runtime['returnToSectorMapAfterWorkbench'] = false
    runtime['showSectorMap']('Station service recycled. Choose the next jump.')
  } else {
    runtime['state'] = 'playing'
  }
}

export function beginWorkbenchInstall(self: WorkbenchHost, choice: WorkbenchChoice, button: HTMLButtonElement) {
  const runtime = workbenchRuntime(self)
  if (runtime['workbenchInstalling']) return
  if (!canApplyWorkbenchChoice(self, choice)) {
    button.disabled = true
    button.classList.add('invalid')
    runtime['toast']('SYSTEM ALREADY MAXED')
    runtime['refreshLevelUp']('SHIPBOARD WORKBENCH', `${runtime['pendingUpgrades']} mutation signal${runtime['pendingUpgrades'] === 1 ? '' : 's'} remain before takeoff.`)
    return
  }
  runtime['workbenchInstalling'] = true
  const rare = choice.kind !== 'upgrade' || choice.upgrade.rarity < workbenchBalance.rareInstallRarityThreshold
  runtime['audio'].install(installCueFor(self, choice), rare)
  const color = choice.kind === 'evolution' || choice.kind === 'relic' ? '#fff27a' : choice.kind === 'limit' ? '#70a8ff' : runtime['upgradeFxColor'](choice.upgrade)
  button.style.setProperty('--install-color', color)
  const anchor = runtime['surface']?.ship ?? runtime['player']
  runtime['burst'](anchor.x, anchor.y, color, rare ? 28 : 18, rare ? 260 : 190)
  button.classList.add('selected')
  const levelup = runtime['ui'].levelup as HTMLElement
  for (const el of Array.from(levelup.querySelectorAll<HTMLButtonElement>('.workbench-install-choice'))) el.disabled = true
  window.setTimeout(
    () => runtime['applyWorkbenchChoice'](choice),
    (rare ? workbenchBalance.rareInstallDelaySeconds : workbenchBalance.installDelaySeconds) * 1000
  )
}

export function installCueFor(self: WorkbenchHost, choice: WorkbenchChoice): AudioUpgradeCue {
  if (choice.kind === 'upgrade') return choice.upgrade.bucket
  return choice.kind
}

export function canApplyWorkbenchChoice(self: WorkbenchHost, choice: WorkbenchChoice) {
  const runtime = workbenchRuntime(self)
  if (choice.kind === 'upgrade') return runtime['pendingUpgrades'] > 0 && runtime['build'][choice.upgrade.id] < choice.upgrade.max && isWorkbenchUpgradeUnlocked(self, choice.upgrade.id) && !workbenchBayBalanceGate(self, choice.upgrade)
  if (choice.kind === 'evolution') {
    const upgrade = upgrades.find((candidate) => candidate.id === choice.evolution.weapon)
    return !!upgrade && runtime['build'][choice.evolution.weapon] >= upgrade.max && runtime['relics'].has(choice.evolution.relic) && !runtime['evolved'].has(choice.evolution.weapon)
  }
  if (choice.kind === 'relic') return !runtime['relics'].has(choice.relic.id)
  return true
}

export function choiceTitle(self: WorkbenchHost, choice: WorkbenchChoice) {
  if (choice.kind === 'upgrade') return choice.upgrade.name
  if (choice.kind === 'evolution') return choice.evolution.name
  if (choice.kind === 'relic') return choice.relic.name
  return choice.name
}

export function workbenchChoiceRoute(self: WorkbenchHost, choice: WorkbenchChoice, currentLevel: number) {
  if (choice.kind === 'upgrade') return `INSTALL RANK ${Math.min(currentLevel + 1, choice.upgrade.max)}/${choice.upgrade.max}`
  if (choice.kind === 'evolution') return 'EVOLUTION READY'
  if (choice.kind === 'relic') return 'RELIC SIGNAL'
  return 'LIMIT BREAK'
}

export function choiceDetail(self: WorkbenchHost, choice: WorkbenchChoice) {
  const runtime = workbenchRuntime(self)
  if (choice.kind === 'upgrade') return runtime['upgradeLevelDetail'](choice.upgrade, runtime['build'][choice.upgrade.id] + 1)
  if (choice.kind === 'evolution') return choice.evolution.description
  if (choice.kind === 'relic') return choice.relic.description + (choice.relic.downside ? ` Risk: ${choice.relic.downside}` : '')
  return choice.description
}

export function choiceKindLabel(self: WorkbenchHost, choice: WorkbenchChoice) {
  const runtime = workbenchRuntime(self)
  if (choice.kind === 'upgrade') return `${runtime['build'][choice.upgrade.id]}/${choice.upgrade.max}`
  if (choice.kind === 'evolution') return 'EVOLVE'
  if (choice.kind === 'relic') return 'RELIC'
  return 'LIMIT'
}

export function choiceCategoryLabel(self: WorkbenchHost, choice: WorkbenchChoice) {
  const runtime = workbenchRuntime(self)
  if (choice.kind === 'upgrade') return runtime['bucketLabel'](choice.upgrade.bucket)
  if (choice.kind === 'evolution') return 'EVOLUTION'
  if (choice.kind === 'relic') return 'RELIC'
  return 'LIMIT BREAK'
}

export function choiceWeaponPreview(self: WorkbenchWeaponPreviewRuntime, choice: WorkbenchChoice) {
  const nextBuild = { ...self.build }
  const nextEvolved = new Set<string>(self.evolved)

  if (choice.kind === 'upgrade') {
    if (choice.upgrade.bucket !== 'weapons') return ''
    const currentLevel = self.build[choice.upgrade.id]
    if (currentLevel >= choice.upgrade.max) return ''
    nextBuild[choice.upgrade.id] = Math.min(currentLevel + 1, choice.upgrade.max)
  } else if (choice.kind === 'evolution') {
    if (nextEvolved.has(choice.evolution.weapon)) return ''
    nextEvolved.add(choice.evolution.weapon)
  } else {
    return ''
  }

  const current = weaponHudReadout({ build: self.build, evolved: self.evolved })
  const next = weaponHudReadout({ build: nextBuild, evolved: nextEvolved })
  return current.text === next.text ? '' : `NEXT: ${next.text}`
}

export function isWorkbenchUpgradeUnlocked(self: WorkbenchHost, id: UpgradeId) {
  const runtime = workbenchRuntime(self)
  const rows = workbenchUpgradeRows(upgrades, runtime['build'], [], workbenchExtraUnlockedIds(self))
  return rows.some((row) => row.upgrade.id === id && row.status !== 'locked')
}

export function workbenchBayOwnedRanks(self: WorkbenchHost, bay: WorkbenchBayDefinition) {
  const runtime = workbenchRuntime(self)
  return bay.upgradeIds.reduce((sum, id) => {
    const upgrade = upgrades.find((candidate) => candidate.id === id)
    return sum + Math.min(runtime['build'][id], upgrade?.max ?? runtime['build'][id])
  }, 0)
}

export function workbenchBayHasUpgradeableSystem(self: WorkbenchHost, bay: WorkbenchBayDefinition) {
  const runtime = workbenchRuntime(self)
  return bay.upgradeIds.some((id) => {
    const upgrade = upgrades.find((candidate) => candidate.id === id)
    return !!upgrade && isWorkbenchUpgradeUnlocked(self, id) && runtime['build'][id] < upgrade.max
  })
}

export function workbenchBayBalanceGate(self: WorkbenchHost, upgrade: Upgrade) {
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

export function workbenchReadyRows(self: WorkbenchHost, rows: Array<WorkbenchUpgradeRow<Upgrade>>) {
  return rows.filter((row) => row.status === 'standby' && !workbenchBayBalanceGate(self, row.upgrade))
}

export function workbenchTopReadyRows(self: WorkbenchHost, rows: Array<WorkbenchUpgradeRow<Upgrade>>) {
  return workbenchReadyRows(self, rows).slice(0, workbenchTopOfferCap)
}

export function renderWorkbenchSignalBriefing(self: WorkbenchHost, rows: Array<WorkbenchUpgradeRow<Upgrade>>) {
  const runtime = workbenchRuntime(self)
  const briefing = document.createElement('div')
  briefing.className = 'workbench-signal-briefing'
  const readyRows = workbenchReadyRows(self, rows)
  const signalCount = runtime['pendingUpgrades']
  const head = document.createElement('div')
  head.className = 'workbench-signal-briefing-head'
  head.innerHTML = signalCount > 0
    ? `<b>${signalCount} SIGNAL${signalCount === 1 ? '' : 'S'} READY</b><span>${readyRows.length} install path${readyRows.length === 1 ? '' : 's'} online // choose now or inspect a bay</span>`
    : '<b>NO SIGNALS BANKED</b><span>Level up during a route or dock at service stations to install more systems.</span>'
  briefing.append(head)

  if (signalCount <= 0 || readyRows.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'workbench-empty-offers'
    empty.textContent = signalCount > 0
      ? 'No eligible systems are online. Inspect locked bays for the next requirement.'
      : 'No install choices available.'
    briefing.append(empty)
    return briefing
  }

  const offers = document.createElement('div')
  offers.className = 'manifest-grid workbench-current-offers'
  for (const row of workbenchTopReadyRows(self, rows)) offers.append(renderWorkbenchUpgradeChip(self, row.upgrade))
  briefing.append(offers)
  return briefing
}

export function renderManifestSummary(self: WorkbenchHost) {
  const runtime = workbenchRuntime(self)
  const summary = document.createElement('div')
  summary.className = 'manifest-summary'
  const ownedCount = upgrades.filter((upgrade) => runtime['build'][upgrade.id] > 0).length
  const maxedCount = upgrades.filter((upgrade) => runtime['build'][upgrade.id] >= upgrade.max).length
  const limitCount = Object.values(runtime['limitBreaks'] as Record<string, number>).reduce((sum, value) => sum + value, 0)
  summary.innerHTML = `
    <div><b>${ownedCount}/${upgrades.length}</b><span>systems</span></div>
    <div><b>${maxedCount}</b><span>maxed</span></div>
    <div><b>${runtime['relics'].size}/${relics.length}</b><span>relics</span></div>
    <div><b>${runtime['evolved'].size}/${evolutions.length}</b><span>evolved</span></div>
    <div><b>${limitCount}</b><span>limits</span></div>
  `
  return summary
}

export function renderManifestRelicLine(self: WorkbenchHost) {
  const runtime = workbenchRuntime(self)
  const relicLine = document.createElement('div')
  relicLine.className = 'manifest-relics'
  relicLine.textContent = runtime['relics'].size > 0
    ? Array.from(runtime['relics']).map((id) => relics.find((relic) => relic.id === id)?.name ?? id).join(' // ')
    : 'No relics installed yet.'
  return relicLine
}

export function workbenchExtraUnlockedIds(self: WorkbenchHost): UpgradeId[] {
  const runtime = workbenchRuntime(self)
  return runtime['discoverySuitOffer'] ? ['suitO2'] : []
}

export function workbenchSectionLabel(self: WorkbenchHost, label: string) {
  const runtime = workbenchRuntime(self)
  const el = document.createElement('div')
  el.className = 'workbench-section-label'
  el.innerHTML = `<b>${runtime['escape'](label)}</b><span></span>`
  return el
}

export function renderWorkbenchChoiceChip(self: WorkbenchHost, choice: WorkbenchChoice) {
  const runtime = workbenchRuntime(self)
  const chip = document.createElement('button')
  chip.type = 'button'
  const level = choice.kind === 'upgrade' ? runtime['build'][choice.upgrade.id] : 0
  const kindClass = choice.kind === 'upgrade' ? choice.upgrade.bucket : choice.kind
  const weaponPreview = choiceWeaponPreview(workbenchWeaponPreviewRuntime(self), choice)
  chip.className = `manifest-chip available workbench-install-choice ${kindClass}`
  chip.addEventListener('click', () => beginWorkbenchInstall(self, choice, chip))
  chip.innerHTML = `
    <i class="manifest-chip-node">${runtime['escape'](choiceKindLabel(self, choice))}</i>
    <div class="manifest-chip-head">
      <strong>${runtime['escape'](choiceTitle(self, choice))}</strong>
      <b>${runtime['escape'](workbenchChoiceRoute(self, choice, level))}</b>
    </div>
    <span>${runtime['escape'](choiceDetail(self, choice))}</span>
    ${weaponPreview ? `<small class="workbench-weapon-preview">${runtime['escape'](weaponPreview)}</small>` : ''}
    <em>${runtime['escape'](choiceCategoryLabel(self, choice))}</em>
  `
  return chip
}

export function maxedUnlockText(self: WorkbenchHost, upgrade: Upgrade) {
  const runtime = workbenchRuntime(self)
  const unlocked = workbenchUnlockEdges
    .filter((edge) => edge.source === upgrade.id)
    .flatMap((edge) => edge.unlocks)
    .map((id) => upgrades.find((candidate) => candidate.id === id)?.name ?? id)
  if (unlocked.length) return `UNLOCKED: ${unlocked.join(' // ')}`
  return runtime['upgradeLevelDetail'](upgrade, upgrade.max)
}

export function renderWorkbenchUpgradeChip(self: WorkbenchHost, upgrade: Upgrade) {
  const runtime = workbenchRuntime(self)
  const chip = document.createElement('button')
  chip.type = 'button'
  const next = Math.min(runtime['build'][upgrade.id] + 1, upgrade.max)
  const weaponPreview = choiceWeaponPreview(workbenchWeaponPreviewRuntime(self), { kind: 'upgrade', upgrade })
  chip.className = `manifest-chip available workbench-install-choice offer-ready ${upgrade.bucket}`
  chip.addEventListener('click', () => beginWorkbenchInstall(self, { kind: 'upgrade', upgrade }, chip))
  chip.innerHTML = `
    <i class="manifest-chip-node">UP</i>
    <div class="manifest-chip-head">
      <strong>${runtime['escape'](upgrade.name)}</strong>
      <b>${runtime['build'][upgrade.id]}/${upgrade.max}</b>
    </div>
    <span>${runtime['escape'](`INSTALL RANK ${next}/${upgrade.max} // ${runtime['upgradeLevelDetail'](upgrade, next)}`)}</span>
    ${weaponPreview ? `<small class="workbench-weapon-preview">${runtime['escape'](weaponPreview)}</small>` : ''}
    <em>${runtime['bucketLabel'](upgrade.bucket)}</em>
  `
  return chip
}

export function renderWorkbenchContextChip(self: WorkbenchHost, upgrade: Upgrade, status: 'MAXED' | 'LOCKED' | 'STANDBY', detail: string, extraClass = '') {
  const runtime = workbenchRuntime(self)
  const level = runtime['build'][upgrade.id]
  const chip = document.createElement('div')
  chip.className = `manifest-chip ${level > 0 ? 'owned' : 'unowned'} status-${status.toLowerCase()} ${status === 'LOCKED' ? 'locked future' : ''} ${status === 'MAXED' ? 'maxed' : ''} ${extraClass} ${upgrade.bucket}`
  chip.innerHTML = `
    <i class="manifest-chip-node">${runtime['escape'](status)}</i>
    <div class="manifest-chip-head">
      <strong>${runtime['escape'](upgrade.name)}</strong>
      <b>${level}/${upgrade.max}</b>
    </div>
    <span>${runtime['escape'](`${status} // ${detail}`)}</span>
    <em>${runtime['bucketLabel'](upgrade.bucket)}</em>
  `
  return chip
}

export function renderWorkbenchBayToggle(
  self: WorkbenchHost,
  bay: WorkbenchBayDefinition,
  rows: Array<WorkbenchUpgradeRow<Upgrade>>,
  offeredUpgradeChoices: Map<UpgradeId, WorkbenchChoice>
) {
  const runtime = workbenchRuntime(self)
  const bayRows = rows.filter((row) => bay.upgradeIds.includes(row.upgrade.id))
  const totalRanks = bayRows.reduce((sum, row) => sum + row.upgrade.max, 0)
  const ownedRanks = bayRows.reduce((sum, row) => sum + Math.min(runtime['build'][row.upgrade.id], row.upgrade.max), 0)
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
  button.className = `workbench-bay-toggle ${runtime['expandedWorkbenchBay'] === bay.id ? 'active' : ''} ${upgradeableCount > 0 ? 'has-offer' : ''} ${lockedCount === bayRows.length ? 'locked' : ''}`.trim()
  button.setAttribute('aria-controls', `workbench-bay-${bay.id}-panel`)
  button.setAttribute('aria-expanded', String(runtime['expandedWorkbenchBay'] === bay.id))
  button.addEventListener('click', () => {
    const scrollTop = currentLevelUpScrollTop(self)
    if (runtime['expandedWorkbenchBay'] === bay.id) {
      runtime['expandedWorkbenchBay'] = null
    } else {
      runtime['selectedWorkbenchBay'] = bay.id
      runtime['expandedWorkbenchBay'] = bay.id
    }
    renderLevelUp(self, runtime['levelUpTitle'], runtime['levelUpCopy'])
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
    <i class="workbench-bay-code">${runtime['escape'](bay.shortLabel.slice(0, 3).toUpperCase())}</i>
    <div class="workbench-bay-copy">
      <div class="workbench-bay-topline">
        <strong>${runtime['escape'](bay.label)}</strong>
        <b>${ownedRanks}/${totalRanks}</b>
      </div>
      <span>${runtime['escape'](nextStatus)}</span>
      <div class="workbench-bay-meter"><i style="width: ${Math.round(progress * 100)}%"></i></div>
      <em>${maxedCount}/${bayRows.length} maxed${lockedCount > 0 ? ` // ${lockedCount} locked` : ''}${upgradeableCount > 0 ? ` // ${upgradeableCount} ready` : ''}</em>
    </div>
  `
  return button
}

export function renderWorkbenchBayEntry(
  self: WorkbenchHost,
  bay: WorkbenchBayDefinition,
  rows: Array<WorkbenchUpgradeRow<Upgrade>>,
  offeredUpgradeChoices: Map<UpgradeId, WorkbenchChoice>
) {
  const runtime = workbenchRuntime(self)
  const entry = document.createElement('div')
  entry.className = `workbench-bay-entry ${runtime['expandedWorkbenchBay'] === bay.id ? 'expanded' : ''}`
  entry.append(renderWorkbenchBayToggle(self, bay, rows, offeredUpgradeChoices))
  if (runtime['expandedWorkbenchBay'] === bay.id) entry.append(renderWorkbenchBayDetail(self, bay, rows, offeredUpgradeChoices))
  return entry
}

export function renderWorkbenchBayDetail(
  self: WorkbenchHost,
  bay: WorkbenchBayDefinition,
  rows: Array<WorkbenchUpgradeRow<Upgrade>>,
  offeredUpgradeChoices: Map<UpgradeId, WorkbenchChoice>
) {
  const runtime = workbenchRuntime(self)
  const detail = document.createElement('div')
  detail.className = 'workbench-bay-detail'
  detail.id = `workbench-bay-${bay.id}-panel`
  detail.setAttribute('role', 'region')
  detail.setAttribute('aria-labelledby', `workbench-bay-${bay.id}-toggle`)
  const head = document.createElement('div')
  head.className = 'workbench-bay-detail-head'
  head.innerHTML = `<div><b>${runtime['escape'](bay.label)}</b><span>${runtime['escape'](bay.summary)}</span></div><em>${runtime['escape'](bay.shortLabel.toUpperCase())} DATABASE</em>`
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

export function renderWorkbenchInstallSurface(self: WorkbenchHost) {
  const runtime = workbenchRuntime(self)
  const wrap = document.createElement('div')
  wrap.className = 'build-manifest workbench'
  const title = document.createElement('div')
  title.className = 'manifest-title'
  title.innerHTML = '<b>SHIP WORKBENCH</b><span>open a bay // spend signals on unlocked systems</span>'
  const offeredUpgradeChoices = new Map<UpgradeId, WorkbenchChoice>()
  if (!workbenchBayDefinitions.some((bay) => bay.id === runtime['selectedWorkbenchBay'])) runtime['selectedWorkbenchBay'] = 'weapons'
  if (runtime['expandedWorkbenchBay'] && !workbenchBayDefinitions.some((bay) => bay.id === runtime['expandedWorkbenchBay'])) runtime['expandedWorkbenchBay'] = null

  const rows = workbenchUpgradeRows(upgrades, runtime['build'], [], workbenchExtraUnlockedIds(self))
  for (const row of workbenchTopReadyRows(self, rows)) offeredUpgradeChoices.set(row.upgrade.id, { kind: 'upgrade', upgrade: row.upgrade })

  const bayShell = document.createElement('div')
  bayShell.className = 'workbench-bay-shell'
  const bayList = document.createElement('div')
  bayList.className = 'workbench-bay-list'
  for (const bay of workbenchBayDefinitions) bayList.append(renderWorkbenchBayEntry(self, bay, rows, offeredUpgradeChoices))
  bayShell.append(bayList)

  wrap.append(
    title,
    renderManifestSummary(self),
    renderWorkbenchSignalBriefing(self, rows),
    workbenchSectionLabel(self, 'SYSTEM BAYS'),
    bayShell
  )

  wrap.append(renderManifestRelicLine(self))
  return wrap
}
