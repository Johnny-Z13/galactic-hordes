import { expect, test } from '@playwright/test'
import { vitalCriticalClass } from '../src/ui/vital-meter'

test('vital critical class applies at low meter ratios only', () => {
  expect(vitalCriticalClass(0.31)).toBe('')
  expect(vitalCriticalClass(0.3)).toBe('critical')
  expect(vitalCriticalClass(0.05)).toBe('critical')
})
