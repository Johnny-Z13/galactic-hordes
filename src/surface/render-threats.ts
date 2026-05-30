import type { Vec } from '../main-types'
import { damageFeedbackConfig, hitFlashColor } from '../combat/damage-feedback'
import { clamp, TAU } from '../math-utils'
import { planetBossCatalogVariants } from '../surface-balance'

const BOSS_CATALOG_ROWS = planetBossCatalogVariants.length
const BOSS_CATALOG_FRAMES = 4

export interface SurfaceThreatRenderModel {
  x: number
  y: number
  radius: number
  phase: number
  color: string
  hit: number
  sprite?: 'glassMiteOracle' | 'bossCatalog'
  spriteRow?: number
}

export interface SurfaceThreatsView {
  ctx: CanvasRenderingContext2D
  threats: SurfaceThreatRenderModel[]
  time: number
  allowGlow: boolean
  glassMiteOracleSheet: HTMLImageElement
  planetBossCatalog: HTMLImageElement
  surfaceToScreen: (x: number, y: number) => Vec
}

export function renderSurfaceThreats(view: SurfaceThreatsView): void {
  for (const threat of view.threats) {
    if (threat.sprite === 'glassMiteOracle') {
      renderGlassMiteOracleThreat(view, threat)
      continue
    }
    if (threat.sprite === 'bossCatalog') {
      renderCatalogBossThreat(view, threat)
      continue
    }
    const p = view.surfaceToScreen(threat.x, threat.y)
    const ctx = view.ctx
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(threat.phase)
    ctx.strokeStyle = hitFlashColor(threat.hit > 0, threat.color)
    ctx.shadowColor = threat.color
    ctx.shadowBlur = 18
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i < 7; i += 1) {
      const a = (i / 7) * TAU
      const radius = i % 2 ? threat.radius * 0.45 : threat.radius
      const x = Math.cos(a) * radius
      const y = Math.sin(a) * radius
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }
}

function renderGlassMiteOracleThreat(view: SurfaceThreatsView, threat: SurfaceThreatRenderModel): void {
  const ctx = view.ctx
  const p = view.surfaceToScreen(threat.x, threat.y)
  const sheet = view.glassMiteOracleSheet
  if (!sheet.complete || sheet.naturalWidth === 0) {
    renderFallbackMite(view, threat, p)
    return
  }
  const frameCount = 5
  const frame = Math.floor((view.time * 8 + threat.phase) % frameCount)
  const sw = sheet.naturalWidth / frameCount
  const sh = sheet.naturalHeight
  const bob = Math.sin(view.time * 5 + threat.phase) * 3
  const scale = threat.hit > 0 ? 0.475 : 0.46
  const dw = sw * scale
  const dh = sh * scale
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = threat.hit > 0 ? 0.96 : 0.92
  ctx.shadowColor = '#57fff3'
  ctx.shadowBlur = view.allowGlow ? 20 : 8
  ctx.drawImage(sheet, frame * sw, 0, sw, sh, p.x - dw / 2, p.y - dh * 0.54 + bob, dw, dh)
  if (threat.hit > 0) {
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = 0.16
    ctx.fillStyle = damageFeedbackConfig.hitFlash.color
    ctx.beginPath()
    ctx.arc(p.x, p.y - 14 + bob, threat.radius + 14, 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}

function renderCatalogBossThreat(view: SurfaceThreatsView, threat: SurfaceThreatRenderModel): void {
  const ctx = view.ctx
  const p = view.surfaceToScreen(threat.x, threat.y)
  const sheet = view.planetBossCatalog
  if (!sheet.complete || sheet.naturalWidth === 0) {
    renderFallbackMite(view, threat, p)
    return
  }
  const row = clamp(Math.floor(threat.spriteRow ?? 0), 0, BOSS_CATALOG_ROWS - 1)
  const frame = Math.floor((view.time * 6 + threat.phase) % BOSS_CATALOG_FRAMES)
  const sw = sheet.naturalWidth / BOSS_CATALOG_FRAMES
  const sh = sheet.naturalHeight / BOSS_CATALOG_ROWS
  const bob = Math.sin(view.time * 3.2 + threat.phase) * 4
  const scale = threat.hit > 0 ? 0.56 : 0.54
  const dw = sw * scale
  const dh = sh * scale
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = threat.hit > 0 ? 0.98 : 0.94
  ctx.shadowColor = threat.color
  ctx.shadowBlur = view.allowGlow ? 24 : 8
  ctx.drawImage(sheet, frame * sw, row * sh, sw, sh, p.x - dw / 2, p.y - dh * 0.55 + bob, dw, dh)
  ctx.globalAlpha = 0.45
  ctx.strokeStyle = threat.color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(p.x, p.y + bob, threat.radius + 9 + Math.sin(view.time * 4 + threat.phase) * 4, 0, TAU)
  ctx.stroke()
  ctx.restore()
}

function renderFallbackMite(view: SurfaceThreatsView, threat: SurfaceThreatRenderModel, p: Vec): void {
  const ctx = view.ctx
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.strokeStyle = hitFlashColor(threat.hit > 0, '#57fff3')
  ctx.shadowColor = '#57fff3'
  ctx.shadowBlur = 16
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, -34)
  ctx.lineTo(22, -2)
  ctx.lineTo(10, 25)
  ctx.lineTo(-12, 24)
  ctx.lineTo(-22, -2)
  ctx.closePath()
  ctx.stroke()
  ctx.strokeStyle = hitFlashColor(threat.hit > 0, '#fff27a')
  ctx.beginPath()
  ctx.moveTo(-14, 16)
  ctx.lineTo(-34, 34)
  ctx.moveTo(14, 16)
  ctx.lineTo(34, 34)
  ctx.stroke()
  ctx.restore()
}
