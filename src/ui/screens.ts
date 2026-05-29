import type { GameState } from '../game-states'

interface ScreenShellView extends Object {}

interface ScreenElements {
  title: HTMLElement
  collection: HTMLElement
  powerups: HTMLElement
  sectorMap: HTMLElement
  station: HTMLElement
  levelup: HTMLElement
  planet: HTMLElement
  gameover: HTMLElement
  scores: HTMLElement
}

function screenUi(self: ScreenShellView) {
  return (self as { ui: ScreenElements }).ui
}

export function makeScreens(self: ScreenShellView) {
  const ui = screenUi(self)
  const wrap = document.createElement('div')
  const screenList = [
    ui.title,
    ui.collection,
    ui.powerups,
    ui.sectorMap,
    ui.station,
    ui.levelup,
    ui.planet,
    ui.gameover,
    ui.scores
  ]
  for (const screen of screenList) {
    screen.className = 'screen'
    wrap.append(screen)
  }
  ui.gameover.className = 'screen gameover-screen'
  return wrap
}

export function showOnly(self: ScreenShellView, which: GameState | null) {
  const ui = screenUi(self)
  const screens: Partial<Record<GameState, HTMLElement>> = {
    title: ui.title,
    collection: ui.collection,
    powerups: ui.powerups,
    sectorMap: ui.sectorMap,
    station: ui.station,
    levelup: ui.levelup,
    planet: ui.planet,
    gameover: ui.gameover,
    scores: ui.scores
  }
  for (const [name, el] of Object.entries(screens)) {
    el?.classList.toggle('visible', name === which)
  }
}
