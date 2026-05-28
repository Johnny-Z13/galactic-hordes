import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { orderArtifactArchiveCards } from '../src/artifact-archive'
import { collectionCatalog, collectionCatalogById, collectionIconAtlasColumns, collectionIconAtlasRows } from '../src/collection-catalog'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const optionalSource = (path: string) => {
  try {
    return readFileSync(resolve(process.cwd(), path), 'utf8')
  } catch {
    return ''
  }
}
const screensSource = () => optionalSource('src/ui/screens.ts')
const frontSubscreensSource = () => readFileSync(resolve(process.cwd(), 'src/ui/front-subscreens.ts'), 'utf8')
const titleSource = () => readFileSync(resolve(process.cwd(), 'src/ui/title-screen.ts'), 'utf8')
const workbenchSource = () => readFileSync(resolve(process.cwd(), 'src/ui/workbench.ts'), 'utf8')
const collectionSource = () => readFileSync(resolve(process.cwd(), 'src/ui/collection.ts'), 'utf8')
const mothershipSource = () => readFileSync(resolve(process.cwd(), 'src/ui/mothership-console.ts'), 'utf8')
const scoresSource = () => readFileSync(resolve(process.cwd(), 'src/ui/scores.ts'), 'utf8')
const styles = () => readFileSync(resolve(process.cwd(), 'src/style.css'), 'utf8')

test('shipboard workbench keeps discoveries in the front end collection', () => {
  const main = source()
  const front = frontSubscreensSource()
  const title = titleSource()

  expect(main).not.toContain('type WorkbenchView')
  expect(main).not.toContain("artifactsTab.textContent = 'Artifacts'")
  expect(main).not.toContain('this.workbenchView')
  expect(title).toContain("collection.textContent = 'Collection'")
  expect(main).toContain("import { showCollection as uiShowCollection, showPowerUps as uiShowPowerUps } from './ui/front-subscreens'")
  expect(main).toContain('private showCollection(options: { scrollTop?: number } = {})')
  expect(main).toContain('uiShowCollection(this, options)')
  expect(main).not.toContain('private renderCollectionScreen()')
  expect(front).toContain('export function showCollection(self: VectorShooter')
  expect(front).toContain('renderCollectionScreen(self)')
})

test('title screen rendering lives in a focused ui module', () => {
  const main = source()
  const title = titleSource()

  expect(main).toContain("import { showTitle as uiShowTitle } from './ui/title-screen'")
  expect(main).toContain('private showTitle() {')
  expect(main).toContain('uiShowTitle(this)')
  expect(main).not.toContain("import titleLogoMarkUrl from './assets/title-logo-mark.png'")
  expect(main).not.toContain("wordmark.innerHTML = '<span>GALACTIC</span><span>HORDES</span>'")
  expect(title).toContain("import titleLogoMarkUrl from '../assets/title-logo-mark.png'")
  expect(title).toContain('export function showTitle(self: VectorShooter)')
  expect(title).toContain("self['state'] = 'title'")
  expect(title).toContain("quit.textContent = 'Quit'")
  expect(title).toContain("start.textContent = 'Launch Expedition'")
  expect(title).toContain("self['showMothership']()")
  expect(title).toContain("self['showOnly']('title')")
})

test('title launch action has a full-width primary row', () => {
  const css = readFileSync('src/style.css', 'utf8')

  expect(css).toContain('"start start start"')
})

test('screen shell construction lives in a focused ui module', () => {
  const main = source()
  const screens = screensSource()

  expect(main).toContain("import { makeScreens as uiMakeScreens, showOnly as uiShowOnly } from './ui/screens'")
  expect(main).toContain('uiMakeScreens(this)')
  expect(main).not.toContain('const screenList = [this.ui.title')
  expect(screens).toContain('export function makeScreens(self: VectorShooter)')
  expect(screens).toContain('const screenList = [')
  expect(screens).toContain("self['ui'].title")
  expect(screens).toContain("self['ui'].gameover.className = 'screen gameover-screen'")
  expect(main).toContain('private showOnly(which: GameState | null) {')
  expect(main).toContain('uiShowOnly(this, which)')
  expect(main).not.toContain('const screens: Partial<Record<GameState, HTMLElement>> = {')
  expect(screens).toContain('export function showOnly(self: VectorShooter, which: GameState | null)')
  expect(screens).toContain('const screens: Partial<Record<GameState, HTMLElement>> = {')
  expect(screens).toContain("el?.classList.toggle('visible', name === which)")
})

