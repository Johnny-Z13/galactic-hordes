export type SpaceEnemyKind = 'chaser' | 'splinter' | 'lancer' | 'mine' | 'brute' | 'shooter' | 'warden' | 'razor' | 'skimmer' | 'bulwark'

interface EnemyDefinition {
  hp: number
  r: number
  speed: number
  value: number
  color: string
  spriteRow?: number
  forwardAmbush: boolean
}

interface PlayerMotion {
  x: number
  y: number
  vx: number
  vy: number
  angle: number
}

export interface Point {
  x: number
  y: number
}

export const spriteEnemyKinds = ['razor', 'skimmer', 'bulwark'] as const

export const spaceEnemyDefinitions: Record<SpaceEnemyKind, EnemyDefinition> = {
  chaser: { hp: 34, r: 17, speed: 123, value: 7, color: '#8fff7d', forwardAmbush: false },
  splinter: { hp: 23, r: 14, speed: 158, value: 5, color: '#70a8ff', forwardAmbush: false },
  lancer: { hp: 60, r: 18, speed: 154, value: 13, color: '#fff27a', forwardAmbush: false },
  mine: { hp: 46, r: 22, speed: 68, value: 10, color: '#ff5d73', forwardAmbush: false },
  brute: { hp: 170, r: 34, speed: 98, value: 24, color: '#ff9d5c', forwardAmbush: false },
  shooter: { hp: 72, r: 21, speed: 118, value: 18, color: '#ff61d8', forwardAmbush: false },
  warden: { hp: 520, r: 50, speed: 134, value: 90, color: '#b990ff', forwardAmbush: false },
  razor: { hp: 92, r: 18, speed: 335, value: 26, color: '#57fff3', spriteRow: 0, forwardAmbush: true },
  skimmer: { hp: 126, r: 24, speed: 176, value: 32, color: '#ffe66d', spriteRow: 1, forwardAmbush: true },
  bulwark: { hp: 270, r: 38, speed: 86, value: 46, color: '#f46cff', spriteRow: 2, forwardAmbush: true }
}

export const isSpriteEnemyKind = (kind: SpaceEnemyKind): kind is (typeof spriteEnemyKinds)[number] => {
  return spriteEnemyKinds.includes(kind as (typeof spriteEnemyKinds)[number])
}

export const isForwardAmbushEnemy = (kind: SpaceEnemyKind) => spaceEnemyDefinitions[kind].forwardAmbush

export const spaceEnemySpawnPoint = (
  kind: SpaceEnemyKind,
  player: PlayerMotion,
  minR: number,
  maxR: number,
  random: () => number = Math.random
): Point => {
  if (!isForwardAmbushEnemy(kind)) {
    const a = random() * Math.PI * 2
    const r = minR + (maxR - minR) * random()
    return {
      x: player.x + Math.cos(a) * r,
      y: player.y + Math.sin(a) * r
    }
  }

  const travelSpeed = Math.hypot(player.vx, player.vy)
  const angle = travelSpeed > 24 ? Math.atan2(player.vy, player.vx) : player.angle
  const forward = minR + (maxR - minR) * random()
  const side = (random() * 2 - 1) * Math.min(300, forward * 0.38)
  const fx = Math.cos(angle)
  const fy = Math.sin(angle)

  return {
    x: player.x + fx * forward - fy * side,
    y: player.y + fy * forward + fx * side
  }
}
