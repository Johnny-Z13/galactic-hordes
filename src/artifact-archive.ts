import { collectionCatalogById } from './collection-catalog'
import { hashString } from './math-utils'
import type { ArchiveKind, PersistentArchiveRecord } from './mothership-progression'

export type ArtifactKind = ArchiveKind

export interface ArtifactRecord {
  id: string
  kind: ArtifactKind
  title: string
  detail: string
  source: string
  color: string
  icon: number
  count: number
}

export interface ArtifactArchiveCard<T> {
  record: T
  locked: boolean
}

export const orderArtifactArchiveCards = <T>(cards: Array<ArtifactArchiveCard<T>>) => (
  [...cards].sort((a, b) => Number(a.locked) - Number(b.locked))
)

export function collectionSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function artifactColor(kind: ArtifactKind, key: string) {
  const palettes: Record<ArtifactKind, string[]> = {
    relic: ['#fff27a', '#f8fffb', '#b990ff'],
    alien: ['#b990ff', '#57fff3', '#8fff7d'],
    lore: ['#d7fff7', '#70a8ff', '#fff27a'],
    planet: ['#57fff3', '#8fff7d', '#ff5d73', '#b990ff'],
    cache: ['#fff27a', '#70a8ff', '#57fff3'],
    enemy: ['#ff5d73', '#ff61d8', '#fff27a', '#57fff3']
  }
  const colors = palettes[kind]
  return colors[hashString(key, 73) % colors.length]
}

export function spaceEnemyDiscoveryRecord(input: {
  kind: string
  elapsedLabel: string
  color: string
}): Omit<ArtifactRecord, 'count'> {
  const title = input.kind.replace(/([A-Z])/g, ' $1').replace(/^./, (ch) => ch.toUpperCase())
  const id = `enemy:space:${input.kind}`
  return enemyDiscoveryRecord({
    id,
    title: `${title} Vector`,
    detail: `Encountered in open space after ${input.elapsedLabel}.`,
    source: 'Space horde telemetry',
    color: input.color
  })
}

export function enemyDiscoveryRecord(input: {
  id: string
  title: string
  detail: string
  source: string
  color: string
}): Omit<ArtifactRecord, 'count'> {
  return {
    ...input,
    kind: 'enemy',
    icon: hashString(input.id, 83) % 80
  }
}

export function recordArtifactDiscovery(artifacts: Map<string, ArtifactRecord>, record: Omit<ArtifactRecord, 'count'>) {
  const collectionEntry = collectionCatalogById.get(record.id)
  const canonicalRecord = collectionEntry
    ? {
        ...record,
        title: collectionEntry.title,
        detail: collectionEntry.detail,
        source: collectionEntry.source,
        kind: collectionEntry.kind,
        color: collectionEntry.color,
        icon: collectionEntry.icon
      }
    : record
  const existing = artifacts.get(record.id)
  if (existing) {
    existing.count += 1
    existing.title = canonicalRecord.title
    existing.detail = canonicalRecord.detail
    existing.source = canonicalRecord.source
    existing.kind = canonicalRecord.kind
    existing.color = canonicalRecord.color
    existing.icon = canonicalRecord.icon
  } else {
    artifacts.set(record.id, { ...canonicalRecord, count: 1 })
  }
  return {
    record: artifacts.get(record.id)!,
    unlocksSuitOffer: ['alien', 'cache', 'lore', 'relic'].includes(canonicalRecord.kind)
  }
}

export function currentRunArchiveRecords(artifacts: Iterable<ArtifactRecord>): Record<string, PersistentArchiveRecord> {
  const records: Record<string, PersistentArchiveRecord> = {}
  for (const artifact of artifacts) {
    records[artifact.id] = {
      id: artifact.id,
      kind: artifact.kind,
      title: artifact.title,
      detail: artifact.detail,
      source: artifact.source,
      color: artifact.color,
      icon: artifact.icon,
      count: artifact.count
    }
  }
  return records
}