test('shipboard workbench installs directly from bay detail', () => {
  const main = source()
  const workbench = workbenchSource()
  const css = styles()

  expect(main).not.toContain("type WorkbenchView = 'upgrades' | 'manifest'")
  expect(main).not.toContain("upgradesTab.textContent = 'Upgrades'")
  expect(main).not.toContain("manifestTab.textContent = 'Manifest'")
  expect(workbench).toContain("view.append(renderWorkbenchInstallSurface(self))")
  expect(workbench).toContain("workbenchUpgradeRows(upgrades, self['build']")
  expect(workbench).toContain("bayShell.className = 'workbench-bay-shell'")
  expect(workbench).toContain("bayList.className = 'workbench-bay-list'")
  expect(workbench).toContain("detail.className = 'workbench-bay-detail'")
  expect(workbench).toContain("workbenchSectionLabel(self, 'SYSTEM BAYS')")
  expect(workbench).toContain("row.status === 'maxed'")
  expect(workbench).toContain("row.status === 'locked'")
  expect(workbench).toContain("renderWorkbenchContextChip(self, row.upgrade, 'STANDBY'")
  expect(workbench).toContain('renderWorkbenchUpgradeChip(self, row.upgrade)')
  expect(workbench).toContain('workbenchBayBalanceGate(self, row.upgrade)')
  expect(workbench).toContain('status-${status.toLowerCase()}')
  expect(workbench).toContain("lockedCount === bayRows.length ? 'locked' : ''")
  expect(workbench).toContain('workbench-install-choice')
  expect(workbench).toContain("beginWorkbenchInstall(self, { kind: 'upgrade', upgrade }, chip)")
  expect(main).not.toContain('button.disabled = !available')
  expect(css).toContain('.workbench-section-label')
  expect(css).toContain('.workbench-bay-toggle')
  expect(css).toContain('.workbench-bay-detail')
  expect(css).toContain('.manifest-chip.available')
  expect(css).toContain('.manifest-chip.future')
  expect(css).toContain('.manifest-chip.standby')
  expect(css).toContain('.manifest-chip.selected')
})

test('shipboard workbench preserves scroll position across installs', () => {
  const main = source()
  const workbench = workbenchSource()

  expect(main).toContain('private currentLevelUpScrollTop()')
  expect(workbench).toContain("self['ui'].levelup.querySelector<HTMLElement>('.workbench-panel')")
  expect(workbench).toContain("self['ui'].levelup.querySelector<HTMLElement>('.workbench-view')")
  expect(workbench).toContain('return Math.max(panel?.scrollTop ?? 0, view?.scrollTop ?? 0)')
  expect(main).toContain('private restoreLevelUpScroll(scrollTop: number)')
  expect(workbench).toContain('if (panel) panel.scrollTop = scrollTop')
  expect(workbench).toContain('if (view) view.scrollTop = scrollTop')
  expect(main).toContain('const scrollTop = this.currentLevelUpScrollTop()')
  expect(main).toContain('this.restoreLevelUpScroll(scrollTop)')
})

test('shipboard workbench can be skipped without spending every signal', () => {
  const workbench = workbenchSource()
  const css = styles()

  expect(workbench).toContain('actions.append(...renderWorkbenchExitActions(self))')
  expect(workbench).toContain('export function workbenchContinueLabel(self: VectorShooter)')
  expect(workbench).toContain("if (self['takeoffAfterWorkbench']) return 'Launch Now'")
  expect(workbench).toContain("if (self['returnToSectorMapAfterWorkbench']) return 'Route Map'")
  expect(workbench).toContain("return 'Resume Flight'")
  expect(workbench).toContain('export function continueFromWorkbench(self: VectorShooter)')
  expect(workbench).toContain("self['startTakeoff']({ skipWorkbench: true })")
  expect(workbench).toContain("self['leaveStationForSectorMap']()")
  expect(workbench).toContain('export function backFromWorkbench(self: VectorShooter)')
  expect(workbench).toContain("if (self['returnToSectorMapAfterWorkbench'] && self['stationDockReport'])")
  expect(workbench).toContain("self['state'] = 'surface'")
  expect(workbench).toContain("self['pendingUpgrades'] = Math.max(0, self['pendingUpgrades'] - 1)")
  expect(css).toContain('.workbench-command.primary')
  expect(css).toContain('.workbench-command.secondary')
})

