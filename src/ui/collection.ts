import collectionIconAtlasUrl from '../assets/collection-icon-atlas.png'
import { orderArtifactArchiveCards } from '../artifact-archive'
import { collectionCatalog, collectionIconAtlasColumns, collectionIconAtlasRows } from '../collection-catalog'
import { relics } from '../powerup-balance'
import type { PersistentArchiveRecord } from '../mothership-progression'
import type { ArtifactKind, ArtifactRecord } from '../artifact-archive'
import type { MothershipCollectionFilter } from './mothership-ui-types'
import { clamp, hashString } from '../math-utils'

interface CollectionView extends Object {}

interface CollectionRuntime {
  artifacts: Map<string, ArtifactRecord>
  mothership: {
    archive: {
      records: Record<string, PersistentArchiveRecord>
    }
  }
  selectedCollectionId: string | null
  mothershipCollectionFilter: MothershipCollectionFilter
  escape(value: string): string
  artifactColor(kind: ArtifactKind, id: string): string
  currentFrontScreenScrollTop(screen: 'collection'): number
  showCollection(options?: { scrollTop?: number }): void
}

function collectionRuntime(self: CollectionView) {
  return self as CollectionRuntime
}

export function renderArtifactsCollection(self: CollectionView, source: 'run' | 'mothership' = 'run') {
  const runtime = collectionRuntime(self)
  const wrap = document.createElement('div')
  wrap.className = 'artifact-collection'
  const title = document.createElement('div')
  title.className = 'manifest-title'
  title.innerHTML = '<b>ARTEFACT ARCHIVE</b><span>relics, contacts, ruins, caches, and planet firsts</span>'
  const summary = document.createElement('div')
  summary.className = 'manifest-summary artifact-summary'
  const unlocked = source === 'run'
    ? Array.from(runtime.artifacts.values())
    : Object.values(runtime.mothership.archive.records).map((record) => normalizeArchiveRecord(self, record))
  const counts: Record<ArtifactKind, number> = { relic: 0, alien: 0, lore: 0, planet: 0, cache: 0, enemy: 0 }
  for (const artifact of unlocked) counts[artifact.kind] += 1
  summary.innerHTML = `
    <div><b>${counts.relic}/${relics.length}</b><span>relics</span></div>
    <div><b>${counts.alien}</b><span>contacts</span></div>
    <div><b>${counts.lore}</b><span>ruins</span></div>
    <div><b>${counts.planet}</b><span>planets</span></div>
    <div><b>${counts.enemy}</b><span>enemies</span></div>
  `
  const grid = document.createElement('div')
  grid.className = 'artifact-grid'
  for (const card of orderArtifactArchiveCards(artifactCards(self, source))) grid.append(artifactCard(self, card.record, card.locked))
  wrap.append(title, summary, grid)
  return wrap
}

export function artifactCards(self: CollectionView, source: 'run' | 'mothership' = 'run') {
  const runtime = collectionRuntime(self)
  const cards: Array<{ record: ArtifactRecord; locked: boolean }> = []
  const archive = source === 'run'
    ? runtime.artifacts
    : new Map(Object.values(runtime.mothership.archive.records).map((record) => {
      const normalized = normalizeArchiveRecord(self, record)
      return [normalized.id, normalized]
    }))
  for (const relic of relics) {
    const id = `relic:${relic.id}`
    const found = archive.get(id)
    cards.push({
      locked: !found,
      record: found ?? {
        id,
        kind: 'relic',
        title: 'Unknown Relic',
        detail: source === 'run' ? 'Signature not recovered this run.' : 'Signature not recovered by any expedition.',
        source: 'Relic signal',
        color: '#fff27a',
        icon: hashString(relic.id, 41) % 16,
        count: 0
      }
    })
  }
  for (const artifact of archive.values()) {
    if (artifact.kind !== 'relic') cards.push({ record: artifact, locked: false })
  }
  return cards
}

export function normalizeArchiveRecord(self: CollectionView, record: PersistentArchiveRecord): ArtifactRecord {
  const runtime = collectionRuntime(self)
  return {
    id: record.id,
    kind: record.kind,
    title: record.title,
    detail: record.detail ?? 'Signal detail unavailable.',
    source: record.source ?? 'Mothership archive',
    color: record.color ?? runtime.artifactColor(record.kind, record.id),
    icon: record.icon ?? hashString(record.id, 29) % 16,
    count: record.count ?? 1
  }
}

