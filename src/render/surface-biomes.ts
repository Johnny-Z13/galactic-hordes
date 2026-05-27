import type { Vec } from '../main-types'
import type { PlanetBiomeProfile } from '../planet-biomes'
import { TAU } from '../math-utils'

export interface SurfaceBiomeView {
  ctx: CanvasRenderingContext2D
  biome: PlanetBiomeProfile
  seed: number
  glow: boolean
  surfaceWidth: number
  surfaceHeight: number
  viewWidth: number
  viewHeight: number
  surfaceToScreen: (x: number, y: number) => Vec
}

export function renderSurfaceBiomeMotifs(view: SurfaceBiomeView): void {
  const ctx = view.ctx
  const biome = view.biome
  const seed = view.seed
  const glow = view.glow
  ctx.save()
  ctx.globalCompositeOperation = glow ? 'screen' : 'source-over'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = biome.baseColor
  ctx.fillStyle = biome.shadowColor
  ctx.shadowColor = biome.accentColor
  ctx.shadowBlur = glow ? 12 : 0

  if (biome.surfaceMotif === 'canopy') {
    ctx.globalAlpha = 0.24
    for (let i = 0; i < 18; i += 1) {
      const x = (seed + i * 211) % view.surfaceWidth
      const y = 120 + ((seed >>> 3) + i * 157) % (view.surfaceHeight - 220)
      const p = view.surfaceToScreen(x, y)
      if (p.x < -90 || p.x > view.viewWidth + 90 || p.y < -90 || p.y > view.viewHeight + 90) continue
      const height = 56 + (i % 5) * 12
      ctx.strokeStyle = biome.shadowColor
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(p.x, p.y + height * 0.55)
      ctx.lineTo(p.x + Math.sin(i) * 8, p.y - height * 0.45)
      ctx.stroke()
      ctx.strokeStyle = i % 2 ? biome.baseColor : biome.accentColor
      ctx.lineWidth = 2
      for (let j = 0; j < 3; j += 1) {
        ctx.beginPath()
        ctx.arc(p.x + (j - 1) * 18, p.y - height * 0.42 + j * 6, 22 + j * 4, Math.PI * 1.05, Math.PI * 1.95)
        ctx.stroke()
      }
    }
  } else if (biome.surfaceMotif === 'dunes') {
    ctx.globalAlpha = 0.32
    ctx.strokeStyle = biome.accentColor
    ctx.lineWidth = 2
    for (let i = 0; i < 9; i += 1) {
      const y = 120 + i * 128 + (seed % 41)
      const start = view.surfaceToScreen(0, y)
      ctx.beginPath()
      for (let x = 0; x <= view.surfaceWidth; x += 120) {
        const p = view.surfaceToScreen(x, y + Math.sin((x + seed) * 0.01 + i) * 22)
        if (x === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      }
      if (start.y > -80 && start.y < view.viewHeight + 80) ctx.stroke()
    }
  } else if (biome.surfaceMotif === 'islands') {
    ctx.globalAlpha = 0.26
    for (let i = 0; i < 10; i += 1) {
      const x = 120 + ((seed >>> 2) + i * 173) % (view.surfaceWidth - 240)
      const y = 140 + ((seed >>> 5) + i * 131) % (view.surfaceHeight - 260)
      const p = view.surfaceToScreen(x, y)
      if (p.x < -100 || p.x > view.viewWidth + 100 || p.y < -100 || p.y > view.viewHeight + 100) continue
      ctx.strokeStyle = i % 2 ? biome.accentColor : biome.baseColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(p.x, p.y, 48 + (i % 3) * 14, 16 + (i % 2) * 8, i * 0.4, 0, TAU)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(p.x + 10, p.y - 8)
      ctx.lineTo(p.x + 22, p.y - 44)
      ctx.moveTo(p.x + 22, p.y - 44)
      ctx.lineTo(p.x + 44, p.y - 34)
      ctx.moveTo(p.x + 22, p.y - 44)
      ctx.lineTo(p.x + 4, p.y - 32)
      ctx.stroke()
    }
  } else if (biome.surfaceMotif === 'ice') {
    ctx.globalAlpha = 0.28
    ctx.strokeStyle = biome.baseColor
    ctx.lineWidth = 2
    for (let i = 0; i < 12; i += 1) {
      const x = 80 + ((seed >>> 1) + i * 137) % (view.surfaceWidth - 160)
      const y = 100 + ((seed >>> 4) + i * 197) % (view.surfaceHeight - 200)
      const p = view.surfaceToScreen(x, y)
      if (p.x < -80 || p.x > view.viewWidth + 80 || p.y < -80 || p.y > view.viewHeight + 80) continue
      ctx.beginPath()
      ctx.moveTo(p.x - 36, p.y - 18)
      ctx.lineTo(p.x - 8, p.y + 6)
      ctx.lineTo(p.x + 16, p.y - 28)
      ctx.lineTo(p.x + 42, p.y + 20)
      ctx.stroke()
    }
  } else if (biome.surfaceMotif === 'lava') {
    ctx.globalAlpha = 0.34
    ctx.strokeStyle = biome.accentColor
    ctx.lineWidth = 3
    for (let i = 0; i < 11; i += 1) {
      const x = 80 + ((seed >>> 2) + i * 149) % (view.surfaceWidth - 160)
      const y = 100 + ((seed >>> 6) + i * 163) % (view.surfaceHeight - 200)
      const p = view.surfaceToScreen(x, y)
      if (p.x < -100 || p.x > view.viewWidth + 100 || p.y < -100 || p.y > view.viewHeight + 100) continue
      ctx.beginPath()
      ctx.moveTo(p.x - 42, p.y - 22)
      ctx.lineTo(p.x - 12, p.y - 4)
      ctx.lineTo(p.x + 4, p.y + 26)
      ctx.lineTo(p.x + 40, p.y + 38)
      ctx.stroke()
      ctx.globalAlpha = 0.16
      ctx.fillStyle = biome.accentColor
      ctx.beginPath()
      ctx.arc(p.x, p.y, 22 + (i % 4) * 5, 0, TAU)
      ctx.fill()
      ctx.globalAlpha = 0.34
    }
  } else if (biome.surfaceMotif === 'reef') {
    ctx.globalAlpha = 0.26
    ctx.strokeStyle = biome.accentColor
    ctx.lineWidth = 2
    for (let i = 0; i < 16; i += 1) {
      const x = 90 + ((seed >>> 2) + i * 97) % (view.surfaceWidth - 180)
      const y = 160 + ((seed >>> 5) + i * 151) % (view.surfaceHeight - 280)
      const p = view.surfaceToScreen(x, y)
      if (p.x < -80 || p.x > view.viewWidth + 80 || p.y < -80 || p.y > view.viewHeight + 80) continue
      ctx.beginPath()
      ctx.moveTo(p.x, p.y + 26)
      ctx.quadraticCurveTo(p.x - 16, p.y - 4, p.x + Math.sin(i) * 20, p.y - 34)
      ctx.moveTo(p.x, p.y + 8)
      ctx.lineTo(p.x + 20, p.y - 10)
      ctx.moveTo(p.x - 4, p.y - 4)
      ctx.lineTo(p.x - 22, p.y - 20)
      ctx.stroke()
    }
  } else if (biome.surfaceMotif === 'crystals') {
    ctx.globalAlpha = 0.3
    for (let i = 0; i < 14; i += 1) {
      const x = 100 + ((seed >>> 3) + i * 127) % (view.surfaceWidth - 200)
      const y = 120 + ((seed >>> 6) + i * 181) % (view.surfaceHeight - 240)
      const p = view.surfaceToScreen(x, y)
      if (p.x < -80 || p.x > view.viewWidth + 80 || p.y < -80 || p.y > view.viewHeight + 80) continue
      ctx.strokeStyle = i % 2 ? biome.baseColor : biome.accentColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(p.x, p.y - 46)
      ctx.lineTo(p.x + 18, p.y + 18)
      ctx.lineTo(p.x, p.y + 34)
      ctx.lineTo(p.x - 18, p.y + 18)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(p.x, p.y - 46)
      ctx.lineTo(p.x, p.y + 34)
      ctx.stroke()
    }
  } else {
    ctx.globalAlpha = 0.24
    ctx.strokeStyle = biome.baseColor
    ctx.lineWidth = 2
    for (let i = 0; i < 12; i += 1) {
      const x = 110 + ((seed >>> 2) + i * 167) % (view.surfaceWidth - 220)
      const y = 120 + ((seed >>> 5) + i * 139) % (view.surfaceHeight - 240)
      const p = view.surfaceToScreen(x, y)
      if (p.x < -90 || p.x > view.viewWidth + 90 || p.y < -90 || p.y > view.viewHeight + 90) continue
      const h = 42 + (i % 4) * 14
      ctx.beginPath()
      ctx.moveTo(p.x - 24, p.y + h)
      ctx.lineTo(p.x - 24, p.y - h)
      ctx.lineTo(p.x + 24, p.y - h)
      ctx.lineTo(p.x + 24, p.y + h)
      ctx.moveTo(p.x - 36, p.y + h)
      ctx.lineTo(p.x + 36, p.y + h)
      ctx.stroke()
    }
  }
  ctx.restore()
}