test('front end integrates standalone collection and power up screens', () => {
  const main = source()
  const front = frontSubscreensSource()
  const title = titleSource()
  const css = styles()

  expect(main).toContain("type GameState = 'title' | 'mothership' | 'collection' | 'powerups'")
  expect(title).toContain("collection.textContent = 'Collection'")
  expect(title).toContain("powerups.textContent = 'Power Up'")
  expect(front).toContain("self['ui'].collection.className = 'screen collection-route-screen'")
  expect(front).toContain("self['ui'].powerups.className = 'screen powerups-route-screen'")
  expect(front).toContain('shell.append(header, renderCollectionScreen(self))')
  expect(front).toContain('shell.append(header, renderMothershipMetaSystems(self))')
  expect(main).toContain('uiShowPowerUps(this, options)')
  expect(main).toContain("type MothershipConsoleView = 'workbench' | 'manifest'")
  expect(main).toContain("type MothershipCollectionFilter = 'all' | 'found' | 'locked' | ArtifactKind")
  expect(collectionSource()).toContain('collectionCards(self)')
  expect(collectionSource()).toContain('collectionCatalog.length')
  expect(main).toContain("const MOTHERSHIP_STORAGE_KEY = 'galactic_hordes_mothership_v2'")
  expect(main).not.toContain('private showMothershipConsole')
  expect(css).toContain('font-family: "Rajdhani", "Oxanium"')
  expect(css).toContain('.collection-route-screen')
  expect(css).toContain('.powerups-route-screen')
  expect(css).toContain('.front-subscreen-head')
  expect(css).toContain('.collection-controls')
  expect(css).toContain('.collection-filter-panel')
  expect(css).toContain('.collection-filter-chip.active')
  expect(css).toContain('clip-path: polygon(0 0, calc(100% - 16px) 0')
})

test('desktop mothership shows route map alongside launch controls', () => {
  const mothership = mothershipSource()
  const css = styles()

  expect(mothership).toContain("launchStack.className = 'mothership-launch-stack'")
  expect(mothership).toContain("status.className = 'mothership-launch-meters'")
  expect(mothership).toContain('shipBay.append(ship, launch, status)')
  expect(mothership).toContain('launchStack.append(shipBay)')
  expect(mothership).toContain('launchStack.append(renderMothershipRoutePreview(self))')
  expect(mothership).toContain('renderFirstMothershipBriefing(self)')
  expect(mothership).toContain('flight.append(launchStack)')
  expect(mothership).toContain('export function renderMothershipRoutePreview(self: VectorShooter)')
  expect(css).toContain('.mothership-launch-stack')
  expect(css).toContain('grid-template-areas:')
  expect(css).toContain('.mothership-route-preview')
  expect(css).toContain('.mothership-route-map')
  expect(css).toContain('.mothership-launch-meters')
  expect(css).toContain('.mothership-first-briefing')
})

test('first mothership visit keeps command systems out of the launch deck', () => {
  const main = source()
  const front = frontSubscreensSource()
  const mothership = mothershipSource()
  const title = titleSource()

  expect(mothership).toContain('shell.append(header, flight)')
  expect(mothership).not.toContain('shell.append(header, flight, systemsHeader, renderMothershipMetaSystems(self))')
  expect(title).toContain("powerups.textContent = 'Power Up'")
  expect(main).toContain('private showPowerUps(options: { scrollTop?: number } = {})')
  expect(front).toContain('front-subscreen powerups-subscreen')
})

test('mothership permanent upgrades render as selected command departments', () => {
  const mothership = mothershipSource()
  const css = styles()

  expect(mothership).toContain('export function renderMothershipMetaSystems(self: VectorShooter)')
  expect(mothership).toContain("window.className = 'permanent-upgrades-window meta-upgrade-window'")
  expect(mothership).toContain("rail.className = 'meta-upgrade-rail'")
  expect(mothership).toContain("button.className = `meta-department-toggle")
  expect(mothership).toContain("detail.className = `meta-upgrade-detail")
  expect(mothership).toContain('Locked system. Unlock by completing')
  expect(mothership).toContain("button.textContent = unlocked ? next ? 'Authorize Upgrade' : 'Fully Online' : 'Locked'")
  expect(mothership).toContain("ladder.className = 'meta-tier-ladder'")
  expect(mothership).toContain("meter.className = 'station-tier-meter'")
  expect(mothership).toContain("fill.className = 'station-tier-fill'")
  expect(mothership).toContain("fill.style.width = `${tierPct * 100}%`")
  expect(mothership).toContain('Authorize Upgrade')
  expect(css).toContain('.permanent-upgrades-window')
  expect(css).toContain('.meta-department-toggle')
  expect(css).toContain('.meta-department-toggle.locked::before')
  expect(css).toContain('.manifest-chip.status-locked::before')
  expect(css).toContain('.meta-upgrade-detail')
  expect(css).toContain('.meta-tier-ladder')
  expect(css).toContain('.station-tier-fill')
})

