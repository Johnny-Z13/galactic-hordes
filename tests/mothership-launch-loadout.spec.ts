import { expect, test } from '@playwright/test'
import { defaultMothershipState } from '../src/mothership-progression'
import { runBalance } from '../src/run-balance'

test('mothership launch loadout applies shipyard and workbench launch bonuses', async () => {
  const { resolveMothershipLaunchLoadout } = await import('../src/mothership-launch-loadout')
  const state = defaultMothershipState()
  state.departments.shipyard = 2
  state.departments.workbench = 1

  const loadout = resolveMothershipLaunchLoadout(state)

  expect(loadout.hullBonus).toBe(2 * runBalance.progression.shipyardHullPerTier)
  expect(loadout.speedBonus).toBe(2 * runBalance.progression.shipyardSpeedPerTier)
  expect(loadout.workbenchRerolls).toBe(1)
  expect(loadout.resources).toEqual({ scrap: 0, crystal: 0, cores: 0 })
})

test('mothership launch loadout scales hangar crew prepared cargo thresholds', async () => {
  const { resolveMothershipLaunchLoadout } = await import('../src/mothership-launch-loadout')
  const state = defaultMothershipState()

  state.departments.hangarCrew = 1
  expect(resolveMothershipLaunchLoadout(state).resources).toEqual({ scrap: 25, crystal: 0, cores: 0 })

  state.departments.hangarCrew = 2
  expect(resolveMothershipLaunchLoadout(state).resources).toEqual({ scrap: 50, crystal: 4, cores: 0 })

  state.departments.hangarCrew = 4
  expect(resolveMothershipLaunchLoadout(state).resources).toEqual({ scrap: 100, crystal: 8, cores: 1 })
})
