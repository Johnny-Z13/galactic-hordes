import { expect, test } from '@playwright/test'
import {
  availableSectorChoices,
  completeSectorNode,
  createSectorMap,
  sectorNodeRunProfile,
  sectorNodeTemplateCatalog,
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
  expect(playableNodes.every((node) => node.config.modifiers.length > 0)).toBe(true)
  expect(playableNodes.every((node) => node.config.rewardShape.label.length > 4)).toBe(true)
  expect(playableNodes.every((node) => node.config.enemyPacket.label.length > 4)).toBe(true)
  expect(playableNodes.every((node) => node.config.encounterGapMultiplier > 0)).toBe(true)
  expect(playableNodes.every((node) => node.config.planets.countMax >= node.config.planets.countMin)).toBe(true)
  expect(playableNodes.every((node) => Object.keys(node.config.enemies.bias).length > 0)).toBe(true)
  expect(playableNodes.every((node) => node.config.waves.length > 0)).toBe(true)
  expect(playableNodes.every((node) => node.config.rewards.resourceMultiplier > 0)).toBe(true)
  expect(new Set(playableNodes.map((node) => node.config.waveOrder)).size).toBeGreaterThanOrEqual(3)
  expect(new Set(playableNodes.map((node) => node.config.pace)).size).toBeGreaterThanOrEqual(3)
})

test('sector template catalog defines distinct route identities for generation', () => {
  expect(Object.keys(sectorNodeTemplateCatalog)).toEqual(expect.arrayContaining([
    'safeDrift',
    'planetCluster',
    'asteroidBelt',
    'hunterLane',
    'derelictField',
    'nebulaAnomaly',
    'freeport',
    'bossGate',
    'finalStand'
  ]))
  expect(sectorNodeTemplateCatalog.planetCluster.rewardRole).toBe('exploration')
  expect(sectorNodeTemplateCatalog.asteroidBelt.pressureRole).toBe('high')
  expect(sectorNodeTemplateCatalog.freeport.kind).toBe('station')
})

test('sector procedural texture is seeded but changes route personality across runs', () => {
  const a = createSectorMap(2121)
  const b = createSectorMap(2121)
  const sampledNodes = Array.from({ length: 40 }, (_, seed) => createSectorMap(seed + 300))
    .flatMap((candidate) => candidate.nodes)
    .filter((node) => node.kind !== 'mothership')

  expect(a.nodes.map((node) => node.config.readout)).toEqual(b.nodes.map((node) => node.config.readout))
  expect(new Set(sampledNodes.map((node) => node.config.rewardShape.id)).size).toBeGreaterThanOrEqual(4)
  expect(new Set(sampledNodes.map((node) => node.config.enemyPacket.id)).size).toBeGreaterThanOrEqual(5)
  expect(new Set(sampledNodes.flatMap((node) => node.config.modifiers.map((modifier) => modifier.id))).size).toBeGreaterThanOrEqual(5)
  expect(sampledNodes.some((node) => node.config.readout.includes(node.config.modifiers[0].label))).toBe(true)
})

