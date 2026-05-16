import { expect, test } from '@playwright/test'
import { firstOpportunityUpgrade } from '../src/workbench-rolls'

const upgrades = [
  { id: 'rapid', max: 8 },
  { id: 'nav', max: 7 },
  { id: 'shield', max: 5 }
]

test('requires nav as the first opportunity upgrade until auto-move is installed', () => {
  expect(firstOpportunityUpgrade(upgrades, { rapid: 0, nav: 0, shield: 0 })?.id).toBe('nav')
})

test('does not require nav after auto-move has been installed', () => {
  expect(firstOpportunityUpgrade(upgrades, { rapid: 0, nav: 1, shield: 0 })).toBeNull()
})
