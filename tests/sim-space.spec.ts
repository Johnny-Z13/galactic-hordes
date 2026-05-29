import { expect, test } from '@playwright/test'
import { createSectorMap } from '../src/sector-map'
import { BEACON_INTERVAL } from '../src/return-beacons'
import { createSimRng } from '../src/sim/sim-rng'
import { simPolicies } from '../src/sim/sim-policies'
import { simulateSpaceNode } from '../src/sim/sim-space'

const nodes = Array.from({ length: 80 }, (_, seed) => createSectorMap(seed + 1)).flatMap((map) => map.nodes)

test('boss and final nodes produce higher pressure than safe drifts', () => {
  const safe = nodes.find((node) => node.config.templateId === 'safeDrift')!
  const final = nodes.find((node) => node.config.templateId === 'finalStand')!
  const policy = simPolicies.balanced

  const safeResult = simulateSpaceNode({ node: safe, policy, rng: createSimRng(1), seconds: 0, difficulty: 'normal', defensiveRanks: 0 })
  const finalResult = simulateSpaceNode({ node: final, policy, rng: createSimRng(1), seconds: 0, difficulty: 'normal', defensiveRanks: 0 })

  expect(finalResult.kills).toBeGreaterThan(safeResult.kills)
  expect(finalResult.damageTaken).toBeGreaterThan(safeResult.damageTaken)
})

test('asteroid routes can report hazard damage causes', () => {
  const asteroid = nodes.find((node) => node.config.hazards.includes('asteroids'))!
  const result = simulateSpaceNode({ node: asteroid, policy: simPolicies.greedyCache, rng: createSimRng(10), seconds: 400, difficulty: 'normal', defensiveRanks: 0 })

  expect(result.damageTaken).toBeGreaterThan(0)
  expect(['hazard', 'contact', 'projectile']).toContain(result.deathCause)
})

test('post-intro route node duration models the route station window', () => {
  const planetRoute = nodes.find((node) => node.config.templateId === 'planetCluster' && node.column > 1)!
  const result = simulateSpaceNode({ node: planetRoute, policy: simPolicies.balanced, rng: createSimRng(44), seconds: 300, difficulty: 'normal', defensiveRanks: 0 })

  expect(result.nodeSeconds).toBeGreaterThanOrEqual(BEACON_INTERVAL - 30)
})

test('only safe drift opening waves avoid stretching route duration', () => {
  const safe = nodes.find((node) => node.config.templateId === 'safeDrift' && node.config.waves.length >= 3)!
  const combatRoute = nodes.find((node) => node.config.templateId !== 'safeDrift' && node.kind !== 'station' && node.kind !== 'boss' && node.kind !== 'final' && node.config.waves.length >= 2)!
  const policy = simPolicies.balanced

  const safeTwoWaves = { ...safe, config: { ...safe.config, waves: safe.config.waves.slice(0, 2) } }
  const combatTwoWaves = { ...combatRoute, config: { ...combatRoute.config, waves: combatRoute.config.waves.slice(0, 2) } }
  const combatThreeWaves = { ...combatRoute, config: { ...combatRoute.config, waves: [...combatRoute.config.waves, combatRoute.config.waves[1]] } }

  const safeFull = simulateSpaceNode({ node: safe, policy, rng: createSimRng(71), seconds: 0, difficulty: 'normal', defensiveRanks: 0 })
  const safeShort = simulateSpaceNode({ node: safeTwoWaves, policy, rng: createSimRng(71), seconds: 0, difficulty: 'normal', defensiveRanks: 0 })
  const combatFull = simulateSpaceNode({ node: combatThreeWaves, policy, rng: createSimRng(72), seconds: 0, difficulty: 'normal', defensiveRanks: 0 })
  const combatShort = simulateSpaceNode({ node: combatTwoWaves, policy, rng: createSimRng(72), seconds: 0, difficulty: 'normal', defensiveRanks: 0 })

  expect(safeFull.nodeSeconds).toBe(safeShort.nodeSeconds)
  expect(combatFull.nodeSeconds).toBeGreaterThan(combatShort.nodeSeconds)
})
