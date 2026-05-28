import type { Vec } from '../main-types'
import { TAU } from '../math-utils'
import { planetAlienCatalogVariants, type SurfaceResourceKind } from '../surface-balance'

type SurfaceLoreKind = 'fossils' | 'pyramid' | 'grave' | 'machine' | 'choir'

export interface SurfaceResourceRenderModel {
  kind: SurfaceResourceKind
  x: number
  y: number
  radius: number
  color: string
  collected: boolean
}

export interface SurfaceLoreSiteRenderModel {
  x: number
  y: number
  radius: number
  phase: number
  kind: SurfaceLoreKind
  resolved: boolean
}

export interface SurfaceAlienRenderModel {
  x: number
  y: number
  radius: number
  phase: number
  color: string
  resolved: boolean
  sprite?: 'alienCatalog'
  spriteRow?: number
}

export interface SurfaceResourcesRenderView {
  ctx: CanvasRenderingContext2D
  resources: SurfaceResourceRenderModel[]
  time: number
  surfaceToScreen: (x: number, y: number) => Vec
}

export interface SurfaceLoreSitesRenderView {
  ctx: CanvasRenderingContext2D
  loreSites: SurfaceLoreSiteRenderModel[]
  time: number
  allowGlow: boolean
  surfaceToScreen: (x: number, y: number) => Vec
}

export interface SurfaceAliensRenderView {
  ctx: CanvasRenderingContext2D
  aliens: SurfaceAlienRenderModel[]
  time: number
  allowGlow: boolean
  planetAlienCatalog: HTMLImageElement
  surfaceToScreen: (x: number, y: number) => Vec
}

const ALIEN_CATALOG_ROWS = planetAlienCatalogVariants.length
const ALIEN_CATALOG_FRAMES = 4
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function renderSurfaceResources(view: SurfaceResourcesRenderView) {
  const { ctx, resources, time, surfaceToScreen } = view
  for (const resource of resources) {
    if (resource.collected) continue
    const p = surfaceToScreen(resource.x, resource.y)
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(time * 1.8)
    ctx.strokeStyle = resource.color
    ctx.shadowColor = resource.color
    ctx.shadowBlur = resource.kind === 'cache' ? 24 : 14
    ctx.lineWidth = resource.kind === 'cache' ? 3 : 2
    ctx.beginPath()
    if (resource.kind === 'cache') {
      ctx.rect(-resource.radius, -resource.radius, resource.radius * 2, resource.radius * 2)
      ctx.moveTo(-resource.radius, 0)
      ctx.lineTo(resource.radius, 0)
      ctx.moveTo(0, -resource.radius)
      ctx.lineTo(0, resource.radius)
    } else {
      ctx.moveTo(0, -resource.radius)
      ctx.lineTo(resource.radius, 0)
      ctx.lineTo(0, resource.radius)
      ctx.lineTo(-resource.radius, 0)
      ctx.closePath()
    }
    ctx.stroke()
    ctx.restore()
  }
}

export function renderSurfaceLoreSites(view: SurfaceLoreSitesRenderView) {
  const { ctx, loreSites, time, allowGlow, surfaceToScreen } = view
  for (const site of loreSites) {
    if (site.resolved) continue
    const p = surfaceToScreen(site.x, site.y)
    const pulse = Math.sin(time * 2.8 + site.phase)
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.strokeStyle = '#d7fff7'
    ctx.shadowColor = '#d7fff7'
    ctx.shadowBlur = allowGlow ? 18 : 8
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.9
    if (site.kind === 'pyramid') {
      ctx.beginPath()
      ctx.moveTo(0, -site.radius)
      ctx.lineTo(site.radius * 0.95, site.radius * 0.62)
      ctx.lineTo(-site.radius * 0.95, site.radius * 0.62)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, -site.radius)
      ctx.lineTo(0, site.radius * 0.62)
      ctx.stroke()
    } else if (site.kind === 'grave') {
      ctx.beginPath()
      ctx.moveTo(-site.radius * 0.72, site.radius * 0.62)
      ctx.lineTo(-site.radius * 0.72, -site.radius * 0.2)
      ctx.quadraticCurveTo(0, -site.radius, site.radius * 0.72, -site.radius * 0.2)
      ctx.lineTo(site.radius * 0.72, site.radius * 0.62)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-site.radius * 0.32, -site.radius * 0.1)
      ctx.lineTo(site.radius * 0.32, -site.radius * 0.1)
      ctx.moveTo(0, -site.radius * 0.42)
      ctx.lineTo(0, site.radius * 0.28)
      ctx.stroke()
    } else if (site.kind === 'fossils') {
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath()
        ctx.ellipse((i - 2) * 10, Math.sin(i) * 5, 7, 18, i * 0.65, 0, TAU)
        ctx.stroke()
      }
    } else if (site.kind === 'machine') {
      ctx.beginPath()
      ctx.rect(-site.radius * 0.7, -site.radius * 0.45, site.radius * 1.4, site.radius * 0.9)
      ctx.moveTo(-site.radius, -site.radius * 0.72)
      ctx.lineTo(site.radius, site.radius * 0.72)
      ctx.moveTo(site.radius, -site.radius * 0.72)
      ctx.lineTo(-site.radius, site.radius * 0.72)
      ctx.stroke()
    } else {
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath()
        ctx.arc(0, 0, site.radius * (0.35 + i * 0.18), i * 0.7, Math.PI + i * 0.7)
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 0.32 + pulse * 0.08
    ctx.beginPath()
    ctx.arc(0, 0, site.radius + 10 + pulse * 3, 0, TAU)
    ctx.stroke()
    ctx.restore()
  }
}

