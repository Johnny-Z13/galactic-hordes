export interface NavigationThreatWeavePoint {
  x: number
  y: number
}

export interface NavigationThreatWeaveEnemy extends NavigationThreatWeavePoint {
  kind: string
}

export function navigationThreatWeaveVector(input: {
  player: NavigationThreatWeavePoint
  enemies: readonly NavigationThreatWeaveEnemy[]
  navRank: number
}) {
  let ax = 0
  let ay = 0
  const radius = 230 + input.navRank * 38
  const radius2 = radius * radius
  for (const enemy of input.enemies) {
    const dx = input.player.x - enemy.x
    const dy = input.player.y - enemy.y
    const d = dx * dx + dy * dy
    if (d <= 1 || d > radius2) continue
    const weight = (enemy.kind === 'brute' || enemy.kind === 'warden' ? 1.45 : 1) * (1 - d / radius2)
    ax += (dx / Math.sqrt(d)) * weight
    ay += (dy / Math.sqrt(d)) * weight
  }
  if (Math.abs(ax) + Math.abs(ay) <= 0.02) return null
  return { x: ax, y: ay }
}
