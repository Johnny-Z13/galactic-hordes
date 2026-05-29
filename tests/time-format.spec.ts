import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { formatTime } from '../src/time-format'

test('formatTime renders minutes and padded seconds', () => {
  expect(formatTime(0)).toBe('0:00')
  expect(formatTime(7.9)).toBe('0:07')
  expect(formatTime(65)).toBe('1:05')
  expect(formatTime(601)).toBe('10:01')
})

test('ui modules import runtime helpers outside main', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(readFileSync('src/ui/hud.ts', 'utf8')).toContain("from '../time-format'")
  expect(readFileSync('src/ui/scores.ts', 'utf8')).toContain("from '../time-format'")
  expect(readFileSync('src/ui/debrief.ts', 'utf8')).toContain("from '../time-format'")
  expect(readFileSync('src/ui/collection.ts', 'utf8')).toContain("from '../math-utils'")
  expect(readFileSync('src/ui/mothership-console.ts', 'utf8')).toContain("from '../math-utils'")
  expect(readFileSync('src/ui/hud.ts', 'utf8')).toContain("from '../math-utils'")
  expect(readFileSync('src/ui/hud.ts', 'utf8')).not.toContain('import { clamp, formatTime, type VectorShooter } from')
  expect(main).not.toContain("export { clamp } from './math-utils'")
  expect(main).not.toContain("export { formatTime } from './time-format'")
  expect(main).not.toContain("export type { AudioUpgradeCue } from './audio/audio-director'")
  expect(main).not.toContain("export type { ArtifactKind, ArtifactRecord } from './artifact-archive'")
})