export function renderSurfaceAliens(view: SurfaceAliensRenderView) {
  const { ctx, aliens, time, planetAlienCatalog, surfaceToScreen } = view
  for (const alien of aliens) {
    if (alien.resolved) continue
    if (alien.sprite === 'alienCatalog' && planetAlienCatalog.complete && planetAlienCatalog.naturalWidth > 0) {
      renderCatalogAlien(view, alien)
      continue
    }
    const p = surfaceToScreen(alien.x, alien.y)
    const bob = Math.sin(time * 2.4 + alien.phase) * 5
    ctx.save()
    ctx.translate(p.x, p.y + bob)
    ctx.strokeStyle = alien.color
    ctx.fillStyle = alien.color
    ctx.shadowColor = alien.color
    ctx.shadowBlur = 18
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(0, -8, 13, 23, Math.sin(alien.phase) * 0.25, 0, TAU)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, -30, 11, 0, TAU)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(-4, -31, 1.8, 0, TAU)
    ctx.arc(4, -31, 1.8, 0, TAU)
    ctx.arc(0, -25, 1.8, 0, TAU)
    ctx.fill()
    ctx.globalAlpha = 0.45
    ctx.beginPath()
    ctx.arc(0, -10, alien.radius + Math.sin(time * 3) * 3, 0, TAU)
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.beginPath()
    ctx.moveTo(-8, 10)
    ctx.lineTo(-16, 24)
    ctx.moveTo(8, 10)
    ctx.lineTo(16, 24)
    ctx.stroke()
    ctx.restore()
  }
}

function renderCatalogAlien(view: SurfaceAliensRenderView, alien: SurfaceAlienRenderModel) {
  const { ctx, time, allowGlow, planetAlienCatalog, surfaceToScreen } = view
  const p = surfaceToScreen(alien.x, alien.y)
  const sheet = planetAlienCatalog
  if (!sheet.complete || sheet.naturalWidth === 0) return
  const row = clamp(Math.floor(alien.spriteRow ?? 0), 0, ALIEN_CATALOG_ROWS - 1)
  const frame = Math.floor((time * 4 + alien.phase) % ALIEN_CATALOG_FRAMES)
  const sw = sheet.naturalWidth / ALIEN_CATALOG_FRAMES
  const sh = sheet.naturalHeight / ALIEN_CATALOG_ROWS
  const bob = Math.sin(time * 2.2 + alien.phase) * 5
  const scale = 0.48
  const dw = sw * scale
  const dh = sh * scale
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = 0.94
  ctx.shadowColor = alien.color
  ctx.shadowBlur = allowGlow ? 20 : 8
  ctx.drawImage(sheet, frame * sw, row * sh, sw, sh, p.x - dw / 2, p.y - dh * 0.58 + bob, dw, dh)
  ctx.globalAlpha = 0.55
  ctx.strokeStyle = '#8fff7d'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(p.x, p.y + bob, alien.radius + 12 + Math.sin(time * 3) * 3, 0, TAU)
  ctx.stroke()
  ctx.restore()
}
