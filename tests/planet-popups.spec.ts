import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const optionalSource = (path: string) => {
  try {
    return readFileSync(resolve(process.cwd(), path), 'utf8')
  } catch {
    return ''
  }
}
const planetScreenSource = () => optionalSource('src/ui/planet-screen.ts')
const styles = () => readFileSync(resolve(process.cwd(), 'src/style.css'), 'utf8')

test('planet popups center their copy and action buttons', () => {
  const main = source()
  const planet = planetScreenSource()
  const css = styles()

  const planetPanelCount = (main.match(/panel\.className = 'panel planet-panel'/g)?.length ?? 0) + (planet.match(/panel\.className = 'panel planet-panel'/g)?.length ?? 0)
  expect(planetPanelCount).toBe(3)
  expect(main).toContain("import { renderPlanet as uiRenderPlanet } from './ui/planet-screen'")
  expect(main).toContain('private renderPlanet(p: Planet) {')
  expect(main).toContain('uiRenderPlanet(this, p)')
  expect(main).not.toContain("land.textContent = p.visited ? 'Dock' : 'Land and Salvage'")
  expect(planet).toContain('export function renderPlanet(self: VectorShooter, p: Planet)')
  expect(planet).toContain("land.textContent = p.visited ? 'Dock' : 'Land and Salvage'")
  expect(planet).toContain("land.addEventListener('click', () => self['confirmLanding']())")
  expect(planet).toContain("self['showOnly']('planet')")
  expect(css).toContain('.planet-panel')
  expect(css).toContain('justify-items: center')
  expect(css).toContain('.planet-panel .button-row')
  expect(css).toContain('justify-content: center')
})
