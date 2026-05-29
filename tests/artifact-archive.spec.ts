import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  artifactColor,
  collectionSlug,
  currentRunArchiveRecords,
  enemyDiscoveryRecord,
  spaceEnemyDiscoveryRecord,
  recordArtifactDiscovery,
  type ArtifactRecord
} from '../src/artifact-archive'

test('artifact discovery canonicalizes catalog records and increments repeats', () => {
  const artifacts = new Map<string, ArtifactRecord>()

  const first = recordArtifactDiscovery(artifacts, {
    id: 'alien:the-glass-herbalist',
    kind: 'enemy',
    title: 'Wrong Title',
    detail: 'Wrong detail',
    source: 'Wrong source',
    color: '#000000',
    icon: 0
  })
  const second = recordArtifactDiscovery(artifacts, {
    id: 'alien:the-glass-herbalist',
    kind: 'alien',
    title: 'The Glass Herbalist',
    detail: 'Updated detail',
    source: 'Updated source',
    color: '#ffffff',
    icon: 99
  })

  expect(first.unlocksSuitOffer).toBe(true)
  expect(second.unlocksSuitOffer).toBe(true)
  expect(artifacts.get('alien:the-glass-herbalist')).toMatchObject({
    kind: 'alien',
    title: 'The Glass Herbalist',
    color: '#b990ff',
    count: 2
  })
})

test('artifact helpers create stable ids colors and persistent archive records', () => {
  const artifacts = new Map<string, ArtifactRecord>()
  recordArtifactDiscovery(artifacts, {
    id: 'enemy:space:chaser',
    kind: 'enemy',
    title: 'Chaser Vector',
    detail: 'Fast contact.',
    source: 'Telemetry',
    color: '#ff5d73',
    icon: 7
  })

  expect(collectionSlug('The Glass Herbalist!')).toBe('the-glass-herbalist')
  expect(artifactColor('relic', 'phase-anchor')).toBe(artifactColor('relic', 'phase-anchor'))
  expect(recordArtifactDiscovery(artifacts, {
    id: 'planet:test',
    kind: 'planet',
    title: 'Test Planet',
    detail: 'Planet.',
    source: 'Survey',
    color: '#57fff3',
    icon: 3
  }).unlocksSuitOffer).toBe(false)
  expect(currentRunArchiveRecords(artifacts.values())['enemy:space:chaser']).toMatchObject({
    id: 'enemy:space:chaser',
    kind: 'enemy',
    count: 1
  })
})

test('space enemy discovery record names telemetry consistently', () => {
  expect(enemyDiscoveryRecord({
    id: 'enemy:surface:glass-mite',
    title: 'Glass Mite',
    detail: 'Catalogued in the dust.',
    source: 'Surface contact',
    color: '#57fff3'
  })).toEqual({
    id: 'enemy:surface:glass-mite',
    kind: 'enemy',
    title: 'Glass Mite',
    detail: 'Catalogued in the dust.',
    source: 'Surface contact',
    color: '#57fff3',
    icon: expect.any(Number)
  })

  expect(spaceEnemyDiscoveryRecord({
    kind: 'dreadnought',
    elapsedLabel: '4:12',
    color: '#ff5d73'
  })).toEqual({
    id: 'enemy:space:dreadnought',
    kind: 'enemy',
    title: 'Dreadnought Vector',
    detail: 'Encountered in open space after 4:12.',
    source: 'Space horde telemetry',
    color: '#ff5d73',
    icon: expect.any(Number)
  })

  expect(spaceEnemyDiscoveryRecord({
    kind: 'glassMiteOracle',
    elapsedLabel: '7:03',
    color: '#57fff3'
  })).toMatchObject({
    id: 'enemy:space:glassMiteOracle',
    title: 'Glass Mite Oracle Vector'
  })
})

test('main delegates artifact archive bookkeeping to a focused module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const archive = readFileSync('src/artifact-archive.ts', 'utf8')

  expect(archive).toContain('export function recordArtifactDiscovery')
  expect(archive).toContain('export function currentRunArchiveRecords')
  expect(archive).toContain('export function enemyDiscoveryRecord')
  expect(archive).toContain('export function spaceEnemyDiscoveryRecord')
  expect(main).toContain("from './artifact-archive'")
  expect(main).toContain('recordArtifactDiscovery(this.artifacts, record)')
  expect(main).toContain('enemyDiscoveryRecord(discovery)')
  expect(main).toContain('spaceEnemyDiscoveryRecord({')
  expect(main).toContain('archiveRecordsFromArtifacts(this.artifacts.values())')
  expect(main).not.toContain('private recordEnemyDiscovery(')
})
