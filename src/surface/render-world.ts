import type { Vec } from '../main-types'
import type { PlanetBiomeProfile } from '../planet-biomes'
import { renderSurfaceBiomeMotifs } from '../render/surface-biomes'

export interface SurfaceWorldCamera {
  x: number
  y: number
}

export interface SurfaceWorldRenderView {
  ctx: CanvasRenderingContext2D
  biome: PlanetBiomeProfile
  seed: number
  glow: boolean
  camera: SurfaceWorldCamera
  surfaceWidth: number
  surfaceHeight: number
  viewWidth: number
  viewHeight: number
  surfaceToScreen: (x: number, y: number) => Vec
}

export function renderSurfaceWorld(view: SurfaceWorldRenderView) {
  const { ctx, biome } = view
  ctx.save()
  const sky = ctx.createLinearGradient(0, 0, 0, view.viewHeight)
  sky.addColorStop(0, biome.skyTop)
  sky.addColorStop(0.52, biome.skyMid)
  sky.addColorStop(1, biome.skyBottom)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, view.viewWidth, view.viewHeight)

  ctx.strokeStyle = biome.gridColor
  ctx.lineWidth = 1
  const grid = 90
  for (let x = -view.camera.x % grid; x < view.viewWidth + grid; x += grid) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + Math.sin((x + view.camera.x) * 0.004) * 24, view.viewHeight)
    ctx.stroke()
  }
  for (let y = -view.camera.y % grid; y < view.viewHeight + grid; y += grid) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(view.viewWidth, y + Math.sin((y + view.camera.y) * 0.005) * 18)
    ctx.stroke()
  }

  renderSurfaceBiomeMotifs({
    ctx,
    biome,
    seed: view.seed,
    glow: view.glow,
    surfaceWidth: view.surfaceWidth,
    surfaceHeight: view.surfaceHeight,
    viewWidth: view.viewWidth,
    viewHeight: view.viewHeight,
    surfaceToScreen: view.surfaceToScreen
  })

  const horizon = view.surfaceToScreen(view.surfaceWidth / 2, view.surfaceHeight + 520)
  ctx.strokeStyle = biome.horizonColor
  ctx.shadowColor = biome.horizonColor
  ctx.shadowBlur = 20
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(horizon.x, horizon.y, 860, Math.PI * 1.12, Math.PI * 1.88)
  ctx.stroke()
  ctx.globalAlpha = 0.26
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath()
    ctx.arc(horizon.x, horizon.y, 720 - i * 62, Math.PI * 1.2, Math.PI * 1.8)
    ctx.stroke()
  }
  ctx.restore()
}
