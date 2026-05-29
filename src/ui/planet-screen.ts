import type { GameState } from '../game-states'
import type { GeneratedPlanet } from '../planet-generation'

type Planet = GeneratedPlanet

interface PlanetScreenView extends Object {}

interface PlanetScreenRuntime {
  ui: {
    planet: HTMLElement
  }
  mothership: {
    departments: {
      scanner: number
    }
  }
  state: GameState
  confirmLanding(): void
  showOnly(which: GameState | null): void
}

function planetRuntime(self: PlanetScreenView) {
  return self as PlanetScreenRuntime
}

export function renderPlanet(self: PlanetScreenView, p: Planet) {
  const runtime = planetRuntime(self)
  runtime.ui.planet.innerHTML = ''
  const panel = document.createElement('div')
  panel.className = 'panel planet-panel'
  const h = document.createElement('h1')
  h.className = 'title'
  h.textContent = p.name
  const copy = document.createElement('p')
  copy.className = 'copy'
  const scanner = runtime.mothership.departments.scanner
  const risk = planetRiskLabel(p)
  copy.textContent = p.visited
    ? `${p.biome.label}. The dock remembers you. It offers a small repair and a moment of quiet.`
    : scanner >= 3
      ? `${p.biome.label}. ${p.reward} Risk: ${risk}.`
      : scanner >= 1
        ? `${p.biome.label.toUpperCase()} // ${p.archetype.toUpperCase()} SIGNAL // ${p.reward}`
        : `${p.biome.label}. ${p.reward}`
  const row = document.createElement('div')
  row.className = 'button-row'
  const land = document.createElement('button')
  land.className = 'vector-button'
  land.textContent = p.visited ? 'Dock' : 'Land and Salvage'
  land.addEventListener('click', () => runtime.confirmLanding())
  const leave = document.createElement('button')
  leave.className = 'vector-button secondary'
  leave.textContent = 'Break Orbit'
  leave.addEventListener('click', () => {
    runtime.state = 'playing'
    runtime.showOnly(null)
  })
  row.append(land, leave)
  panel.append(h, copy, row)
  runtime.ui.planet.append(panel)
  runtime.showOnly('planet')
}

function planetRiskLabel(p: Planet) {
  if (p.archetype === 'horde') return 'EXTREME'
  if (p.archetype === 'hostile' || p.archetype === 'strange') return 'HOSTILE'
  if (p.archetype === 'relic' || p.archetype === 'cache') return 'UNSTABLE'
  return 'QUIET'
}