export function artifactCard(self: CollectionView, record: ArtifactRecord, locked: boolean) {
  const runtime = collectionRuntime(self)
  const card = document.createElement('div')
  card.className = `artifact-card ${record.kind} ${locked ? 'locked' : 'found'}`
  const meta = document.createElement('div')
  meta.className = 'artifact-meta'
  const count = record.count > 1 ? ` x${record.count}` : ''
  meta.innerHTML = `<strong>${runtime.escape(record.title)}${count}</strong><span>${runtime.escape(record.detail)}</span><em>${runtime.escape(record.source)}</em>`
  card.append(artifactIcon(self, record, locked), meta)
  return card
}

export function artifactIcon(self: CollectionView, record: ArtifactRecord, locked = false) {
  const icon = document.createElement('div')
  icon.className = `artifact-icon ${record.kind} shape-${record.icon % 12} ${locked ? 'locked' : ''}`
  icon.style.setProperty('--artifact-color', locked ? 'rgba(215, 255, 247, 0.28)' : record.color)
  icon.style.setProperty('--artifact-spin', `${(record.icon % 8) * 45}deg`)
  for (let i = 0; i < 4; i += 1) {
    const mark = document.createElement('span')
    mark.className = `artifact-mark m${i + 1}`
    icon.append(mark)
  }
  return icon
}

export function renderCollectionScreen(self: CollectionView) {
  const runtime = collectionRuntime(self)
  const wrap = document.createElement('div')
  wrap.className = 'collection-screen'
  const allRecords = collectionCards(self)
  const foundCount = allRecords.filter((card) => !card.locked).length
  const records = filteredCollectionCards(self, allRecords)
  const firstFound = records.find((card) => !card.locked) ?? records[0]
  if (!runtime.selectedCollectionId || !records.some((card) => card.record.id === runtime.selectedCollectionId)) {
    runtime.selectedCollectionId = firstFound?.record.id ?? null
  }
  const selected = records.find((card) => card.record.id === runtime.selectedCollectionId) ?? firstFound

  const head = document.createElement('div')
  head.className = 'collection-head'
  head.innerHTML = `
    <b>Collection</b>
    <span>Collected: <strong>${foundCount}</strong> of <strong>${collectionCatalog.length}</strong></span>
  `

  const controls = document.createElement('div')
  controls.className = 'collection-controls'
  const foundPanel = document.createElement('div')
  foundPanel.className = 'collection-control'
  foundPanel.innerHTML = `<span>Collected:</span><b>${foundCount} / ${collectionCatalog.length}</b>`
  const familyCounts = new Set(allRecords.filter((card) => !card.locked).map((card) => card.record.kind)).size
  const familyPanel = document.createElement('div')
  familyPanel.className = 'collection-control'
  familyPanel.innerHTML = `<span>Families:</span><b>${familyCounts} / 6</b>`
  const filterPanel = document.createElement('div')
  filterPanel.className = 'collection-filter-panel'
  filterPanel.append(collectionFilterButton(self, 'all'), collectionFilterButton(self, 'found'), collectionFilterButton(self, 'locked'))
  filterPanel.append(
    collectionFilterButton(self, 'relic'),
    collectionFilterButton(self, 'enemy'),
    collectionFilterButton(self, 'alien'),
    collectionFilterButton(self, 'lore'),
    collectionFilterButton(self, 'planet'),
    collectionFilterButton(self, 'cache')
  )
  controls.append(foundPanel, familyPanel, filterPanel)

  const grid = document.createElement('div')
  grid.className = 'collection-icon-grid'
  for (const card of records) {
    const button = document.createElement('button')
    button.className = `collection-tile ${card.record.kind} ${card.locked ? 'locked' : 'found'} ${selected?.record.id === card.record.id ? 'selected' : ''}`
    button.type = 'button'
    button.setAttribute('aria-label', card.locked ? `Unknown ${card.record.kind}` : card.record.title)
    button.append(collectionIcon(self, card.record, card.locked))
    button.addEventListener('click', () => {
      runtime.selectedCollectionId = card.record.id
      const scrollTop = runtime.currentFrontScreenScrollTop('collection')
      runtime.showCollection({ scrollTop })
    })
    grid.append(button)
  }

  const detail = document.createElement('div')
  detail.className = `collection-detail ${selected?.locked ? 'locked' : 'found'}`
  if (selected) {
    const count = selected.record.count > 1 ? ` x${selected.record.count}` : ''
    const detailIcon = document.createElement('div')
    detailIcon.className = 'collection-detail-icon'
    detailIcon.append(collectionIcon(self, selected.record, selected.locked))
    const meta = document.createElement('div')
    meta.className = 'collection-detail-meta'
    meta.innerHTML = `
      <small>${collectionKindLabel(self, selected.record.kind)} / ${selected.locked ? 'LOCKED' : 'DISCOVERED'}</small>
      <b>${runtime.escape(selected.record.title)}${count}</b>
      <span>${runtime.escape(selected.record.detail)}</span>
      <em>${runtime.escape(selected.record.source)}</em>
    `
    detail.append(detailIcon, meta)
  } else {
    detail.innerHTML = '<b>Archive Empty</b><span>No discoveries have reached the mothership archive yet.</span><em>Land on planets to recover signals.</em>'
  }

  wrap.append(head, controls, grid, detail)
  return wrap
}

