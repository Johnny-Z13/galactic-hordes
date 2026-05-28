import { TAU } from '../math-utils'

export interface MinimapPoint {
  x: number
  y: number
}

export interface MinimapPlanet extends MinimapPoint {
  color: string
  visited: boolean
}

export interface MinimapEnemy extends MinimapPoint {
  kind: string
}

export interface MinimapRenderView {
  ctx: CanvasRenderingContext2D
  player: MinimapPoint
  planets: MinimapPlanet[]
  enemies: MinimapEnemy[]
  chunkSize: number
  chunkLoadRadius: number
  width?: number
  height?: number
}

export function renderMinimap(view: MinimapRenderView) {
  const { ctx } = view
  const width = view.width ?? 154
  const height = view.height ?? 154
  const scale = view.chunkSize * (view.chunkLoadRadius * 2 + 1)
  const toMini = (x: number, y: number) => ({
    x: width / 2 + ((x - view.player.x) / scale) * width,
    y: height / 2 + ((y - view.player.y) / scale) * height
  })
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(2,8,12,0.72)'
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = 'rgba(87,255,243,0.5)'
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1)
  ctx.strokeStyle = 'rgba(87,255,243,0.18)'
  ctx.beginPath()
  ctx.moveTo(width / 2, 8)
  ctx.lineTo(width / 2, height - 8)
  ctx.moveTo(8, height / 2)
  ctx.lineTo(width - 8, height / 2)
  ctx.stroke()
  for (const planet of view.planets) {
    const point = toMini(planet.x, planet.y)
    if (point.x < -6 || point.x > width + 6 || point.y < -6 || point.y > height + 6) continue
    ctx.strokeStyle = planet.visited ? '#8fff7d' : planet.color
    ctx.beginPath()
    ctx.arc(point.x, point.y, planet.visited ? 4 : 3, 0, TAU)
    ctx.stroke()
  }
  for (const enemy of view.enemies.slice(0, 70)) {
    const point = toMini(enemy.x, enemy.y)
    if (point.x < 0 || point.x > width || point.y < 0 || point.y > height) continue
    ctx.fillStyle = enemy.kind === 'warden' ? '#b990ff' : '#ff5d73'
    ctx.fillRect(point.x - 1, point.y - 1, 2, 2)
  }
  ctx.fillStyle = '#57fff3'
  ctx.beginPath()
  ctx.arc(width / 2, height / 2, 4, 0, TAU)
  ctx.fill()
}
