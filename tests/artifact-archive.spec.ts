import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  artifactColor,
  collectionSlug,
  currentRunArchiveRecords,
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

test('main delegates artifact archive bookkeeping to a focused module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const archive = readFileSync('src/artifact-archive.ts', 'utf8')

  expect(archive).toContain('export function recordArtifactDiscovery')
  expect(archive).toContain('export function currentRunArchiveRecords')
  expect(main).toContain("from './artifact-archive'")
  expect(main).toContain('recordArtifactDiscovery(this.artifacts, record)')
  expect(main).toContain('archiveRecordsFromArtifacts(this.artifacts.values())')
})