export function collectionCards(self: CollectionView) {
  const runtime = collectionRuntime(self)
  const archive = new Map(Object.values(runtime.mothership.archive.records).map((record) => {
    const normalized = normalizeArchiveRecord(self, record)
    return [normalized.id, normalized]
  }))
  const cards = collectionCatalog.map((entry) => {
    const found = archive.get(entry.id)
    return {
      locked: !found,
      record: found
        ? {
            ...found,
            kind: entry.kind,
            color: entry.color,
            icon: entry.icon
          }
        : {
            id: entry.id,
            kind: entry.kind,
            title: 'Unknown Discovery',
            detail: 'Signal not yet recovered.',
            source: 'Locked collection entry',
            color: 'rgba(215, 255, 247, 0.28)',
            icon: entry.icon,
            count: 0
          }
    }
  })
  return orderArtifactArchiveCards(cards)
}

export function filteredCollectionCards(self: CollectionView, cards: Array<{ record: ArtifactRecord; locked: boolean }>) {
  const runtime = collectionRuntime(self)
  if (runtime.mothershipCollectionFilter === 'found') return cards.filter((card) => !card.locked)
  if (runtime.mothershipCollectionFilter === 'locked') return cards.filter((card) => card.locked)
  if (runtime.mothershipCollectionFilter !== 'all') return cards.filter((card) => card.record.kind === runtime.mothershipCollectionFilter)
  return cards
}

export function collectionFilterButton(self: CollectionView, filter: MothershipCollectionFilter) {
  const runtime = collectionRuntime(self)
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `collection-filter-chip ${runtime.mothershipCollectionFilter === filter ? 'active' : ''}`
  button.textContent = collectionFilterLabel(self, filter)
  button.setAttribute('aria-pressed', String(runtime.mothershipCollectionFilter === filter))
  button.addEventListener('click', () => {
    runtime.mothershipCollectionFilter = filter
    runtime.selectedCollectionId = null
    const scrollTop = runtime.currentFrontScreenScrollTop('collection')
    runtime.showCollection({ scrollTop })
  })
  return button
}

export function collectionFilterLabel(self: CollectionView, filter?: MothershipCollectionFilter) {
  const runtime = collectionRuntime(self)
  return {
    all: 'ALL',
    found: 'FOUND',
    locked: 'LOCKED',
    relic: 'RELICS',
    enemy: 'ENEMIES',
    alien: 'ALIENS',
    lore: 'LORE',
    planet: 'PLANETS',
    cache: 'CACHES'
  }[filter ?? runtime.mothershipCollectionFilter]
}

export function collectionKindLabel(self: CollectionView, kind: ArtifactKind) {
  return {
    relic: 'RELIC',
    enemy: 'ENEMY',
    alien: 'ALIEN',
    lore: 'LORE',
    planet: 'PLANET',
    cache: 'CACHE'
  }[kind]
}

export function collectionIcon(self: CollectionView, record: ArtifactRecord, locked = false) {
  const icon = document.createElement('span')
  if (locked) {
    icon.className = `collection-icon ${record.kind} locked`
    icon.textContent = '?'
    return icon
  }
  const iconCount = collectionIconAtlasColumns * collectionIconAtlasRows
  const index = Math.floor(clamp(Math.abs(record.icon), 0, iconCount - 1))
  const col = index % collectionIconAtlasColumns
  const row = Math.floor(index / collectionIconAtlasColumns)
  const x = collectionIconAtlasColumns <= 1 ? 0 : (col / (collectionIconAtlasColumns - 1)) * 100
  const y = collectionIconAtlasRows <= 1 ? 0 : (row / (collectionIconAtlasRows - 1)) * 100
  icon.className = `collection-icon ${record.kind} ${locked ? 'locked' : ''}`
  icon.style.backgroundImage = `url("${collectionIconAtlasUrl}")`
  icon.style.backgroundSize = `${collectionIconAtlasColumns * 100}% ${collectionIconAtlasRows * 100}%`
  icon.style.backgroundPosition = `${x}% ${y}%`
  return icon
}

