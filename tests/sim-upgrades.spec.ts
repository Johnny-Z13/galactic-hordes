import { expect, test } from '@playwright/test'
import { upgrades } from '../src/powerup-balance'
import { createSimRng } from '../src/sim/sim-rng'
import { simPolicies } from '../src/sim/sim-policies'
import { applySimUpgrade, chooseSimUpgrade, createEmptyUpgradeBuild } from '../src/sim/sim-upgrades'

test('survival policy can choose and apply defensive upgrades', () => {
  const build = createEmptyUpgradeBuild()
  const chosen = chooseSimUpgrade({ build, policy: simPolicies.survival, rng: createSimRng(12) })

  expect(chosen).not.toBeNull()
  const rank = applySimUpgrade(build, chosen!)

  expect(rank).toBe(1)
  expect(build[chosen!.id]).toBe(1)
})

test('upgrade chooser stops when all rollable upgrades are maxed', () => {
  const build = createEmptyUpgradeBuild()
  for (const upgrade of upgrades) build[upgrade.id] = upgrade.max

  expect(chooseSimUpgrade({ build, policy: simPolicies.balanced, rng: createSimRng(1) })).toBeNull()
})