test('mothership department upgrades preserve command scroll position', () => {
  const main = source()

  const mothership = mothershipSource()

  expect(main).toContain('private showMothership(options: { scrollTop?: number } = {})')
  expect(mothership).toContain("self['ui'].title.querySelector<HTMLElement>('.mothership-command')?.scrollTop")
  expect(mothership).toContain('showMothership(self, { scrollTop })')
  expect(mothership).toContain('requestAnimationFrame(restoreScroll)')
})

test('artifacts track relics aliens lore and planet finds with generated icons', () => {
  const main = source()
  const css = styles()

  expect(main).toContain("import collectionIconAtlasUrl from './assets/collection-icon-atlas.png'")
  expect(main).toContain('interface ArtifactRecord')
  expect(main).toContain('private artifacts = new Map<string, ArtifactRecord>()')
  expect(main).toContain('this.recordArtifact(')
  expect(collectionSource()).toContain('export function artifactIcon(self: VectorShooter')
  expect(collectionSource()).toContain('export function collectionIcon(self: VectorShooter')
  expect(css).toContain('.artifact-icon')
  expect(css).toContain('.artifact-grid')
  expect(css).toContain('.collection-icon-grid')
  expect(css).toContain('.collection-detail')
})

test('collection and artifact icons are constrained to square boxes', () => {
  const css = styles()

  expect(css).toContain('.collection-icon {')
  expect(css).toContain('aspect-ratio: 1 / 1')
  expect(css).toContain('background-origin: border-box')
  expect(css).toContain('.collection-detail-icon {')
  expect(css).toContain('.artifact-icon {')
})

test('collection catalog only contains real discoverable game records', () => {
  const iconSet = new Set(collectionCatalog.map((entry) => entry.icon))

  expect(collectionCatalog.length).toBeGreaterThan(30)
  expect(collectionCatalog.some((entry) => entry.id === 'enemy:space:chaser')).toBe(true)
  expect(collectionCatalog.some((entry) => entry.id === 'enemy:surface:oracle')).toBe(true)
  expect(collectionCatalog.some((entry) => entry.id === 'relic:staticIdol')).toBe(true)
  expect(collectionCatalog.some((entry) => entry.id === 'alien:the-beacon-widow')).toBe(true)
  expect(collectionCatalog.some((entry) => entry.id.startsWith('locked:'))).toBe(false)
  expect(iconSet.size).toBe(collectionCatalog.length)
  expect(Math.max(...iconSet)).toBeLessThan(collectionIconAtlasColumns * collectionIconAtlasRows)
  expect(collectionCatalogById.size).toBe(collectionCatalog.length)
})

test('collection atlas has enough unique cells for every catalog entry', () => {
  const atlas = readFileSync(resolve(process.cwd(), 'src/assets/collection-icon-atlas.png'))
  expect(atlas.toString('ascii', 1, 4)).toBe('PNG')
  expect(atlas.readUInt32BE(16)).toBe(collectionIconAtlasColumns * 96)
  expect(atlas.readUInt32BE(20)).toBe(collectionIconAtlasRows * 96)
  expect(collectionSource()).toContain('collectionIconAtlasColumns')
  expect(collectionSource()).toContain('collectionIconAtlasRows')
  expect(collectionSource()).toContain('icon.style.backgroundSize')
})

test('collection screen supports Vampire Survivors style category filters and detail footer', () => {
  const collection = collectionSource()
  const css = styles()

  expect(collection).toContain("collectionFilterButton(self, 'all')")
  expect(collection).toContain("collectionFilterButton(self, 'enemy')")
  expect(collection).toContain("collectionFilterButton(self, 'planet')")
  expect(collection).toContain("if (self['mothershipCollectionFilter'] !== 'all')")
  expect(collection).toContain('export function collectionKindLabel')
  expect(collection).toContain("selected.locked ? 'LOCKED' : 'DISCOVERED'")
  expect(css).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))')
  expect(css).toContain('.collection-detail small')
})

