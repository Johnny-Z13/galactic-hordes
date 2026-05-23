import { expect, test } from '@playwright/test'
import {
  availableSectorChoices,
  completeSectorNode,
  createSectorMap,
  sectorNodeRunProfile,
  selectSectorNode
} from '../src/sector-map'
import { spaceEncounterWeights } from '../src/space-encounters'

test('sector map starts at the mothership and ends at a final node', () => {
  const map = createSectorMap(42)
  const start = map.nodes.find((node) => node.kind === 'mothership')
  const final = map.nodes.find((node) => node.kind === 'final')

  expect(start).toMatchObject({ id: 'mothership', column: 0, completed: true })
  expect(final?.column).toBe(map.columns - 1)
  expect(final?.label).toContain('LAST STAND')
  expect(map.currentNodeId).toBe('mothership')
})

test('sector nodes carry readable run configs for pace waves hazards and objectives', () => {
  const map = createSectorMap(42)
  const playableNodes = map.nodes.filter((node) => node.kind !== 'mothership')

  expect(playableNodes.every((node) => node.config.readout.length > 12)).toBe(true)
  expect(playableNodes.every((node) => node.config.objective.length > 12)).toBe(true)
  expect(playableNodes.every((node) => node.config.notes.length > 0)).toBe(true)
  expect(playableNodes.every((node) => node.config.hazards.length > 0)).toBe(true)
  expect(playableNodes.every((node) => node.config.planets.countMax >= node.config.planets.countMin)).toBe(true)
  expect(playableNodes.every((node) => Object.keys(node.config.enemies.bias).length > 0)).toBe(true)
  expect(playableNodes.every((node) => node.config.waves.length > 0)).toBe(true)
  expect(playableNodes.every((node) => node.config.rewards.resourceMultiplier > 0)).toBe(true)
  expect(new Set(playableNodes.map((node) => node.config.waveOrder)).size).toBeGreaterThanOrEqual(3)
  expect(new Set(playableNodes.map((node) => node.config.pace)).size).toBeGreaterThanOrEqual(3)
})

test('sector map creates connected forward routes with stations before the final gate', () => {
  const map = createSectorMap(13)
  const stationNodes = map.nodes.filter((node) => node.kind === 'station')

  expect(stationNodes.length).toBeGreaterThanOrEqual(2)
  expect(stationNodes.every((node) => node.stationServices.length > 0)).toBe(true)

  for (const edge of map.edges) {
    const from = map.nodes.find((node) => node.id === edge.from)
    const to = map.nodes.find((node) => node.id === edge.to)

    expect(from).toBeTruthy()
    expect(to).toBeTruthy()
    expect(to!.column).toBe(from!.column + 1)
  }
})

test('sector choices only include connected unvisited next nodes', () => {
  const map = createSectorMap(7)
  const choices = availableSectorChoices(map)

  expect(choices.length).toBeGreaterThanOrEqual(2)
  expect(choices.every((node) => node.column === 1)).toBe(true)

  const selected = selectSectorNode(map, choices[0].id)
  expect(selected.currentNodeId).toBe(choices[0].id)
  expect(availableSectorChoices(selected)).toEqual([])

  const completed = completeSectorNode(selected)
  expect(completed.nodes.find((node) => node.id === choices[0].id)?.completed).toBe(true)
  expect(availableSectorChoices(completed).every((node) => node.column === 2)).toBe(true)
})

test('sector node profiles provide enemy recipes planet bias and station services', () => {
  const map = createSectorMap(99)
  const hostile = map.nodes.find((node) => node.kind === 'hostile')!
  const station = map.nodes.find((node) => node.kind === 'station')!
  const final = map.nodes.find((node) => node.kind === 'final')!

  expect(sectorNodeRunProfile(hostile).enemyBias).toEqual(expect.arrayContaining(['shooter']))
  expect(sectorNodeRunProfile(hostile).spawnMultiplier).toBeGreaterThan(1)
  expect(sectorNodeRunProfile(hostile).config.enemies.startingSpawns).toEqual(expect.arrayContaining(['shooter', 'razor']))
  expect(sectorNodeRunProfile(station).stationServices).toEqual(expect.arrayContaining(['repair', 'workbench']))
  expect(sectorNodeRunProfile(station).allowsMetaUpgrades).toBe(false)
  expect(sectorNodeRunProfile(final).bossRequired).toBe(true)
  expect(sectorNodeRunProfile(final).enemyBias).toEqual(expect.arrayContaining(['cathedral']))
  expect(sectorNodeRunProfile(final).config.waves.every((wave) => wave.atSeconds > 0)).toBe(true)
})

test('planet and anomaly node configs can describe dense clusters and asteroid belts', () => {
  const sampledNodes = Array.from({ length: 30 }, (_, seed) => createSectorMap(seed + 1))
    .flatMap((candidate) => candidate.nodes)
  const planet = sampledNodes.find((node) => node.kind === 'planet')!
  const anomaly = sampledNodes.find((node) => node.config.theme === 'asteroidBelt')!

  expect(planet.config.planets.countMin).toBeGreaterThanOrEqual(3)
  expect(planet.config.planets.density).toBe('dense')
  expect(planet.config.planets.archetypeBias.cache).toBeGreaterThan(1)
  expect(anomaly.config.hazardConfig.asteroids?.density).toBeGreaterThan(1)
  expect(anomaly.config.hazardConfig.asteroids?.drift).toMatch(/slow|crosswind|chaotic/)
})

test('node configs change encounter cadence and bias asteroid or hunter events', () => {
  const map = createSectorMap(77)
  const asteroidNode = map.nodes.find((node) => node.config.hazards.includes('asteroids'))!
  const hunterNode = map.nodes.find((node) => node.config.hazards.includes('hunterWing'))!
  const station = map.nodes.find((node) => node.kind === 'station')!
  const asteroidProfile = sectorNodeRunProfile(asteroidNode)
  const hunterProfile = sectorNodeRunProfile(hunterNode)
  const stationProfile = sectorNodeRunProfile(station)

  expect(asteroidProfile.encounterBias.meteorFront).toBeGreaterThan(1)
  expect(hunterProfile.encounterBias.hunterWing).toBeGreaterThan(1)
  expect(stationProfile.encounterGapMultiplier).toBeGreaterThan(asteroidProfile.encounterGapMultiplier)

  const asteroidWeights = spaceEncounterWeights({
    time: 180,
    planetsVisited: 1,
    encounterBias: asteroidProfile.encounterBias
  })
  const hunterWeights = spaceEncounterWeights({
    time: 180,
    planetsVisited: 1,
    encounterBias: hunterProfile.encounterBias
  })

  expect(asteroidWeights.meteorFront).toBeGreaterThan(asteroidWeights.hunterWing)
  expect(hunterWeights.hunterWing).toBeGreaterThan(hunterWeights.derelictCache)
})
