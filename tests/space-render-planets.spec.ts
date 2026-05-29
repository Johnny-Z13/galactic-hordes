import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('space planet rendering lives in a focused render module', () => {
  const renderer = source('src/render/space-planets.ts')
  const main = source('src/main.ts')

  expect(renderer).toContain('export function renderSpacePlanets')
  expect(renderer).toContain('SpacePlanetRenderView')
  expect(renderer).toContain("from '../planet-biomes'")
  expect(renderer).toContain('biome.surfaceMotif')
  expect(renderer).toContain('fillText(planet.name')
  expect(main).toContain("import { renderSpacePlanets as drawSpacePlanets } from './render/space-planets'")
  expect(main).toContain('drawSpacePlanets({')
  expect(main).not.toContain('private renderPlanets(')
})
