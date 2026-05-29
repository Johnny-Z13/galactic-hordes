import type { GameState } from '../game-states'
import { renderCollectionScreen } from './collection'
import { renderMothershipMetaSystems } from './mothership-console'

interface FrontSubscreenView extends Object {}

type CollectionRendererView = Parameters<typeof renderCollectionScreen>[0]
type MothershipMetaRendererView = Parameters<typeof renderMothershipMetaSystems>[0]

interface FrontSubscreenRuntime {
  state: GameState
  ui: {
    collection: HTMLElement
    powerups: HTMLElement
  }
  mothership: {
    archive: {
      records: Record<string, unknown>
    }
    resources: {
      scrap: number
      crystal: number
      cores: number
    }
  }
  showTitle(): void
  showOnly(which: GameState): void
  restoreFrontScreenScroll(screen: 'collection' | 'powerups', scrollTop?: number): void
}

function frontSubscreenRuntime(self: FrontSubscreenView) {
  return self as FrontSubscreenRuntime
}

export function showCollection(self: FrontSubscreenView & CollectionRendererView, options: { scrollTop?: number } = {}) {
  const runtime = frontSubscreenRuntime(self)
  runtime.state = 'collection'
  runtime.ui.collection.innerHTML = ''
  runtime.ui.collection.className = 'screen collection-route-screen'
  const shell = document.createElement('div')
  shell.className = 'front-subscreen collection-subscreen'
  const header = document.createElement('header')
  header.className = 'front-subscreen-head'
  header.innerHTML = `
      <div><span>RELICS / COLLECTION</span><h1>ARCHIVE</h1></div>
      <p>${Object.keys(runtime.mothership.archive.records).length} recovered records stored in mothership memory.</p>
    `
  const back = document.createElement('button')
  back.className = 'vector-button secondary'
  back.type = 'button'
  back.textContent = 'Back'
  back.addEventListener('click', () => runtime.showTitle())
  header.append(back)
  shell.append(header, renderCollectionScreen(self))
  runtime.ui.collection.append(shell)
  runtime.showOnly('collection')
  runtime.restoreFrontScreenScroll('collection', options.scrollTop)
}

export function showPowerUps(self: FrontSubscreenView & MothershipMetaRendererView, options: { scrollTop?: number } = {}) {
  const runtime = frontSubscreenRuntime(self)
  runtime.state = 'powerups'
  runtime.ui.powerups.innerHTML = ''
  runtime.ui.powerups.className = 'screen powerups-route-screen'
  const shell = document.createElement('div')
  shell.className = 'front-subscreen powerups-subscreen'
  const header = document.createElement('header')
  header.className = 'front-subscreen-head'
  header.innerHTML = `
      <div><span>POWER UP</span><h1>META SYSTEMS</h1></div>
      <p>Spend recovered cargo on permanent mothership departments before launching.</p>
    `
  const resources = document.createElement('div')
  resources.className = 'mothership-resources front-subscreen-resources'
  resources.innerHTML = `
      <span><b>Scrap</b>${runtime.mothership.resources.scrap}</span>
      <span><b>Crystals</b>${runtime.mothership.resources.crystal}</span>
      <span><b>Cores</b>${runtime.mothership.resources.cores}</span>
    `
  const back = document.createElement('button')
  back.className = 'vector-button secondary'
  back.type = 'button'
  back.textContent = 'Back'
  back.addEventListener('click', () => runtime.showTitle())
  header.append(resources, back)
  shell.append(header, renderMothershipMetaSystems(self))
  runtime.ui.powerups.append(shell)
  runtime.showOnly('powerups')
  runtime.restoreFrontScreenScroll('powerups', options.scrollTop)
}
