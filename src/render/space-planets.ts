import type { Vec } from '../main-types'
import type { PlanetBiomeProfile } from '../planet-biomes'
import { TAU } from '../math-utils'

export interface SpacePlanetRenderModel {
  name: string
  x: number
  y: number
  radius: number
  color: string
  visited: boolean
  biome: PlanetBiomeProfile
}

export interface SpacePlanetRenderView {
  ctx: CanvasRenderingContext2D
  planets: SpacePlanetRenderModel[]
  width: number
  height: number
  time: number
  scale: number
  glow: boolean
  worldToScreen: (x: number, y: number) => Vec
}

export function renderSpacePlanets(view: SpacePlanetRenderView) {
  const { ctx } = view
  for (const planet of view.planets) {
    const screen = view.worldToScreen(planet.x, planet.y)
    const radius = planet.radius * view.scale
    if (screen.x < -260 || screen.x > view.width + 260 || screen.y < -260 || screen.y > view.height + 260) continue
    const biome = planet.biome
    ctx.save()
    ctx.strokeStyle = biome.baseColor
    ctx.fillStyle = biome.shadowColor
    ctx.shadowColor = biome.baseColor
    ctx.shadowBlur = view.glow ? 18 : 6
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(screen.x, screen.y, radius, 0, TAU)
    ctx.fill()
    ctx.stroke()
    ctx.shadowBlur = 0
    renderPlanetMotif(ctx, planet, screen, radius, view.scale)
    ctx.strokeStyle = planet.color
    ctx.shadowColor = planet.color
    ctx.shadowBlur = view.glow ? 14 : 4
    ctx.globalAlpha = 0.42
    ctx.beginPath()
    ctx.ellipse(screen.x, screen.y, radius * 1.75, radius * 0.38, Math.sin(view.time * 0.3) * 0.35, 0, TAU)
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.strokeStyle = biome.baseColor
    ctx.shadowColor = biome.baseColor
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath()
      ctx.arc(screen.x, screen.y, radius * (0.35 + i * 0.15), 0, TAU * (0.56 + Math.sin(view.time + i) * 0.08))
      ctx.stroke()
    }
    ctx.fillStyle = planet.visited ? '#8fff7d' : '#d7fff7'
    ctx.font = '12px Courier New'
    ctx.textAlign = 'center'
    ctx.fillText(planet.name, screen.x, screen.y + radius + 24 * view.scale)
    ctx.fillStyle = biome.accentColor
    ctx.font = '10px Courier New'
    ctx.fillText(biome.label.toUpperCase(), screen.x, screen.y + radius + 38 * view.scale)
    ctx.restore()
  }
}

function renderPlanetMotif(
  ctx: CanvasRenderingContext2D,
  planet: SpacePlanetRenderModel,
  screen: Vec,
  radius: number,
  scale: number
) {
  const biome = planet.biome
  ctx.save()
  ctx.beginPath()
  ctx.arc(screen.x, screen.y, radius * 0.98, 0, TAU)
  ctx.clip()
  ctx.globalAlpha = 0.62
  ctx.strokeStyle = biome.accentColor
  ctx.lineWidth = Math.max(1.2, 2 * scale)
  if (biome.surfaceMotif === 'canopy') {
    for (let i = -2; i < 4; i += 1) {
      ctx.beginPath()
      ctx.arc(screen.x - radius * 0.28 + i * radius * 0.2, screen.y - radius * 0.12 + Math.sin(i) * radius * 0.1, radius * 0.34, Math.PI * 0.98, Math.PI * 1.95)
      ctx.stroke()
    }
  } else if (biome.surfaceMotif === 'dunes' || biome.surfaceMotif === 'islands') {
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath()
      ctx.ellipse(screen.x, screen.y + i * radius * 0.22, radius * 1.05, radius * 0.18, Math.sin(i + planet.x) * 0.18, 0, TAU)
      ctx.stroke()
    }
  } else if (biome.surfaceMotif === 'lava') {
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * TAU + (planet.x % 17) * 0.03
      ctx.beginPath()
      ctx.moveTo(screen.x + Math.cos(a) * radius * 0.18, screen.y + Math.sin(a) * radius * 0.18)
      ctx.lineTo(screen.x + Math.cos(a + 0.38) * radius * 0.92, screen.y + Math.sin(a + 0.38) * radius * 0.92)
      ctx.stroke()
    }
  } else if (biome.surfaceMotif === 'ice' || biome.surfaceMotif === 'crystals') {
    for (let i = 0; i < 6; i += 1) {
      const x = screen.x - radius * 0.7 + i * radius * 0.28
      ctx.beginPath()
      ctx.moveTo(x, screen.y + radius * 0.62)
      ctx.lineTo(x + radius * 0.18, screen.y - radius * 0.48)
      ctx.lineTo(x + radius * 0.36, screen.y + radius * 0.5)
      ctx.stroke()
    }
  } else if (biome.surfaceMotif === 'reef') {
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath()
      ctx.arc(screen.x + Math.cos(i) * radius * 0.36, screen.y + Math.sin(i * 1.7) * radius * 0.32, radius * (0.16 + i * 0.025), 0, TAU)
      ctx.stroke()
    }
  } else {
    for (let i = 0; i < 4; i += 1) {
      const x = screen.x - radius * 0.48 + i * radius * 0.32
      ctx.strokeRect(x, screen.y - radius * 0.48, radius * 0.14, radius * 0.96)
    }
  }
  ctx.restore()
}
