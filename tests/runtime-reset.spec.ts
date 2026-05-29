import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const occurrences = (source: string, text: string) => source.split(text).length - 1

test('main shares space runtime cleanup between full reset and sector preparation', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const prepareStart = main.indexOf('private prepareSectorNode(')
  const prepareEnd = main.indexOf('private completeSectorNodeViaBeacon', prepareStart)
  const resetStart = main.indexOf('private reset()')
  const resetEnd = main.indexOf('private togglePause', resetStart)
  const prepareSectorNode = main.slice(prepareStart, prepareEnd)
  const reset = main.slice(resetStart, resetEnd)

  expect(main).toContain('private clearSpaceRuntimeState(options: { resetNavigationHeading?: boolean } = {})')
  expect(prepareSectorNode).toContain('this.clearSpaceRuntimeState()')
  expect(reset).toContain('this.clearSpaceRuntimeState({ resetNavigationHeading: true })')
  expect(occurrences(main, 'this.bullets = []')).toBe(1)
  expect(occurrences(main, 'this.spaceHazards = []')).toBe(1)
  expect(occurrences(main, 'this.derelictSignals = []')).toBe(1)
  expect(occurrences(main, 'this.firedSectorWaves.clear()')).toBe(1)
})

test('main centralizes auto navigation cleanup for route transitions', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const cleanupStart = main.indexOf('private clearAutoNavigationState(')
  const cleanupEnd = main.indexOf('private clearSpaceRuntimeState', cleanupStart)
  const cleanup = main.slice(cleanupStart, cleanupEnd)

  expect(cleanup).toContain('this.returnBeacon = null')
  expect(cleanup).toContain('this.autoNavActive = false')
  expect(cleanup).toContain('this.clearPlanetCourse()')
  expect(cleanup).toContain('this.clearReturnBeaconCourse()')
  expect(cleanup).toContain('if (options.resetHeading) this.autoNavHeading = 0')
  expect(occurrences(main, 'this.autoNavActive = false')).toBe(1)
  expect(occurrences(main, 'this.autoNavHeading = 0')).toBe(1)
})