test('wave grammar gets bounded seeded jitter instead of identical route clocks', () => {
  const safeDriftFirstWaveTimes = Array.from({ length: 20 }, (_, seed) => createSectorMap(seed + 500))
    .map((map) => map.nodes.find((node) => node.column === 1 && node.config.templateId === 'safeDrift')?.config.waves[0]?.atSeconds)
    .filter((time): time is number => typeof time === 'number')

  expect(new Set(safeDriftFirstWaveTimes).size).toBeGreaterThan(3)
  expect(safeDriftFirstWaveTimes.every((time) => time >= 14 && time <= 120)).toBe(true)
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
  const sampledNodes = Array.from({ length: 30 }, (_, seed) => createSectorMap(seed + 1))
    .flatMap((candidate) => candidate.nodes)
  const hunterLane = sampledNodes.find((node) => node.config.templateId === 'hunterLane')!
  const station = map.nodes.find((node) => node.kind === 'station')!
  const final = map.nodes.find((node) => node.kind === 'final')!

  expect(sectorNodeRunProfile(hunterLane).enemyBias).toEqual(expect.arrayContaining(['shooter']))
  expect(sectorNodeRunProfile(hunterLane).spawnMultiplier).toBeGreaterThan(1)
  expect(sectorNodeRunProfile(hunterLane).config.enemies.startingSpawns).toEqual(expect.arrayContaining(['shooter', 'razor']))
  expect(sectorNodeRunProfile(station).stationServices).toEqual(expect.arrayContaining(['repair', 'workbench']))
  expect(sectorNodeRunProfile(station).allowsMetaUpgrades).toBe(false)
  expect(sectorNodeRunProfile(final).bossRequired).toBe(true)
  expect(sectorNodeRunProfile(final).enemyBias).toEqual(expect.arrayContaining(['cathedral']))
  expect(sectorNodeRunProfile(final).config.waves.every((wave) => wave.atSeconds > 0)).toBe(true)
})

test('sector generation guarantees early safety exploration anchors and late route checks', () => {
  const map = createSectorMap(123)
  const columnOneTemplates = new Set(map.nodes.filter((node) => node.column === 1).map((node) => node.config.templateId))
  const columnFourTemplates = new Set(map.nodes.filter((node) => node.column === 4).map((node) => node.config.templateId))

  expect([...columnOneTemplates]).toEqual(expect.arrayContaining(['safeDrift', 'planetCluster']))
  expect(columnOneTemplates.size).toBeGreaterThanOrEqual(3)
  expect([...columnFourTemplates]).toEqual(expect.arrayContaining(['bossGate', 'freeport']))
  expect(columnFourTemplates.size).toBeGreaterThanOrEqual(3)
})

test('node depth increases pressure and reward readability deeper into the route', () => {
  const map = createSectorMap(123)
  const early = map.nodes.find((node) => node.column === 1 && node.config.templateId === 'safeDrift')!
  const late = map.nodes.find((node) => node.column === 4 && node.config.templateId === 'bossGate')!

  expect(early.config.depth).toBeLessThan(late.config.depth)
  expect(early.config.rewards.resourceMultiplier).toBeLessThan(late.config.rewards.resourceMultiplier)
  expect(sectorNodeRunProfile(early).spawnMultiplier).toBeLessThan(sectorNodeRunProfile(late).spawnMultiplier)
})

test('planet and anomaly node configs can describe dense clusters and asteroid belts', () => {
  const sampledNodes = Array.from({ length: 30 }, (_, seed) => createSectorMap(seed + 1))
    .flatMap((candidate) => candidate.nodes)
  const planet = sampledNodes.find((node) => node.kind === 'planet')!
  const anomaly = sampledNodes.find((node) => node.config.theme === 'asteroidBelt')!

  expect(planet.config.planets.countMin).toBeGreaterThanOrEqual(2)
  expect(planet.config.planets.countMax).toBeLessThanOrEqual(5)
  expect(planet.config.planets.density).toBe('dense')
  expect(planet.config.planets.archetypeBias.cache).toBeGreaterThan(1)
  expect(anomaly.config.hazardConfig.asteroids?.density).toBeGreaterThan(1)
  expect(anomaly.config.hazardConfig.asteroids?.drift).toMatch(/slow|crosswind|chaotic/)
})

test('asteroid hazard tuning ramps without overwhelming the late route curve', () => {
  const asteroidConfigs = Array.from({ length: 80 }, (_, seed) => createSectorMap(seed + 900))
    .flatMap((candidate) => candidate.nodes)
    .map((node) => node.config.hazardConfig.asteroids)
    .filter((config): config is NonNullable<typeof config> => Boolean(config))

  expect(Math.max(...asteroidConfigs.map((config) => config.density))).toBeLessThanOrEqual(2.3)
  expect(Math.max(...asteroidConfigs.map((config) => config.damageMultiplier))).toBeLessThanOrEqual(1.12)
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