test('collection screen uses canonical catalog icons for found records', () => {
  const main = source()

  expect(main).toContain('collectionCatalogById.get(record.id)')
  expect(main).toContain('icon: collectionEntry.icon')
  expect(collectionSource()).toContain('icon: entry.icon')
  expect(collectionSource()).toContain('color: entry.color')
})

test('artifact archive lists found cards before locked unknowns', () => {
  const ordered = orderArtifactArchiveCards([
    { locked: true, record: { title: 'Unknown Relic' } },
    { locked: false, record: { title: 'Found Cache' } },
    { locked: false, record: { title: 'Found Planet' } },
    { locked: true, record: { title: 'Missing Relic' } }
  ])

  expect(ordered.map((card) => card.record.title)).toEqual([
    'Found Cache',
    'Found Planet',
    'Unknown Relic',
    'Missing Relic'
  ])
})

test('desktop workbench uses one fixed scrollable manifest panel', () => {
  const workbench = workbenchSource()
  const css = styles()

  expect(workbench).toContain("panel.className = 'panel workbench-panel'")
  expect(workbench).toContain("view.className = 'workbench-view manifest'")
  expect(css).toContain('.workbench-panel')
  expect(css).toContain('height: min(760px, calc(100vh - 54px))')
  expect(css).toContain('.workbench-view')
  expect(css).toContain('overflow-y: auto')
  expect(css).toContain('.manifest-grid,')
  expect(css).toContain('.artifact-grid {')
  expect(css).toContain('max-height: none')
})

test('workbench surfaces ready installs before deep bay inspection', () => {
  const workbench = workbenchSource()
  const css = styles()

  expect(workbench).toContain('export function workbenchReadyRows(')
  expect(workbench).toContain('export function renderWorkbenchSignalBriefing(')
  expect(workbench).toContain("briefing.className = 'workbench-signal-briefing'")
  expect(workbench).toContain("offers.className = 'manifest-grid workbench-current-offers'")
  expect(workbench).toContain('for (const row of workbenchReadyRows(self, rows).slice(0, 3))')
  expect(workbench.indexOf('renderWorkbenchSignalBriefing(self, rows)')).toBeGreaterThan(-1)
  expect(workbench.indexOf('renderWorkbenchSignalBriefing(self, rows)')).toBeLessThan(workbench.indexOf("workbenchSectionLabel(self, 'SYSTEM BAYS')"))
  expect(css).toContain('.workbench-signal-briefing')
  expect(css).toContain('.workbench-signal-briefing-head')
  expect(css).toContain('.workbench-current-offers')
})

test('mothership console controls expose clear focus disabled and tab labels', () => {
  const main = source()
  const css = styles()

  expect(mothershipSource()).toContain("button.setAttribute('aria-label', `${label}: ${meta}`)")
  expect(mothershipSource()).toContain("button.setAttribute('aria-pressed',")
  expect(css).toContain('.mothership-console-tab:focus-visible')
  expect(css).toContain('.collection-filter-chip:focus-visible')
  expect(css).toContain('.vector-button:disabled')
  expect(css).toContain('background: linear-gradient(135deg, rgba(255, 242, 122, 0.2)')
})

test('scores screen can reset persistent progress back to first play', () => {
  const main = source()
  const scores = scoresSource()
  const css = styles()

  expect(main).toContain("import { showScores as uiShowScores } from './ui/scores'")
  expect(main).toContain('private showScores() {')
  expect(main).toContain('uiShowScores(this)')
  expect(scores).toContain('export function showScores(self: VectorShooter)')
  expect(scores).toContain("reset.textContent = 'Reset Save'")
  expect(scores).toContain("reset.textContent = 'Confirm Reset'")
  expect(scores).toContain("self['resetPersistentProgress']()")
  expect(main).toContain('private resetPersistentProgress()')
  expect(main).toContain('key === STORAGE_KEY')
  expect(main).toContain('key === MOTHERSHIP_STORAGE_KEY')
  expect(main).toContain('localStorage.removeItem(key)')
  expect(main).toContain('this.mothership = defaultMothershipState()')
  expect(main).toContain('this.stats.highScore = 0')
  expect(main).toContain('this.showTitle()')
  expect(css).toContain('.vector-button.danger')
  expect(css).toContain('.vector-button.danger[data-confirm="true"]')
})

