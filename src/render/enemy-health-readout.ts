import type { Enemy, EnemyKind } from '../main-types'
import { damageFeedbackConfig } from '../combat/damage-feedback'
import { isGiantEnemyKind } from '../space-enemies'

export interface EnemyHealthReadout {
  fillRatio: number
  width: number
  height: number
  yOffset: number
  fillColor: string
  trackColor: string
  strokeColor: string
  alpha: number
}

export function isPriorityEnemyHealthTarget(kind: EnemyKind, highLoad: boolean): boolean {
  if (isGiantEnemyKind(kind) || kind === 'warden' || kind === 'bulwark') return true
  return !highLoad && kind === 'brute'
}

export function enemyHealthReadout(input: {
  enemy: Pick<Enemy, 'kind' | 'hp' | 'maxHp' | 'radius' | 'color'>
  highLoad: boolean
  scale: number
}): EnemyHealthReadout | null {
  const { enemy, highLoad, scale } = input
  if (!isPriorityEnemyHealthTarget(enemy.kind, highLoad)) return null
  if (enemy.maxHp <= 0 || enemy.hp >= enemy.maxHp) return null

  const fillRatio = clamp(enemy.hp / enemy.maxHp, 0, 1)
  const boss = isGiantEnemyKind(enemy.kind) || enemy.kind === 'warden' || enemy.kind === 'bulwark'
  const screenRadius = enemy.radius * scale
  const height = boss ? 5 : 4

  return {
    fillRatio,
    width: Math.max(boss ? 54 : 38, screenRadius * (boss ? 2.55 : 2.15)),
    height,
    yOffset: screenRadius + (boss ? 18 : 12),
    fillColor: fillRatio <= 0.28 ? damageFeedbackConfig.hitFlash.color : enemy.color,
    trackColor: 'rgba(4, 10, 18, 0.76)',
    strokeColor: boss ? '#ffedf1' : '#d7fff7',
    alpha: boss ? 0.9 : 0.78
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
