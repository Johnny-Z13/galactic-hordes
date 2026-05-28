import type { SectorWaveConfig } from './sector-map'

export interface SpaceWaveWarning {
  id: string
  label: string
  secondsUntil: number
  enemyTotal: number
  progress: number
  notes?: string
}

export const spaceWaveId = (nodeId: string, wave: SectorWaveConfig) => `${nodeId}:${wave.label}:${wave.atSeconds}`

export const spaceWaveEnemyTotal = (wave: SectorWaveConfig) => (
  Object.values(wave.enemies).reduce((total, count) => total + (count ?? 0), 0)
)

export function nextSpaceWaveWarning(input: {
  nodeId: string
  waves: SectorWaveConfig[]
  firedWaveIds: Set<string>
  elapsed: number
  warningSeconds: number
}): SpaceWaveWarning | null {
  const nextWave = input.waves
    .filter((wave) => !input.firedWaveIds.has(spaceWaveId(input.nodeId, wave)))
    .sort((a, b) => a.atSeconds - b.atSeconds)
    .find((wave) => wave.atSeconds >= input.elapsed)
  if (!nextWave) return null

  const secondsUntil = Math.max(0, nextWave.atSeconds - input.elapsed)
  if (secondsUntil > input.warningSeconds) return null

  return {
    id: spaceWaveId(input.nodeId, nextWave),
    label: nextWave.label,
    secondsUntil,
    enemyTotal: spaceWaveEnemyTotal(nextWave),
    progress: clamp01(1 - secondsUntil / input.warningSeconds),
    notes: nextWave.notes
  }
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}