test('mobile workbench install manifest uses full width touch targets', () => {
  const css = styles()

  expect(css).toContain('.build-manifest.workbench .manifest-grid {')
  expect(css).toContain('grid-template-columns: 1fr')
  expect(css).toContain('.build-manifest.workbench .manifest-chip.available')
  expect(css).toContain('touch-action: manipulation')
  expect(css).toContain('overflow: visible')
})

test('workbench card selection does not shift card layout or shake the camera', () => {
  const main = source()
  const css = styles()
  const beginInstall = main.slice(main.indexOf('private beginWorkbenchInstall'), main.indexOf('private installCueFor'))
  const applyUpgrade = main.slice(main.indexOf('private applyUpgrade'), main.indexOf('private applyEvolution'))
  const applyEvolution = main.slice(main.indexOf('private applyEvolution'), main.indexOf('private acquireRelic'))

  expect(css).toContain('.manifest-chip.selected {')
  expect(css).toContain('transform: none')
  expect(css).toContain('animation: install-flash')
  expect(beginInstall).not.toContain('this.camera.shake')
  expect(applyUpgrade).not.toContain('this.camera.shake')
  expect(applyEvolution).not.toContain('this.camera.shake')
})

test('workbench weapon upgrades emit milestone feedback at visible breakpoints', () => {
  const main = source()
  const applyUpgrade = main.slice(main.indexOf('private applyUpgrade'), main.indexOf('private applyEvolution'))

  expect(main).toContain('weaponMilestonePulse')
  expect(applyUpgrade).toContain('weaponMilestonePulse({ upgrade, nextRank })')
  expect(applyUpgrade).toContain('this.burst(this.player.x, this.player.y, milestone.color, milestone.count, milestone.speed)')
  expect(applyUpgrade).toContain('this.toast(milestone.label)')
})

test('workbench overlays freeze the gameplay camera instead of using title drift', () => {
  const main = source()
  const update = main.slice(main.indexOf('private update(dt: number)'), main.indexOf('private audioMood'))
  const freezesGameplayCamera = main.slice(main.indexOf('private freezesGameplayCamera'), main.indexOf('private updateGameplayOverlay'))
  const updateGameplayOverlay = main.slice(main.indexOf('private updateGameplayOverlay'), main.indexOf('private audioMood'))

  expect(update).toContain('if (this.freezesGameplayCamera())')
  expect(update).toContain('this.updateGameplayOverlay(dt)')
  expect(update).toContain('this.drawTitleDrift(dt)')
  expect(update.indexOf('this.updateGameplayOverlay(dt)')).toBeLessThan(update.indexOf('this.drawTitleDrift(dt)'))
  expect(freezesGameplayCamera).toContain("this.state === 'levelup'")
  expect(freezesGameplayCamera).toContain("this.state === 'planet'")
  expect(freezesGameplayCamera).toContain("this.state === 'paused'")
  expect(updateGameplayOverlay).not.toContain('this.camera.x')
  expect(updateGameplayOverlay).not.toContain('this.camera.y')
  expect(updateGameplayOverlay).not.toContain('this.stats.time += dt * 0.08')
})

test('workbench install refresh keeps the current bay set and scroll position', () => {
  const main = source()
  const applyChoice = main.slice(main.indexOf('private applyWorkbenchChoice'), main.indexOf('private applyUpgrade'))
  const recycleSignal = main.slice(main.indexOf('private recycleWorkbenchSignal'), main.indexOf('private beginWorkbenchInstall'))
  const beginInstall = main.slice(main.indexOf('private beginWorkbenchInstall'), main.indexOf('private installCueFor'))

  expect(main).toContain('private refreshLevelUp(')
  expect(main).toContain('const scrollTop = this.currentLevelUpScrollTop()')
  expect(main).toContain('this.restoreLevelUpScroll(scrollTop)')
  expect(applyChoice).not.toContain('this.openLevelUp(')
  expect(recycleSignal).not.toContain('this.openLevelUp(')
  expect(beginInstall).not.toContain('this.upgradeChoices = this.rollUpgrades')
})

test('planet discoveries unlock the first spacesuit workbench path', () => {
  const main = source()

  expect(main).toContain('firstOpportunityUpgrade')
  expect(main).toContain('private discoverySuitOffer = false')
  expect(main).toContain("this.discoverySuitOffer = true")
  expect(main).toContain("firstOpportunityUpgrade(upgrades, this.build, 'suitO2')")
  expect(main).toContain('uiWorkbenchExtraUnlockedIds(this)')
  expect(main).toContain("choice.upgrade.bucket === 'spacesuit'")
})
