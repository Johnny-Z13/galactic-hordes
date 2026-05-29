import type { Vec, Enemy, EnemyKind } from '../main-types'
import { TAU } from '../math-utils'
import { isGiantEnemyKind, isSpriteEnemyKind, spaceEnemyDefinitions, spriteEnemyKinds } from '../space-enemies'
import { damageFeedbackConfig } from '../combat/damage-feedback'
import { enemyHealthReadout } from './enemy-health-readout'

export interface EnemiesView {
  ctx: CanvasRenderingContext2D
  enemies: Enemy[]
  width: number
  height: number
  playerX: number
  playerY: number
  isHighLoad: boolean
  allowGlow: boolean
  scale: number
  spriteSheet: HTMLImageElement
  worldToScreen: (x: number, y: number) => Vec
}

export function renderEnemies(view: EnemiesView): void {
  const ctx = view.ctx
  const highLoad = view.isHighLoad
  if (highLoad) {
    renderHordeEnemies(view)
    renderPrioritySpriteEnemies(view)
    renderEnemyHealthReadouts(view)
    return
  }
  for (const e of view.enemies) {
    const p = view.worldToScreen(e.x, e.y)
    if (p.x < -90 || p.x > view.width + 90 || p.y < -90 || p.y > view.height + 90) continue
    if (isSpriteEnemyKind(e.kind)) {
      renderSpaceSpriteEnemy(view, e, p)
      continue
    }
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(e.phase)
    ctx.scale(view.scale, view.scale)
    ctx.strokeStyle = e.flash > 0 ? damageFeedbackConfig.hitFlash.color : e.color
    ctx.shadowColor = e.color
    ctx.shadowBlur = view.allowGlow ? 12 : 0
    ctx.lineWidth = e.kind === 'warden' || e.kind === 'brute' ? 3 : 2
    ctx.beginPath()
    if (e.kind === 'chaser') {
      for (let i = 0; i < 5; i += 1) {
        const a = (i / 5) * TAU
        const r = i % 2 ? e.radius * 0.62 : e.radius
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    } else if (e.kind === 'splinter') {
      ctx.moveTo(0, -e.radius)
      ctx.lineTo(e.radius, 0)
      ctx.lineTo(0, e.radius)
      ctx.lineTo(-e.radius, 0)
    } else if (e.kind === 'lancer') {
      ctx.moveTo(e.radius * 1.45, -e.radius * 0.1)
      ctx.lineTo(-e.radius * 0.72, -e.radius * 0.82)
      ctx.lineTo(-e.radius * 0.42, -e.radius * 0.28)
      ctx.lineTo(-e.radius * 1.08, 0)
      ctx.lineTo(-e.radius * 0.42, e.radius * 0.28)
      ctx.lineTo(-e.radius * 0.72, e.radius * 0.82)
      ctx.lineTo(e.radius * 0.42, e.radius * 0.36)
      ctx.lineTo(e.radius * 0.18, 0)
      ctx.lineTo(e.radius * 0.42, -e.radius * 0.36)
    } else if (e.kind === 'mine') {
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * TAU
        const r = i % 2 ? e.radius * 0.52 : e.radius
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    } else if (e.kind === 'brute') {
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * TAU
        const r = i % 2 ? e.radius * 0.7 : e.radius
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    } else if (e.kind === 'shooter') {
      ctx.moveTo(e.radius, 0)
      ctx.lineTo(e.radius * 0.25, e.radius * 0.72)
      ctx.lineTo(-e.radius * 0.85, e.radius * 0.44)
      ctx.lineTo(-e.radius * 0.85, -e.radius * 0.44)
      ctx.lineTo(e.radius * 0.25, -e.radius * 0.72)
    } else {
      for (let i = 0; i < 9; i += 1) {
        const a = (i / 9) * TAU
        const r = i % 2 ? e.radius * 0.58 : e.radius
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.stroke()
    if (e.kind === 'warden') {
      ctx.rotate(-e.phase * 1.7)
      ctx.beginPath()
      ctx.arc(0, 0, e.radius + 13, 0, TAU)
      ctx.stroke()
    } else if (e.kind === 'shooter') {
      ctx.beginPath()
      ctx.arc(0, 0, e.radius * 0.42, 0, TAU)
      ctx.stroke()
    }
    ctx.restore()
  }
  renderEnemyHealthReadouts(view)
}

function renderSpaceSpriteEnemy(view: EnemiesView, e: Enemy, p: Vec): void {
  const ctx = view.ctx
  const sheet = view.spriteSheet
  if (!sheet.complete || sheet.naturalWidth === 0) {
    renderEnemyLod(view, e, p)
    return
  }
  const row = spaceEnemyDefinitions[e.kind].spriteRow ?? 0
  const sw = sheet.naturalWidth / 4
  const sh = sheet.naturalHeight / spriteEnemyKinds.length
  const frame = Math.floor((e.phase * 8 + e.id) % 4)
  const speed = Math.hypot(e.vx, e.vy)
  const bossLike = e.kind === 'bulwark' || isGiantEnemyKind(e.kind)
  const angularLike = e.kind === 'shard'
  const angle = bossLike
    ? e.phase * 0.45
    : angularLike
      ? (speed > 8 ? Math.atan2(e.vy, e.vx) : Math.atan2(view.playerY - e.y, view.playerX - e.x)) + Math.sin(e.phase * 6) * 0.16
      : speed > 8
        ? Math.atan2(e.vy, e.vx)
        : Math.atan2(view.playerY - e.y, view.playerX - e.x)
  const spriteScale = (
    e.kind === 'cathedral' ? 3.95 :
    e.kind === 'dreadnought' ? 4.18 :
    e.kind === 'bulwark' ? 4.55 :
    e.kind === 'prism' ? 4.85 :
    e.kind === 'helix' ? 5.2 :
    e.kind === 'skimmer' ? 5.35 :
    e.kind === 'siphon' ? 5.25 :
    e.kind === 'shard' ? 6.15 :
    5.85
  ) * view.scale
  const dw = e.radius * spriteScale
  const dh = e.radius * spriteScale

  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(angle)
  ctx.shadowColor = e.color
  ctx.shadowBlur = view.allowGlow ? (bossLike ? 20 : 14) : 0
  ctx.globalAlpha = e.flash > 0 ? 0.92 : 1
  ctx.drawImage(sheet, frame * sw, row * sh, sw, sh, -dw / 2, -dh / 2, dw, dh)
  if (e.flash > 0) {
    ctx.globalAlpha = 0.45
    ctx.strokeStyle = damageFeedbackConfig.hitFlash.color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, e.radius * 1.35 * view.scale, 0, TAU)
    ctx.stroke()
  }
  ctx.restore()
}

function renderPrioritySpriteEnemies(view: EnemiesView): void {
  for (const e of view.enemies) {
    if (!isSpriteEnemyKind(e.kind)) continue
    const p = view.worldToScreen(e.x, e.y)
    const margin = isGiantEnemyKind(e.kind) ? 220 : 120
    if (p.x < -margin || p.x > view.width + margin || p.y < -margin || p.y > view.height + margin) continue
    renderSpaceSpriteEnemy(view, e, p)
  }
}

function renderEnemyHealthReadouts(view: EnemiesView): void {
  const ctx = view.ctx
  ctx.save()
  ctx.shadowBlur = 0
  for (const e of view.enemies) {
    const readout = enemyHealthReadout({
      enemy: e,
      highLoad: view.isHighLoad,
      scale: view.scale
    })
    if (!readout) continue
    const p = view.worldToScreen(e.x, e.y)
    if (p.x < -110 || p.x > view.width + 110 || p.y < -110 || p.y > view.height + 110) continue
    const x = p.x - readout.width / 2
    const y = p.y + readout.yOffset
    const fillWidth = Math.max(0, (readout.width - 2) * readout.fillRatio)
    ctx.save()
    ctx.globalAlpha = readout.alpha
    ctx.fillStyle = readout.trackColor
    ctx.strokeStyle = readout.strokeColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(x, y, readout.width, readout.height, readout.height / 2)
    ctx.fill()
    ctx.stroke()
    if (fillWidth > 0) {
      ctx.fillStyle = readout.fillColor
      ctx.beginPath()
      ctx.roundRect(x + 1, y + 1, fillWidth, Math.max(1, readout.height - 2), Math.max(1, (readout.height - 2) / 2))
      ctx.fill()
    }
    ctx.restore()
  }
  ctx.restore()
}

function renderHordeEnemies(view: EnemiesView): void {
  const ctx = view.ctx
  ctx.save()
  ctx.shadowBlur = 0
  ctx.lineWidth = 1.45
  strokeEnemyBatch(view, 'chaser', '#8fff7d')
  strokeEnemyBatch(view, 'splinter', '#70a8ff')
  strokeEnemyBatch(view, 'lancer', '#ff7a3d')
  strokeEnemyBatch(view, 'mine', '#ff5d73')
  strokeEnemyBatch(view, 'shooter', '#ff61d8')
  strokeEnemyBatch(view, 'razor', '#57fff3')
  strokeEnemyBatch(view, 'skimmer', '#ffe66d')
  strokeEnemyBatch(view, 'shard', '#a6ff4d')
  strokeEnemyBatch(view, 'helix', '#7df7ff')
  strokeEnemyBatch(view, 'prism', '#ff8cf0')
  strokeEnemyBatch(view, 'siphon', '#8fff7d')
  ctx.lineWidth = 2.4
  strokeEnemyBatch(view, 'brute', '#ff9d5c')
  strokeEnemyBatch(view, 'bulwark', '#f46cff')
  strokeEnemyBatch(view, 'dreadnought', '#ff5d73')
  strokeEnemyBatch(view, 'cathedral', '#d7fff7')
  strokeEnemyBatch(view, 'warden', '#b990ff')
  ctx.lineWidth = 1.8
  ctx.strokeStyle = damageFeedbackConfig.hitFlash.color
  ctx.beginPath()
  for (const e of view.enemies) {
    if (e.flash <= 0) continue
    if (isSpriteEnemyKind(e.kind)) continue
    const { x, y } = view.worldToScreen(e.x, e.y)
    if (x < -95 || x > view.width + 95 || y < -95 || y > view.height + 95) continue
    addEnemyGlyph(view, e, x, y)
  }
  ctx.stroke()
  ctx.restore()
}

function strokeEnemyBatch(view: EnemiesView, kind: EnemyKind, color: string): void {
  const ctx = view.ctx
  ctx.strokeStyle = color
  ctx.beginPath()
  for (const e of view.enemies) {
    if (e.kind !== kind || e.flash > 0) continue
    if (isSpriteEnemyKind(e.kind)) continue
    const { x, y } = view.worldToScreen(e.x, e.y)
    if (x < -95 || x > view.width + 95 || y < -95 || y > view.height + 95) continue
    addEnemyGlyph(view, e, x, y)
  }
  ctx.stroke()
}

function addEnemyGlyph(view: EnemiesView, e: Enemy, x: number, y: number): void {
  const ctx = view.ctx
  const r = e.radius * view.scale
  if (e.kind === 'lancer') {
    const dx = view.playerX - e.x
    const dy = view.playerY - e.y
    const m = Math.hypot(dx, dy) || 1
    const ux = dx / m
    const uy = dy / m
    const px = -uy
    const py = ux
    ctx.moveTo(x + ux * r * 1.45, y + uy * r * 1.45)
    ctx.lineTo(x - ux * r * 0.68 + px * r * 0.78, y - uy * r * 0.68 + py * r * 0.78)
    ctx.lineTo(x - ux * r * 0.36 + px * r * 0.28, y - uy * r * 0.36 + py * r * 0.28)
    ctx.lineTo(x - ux * r * 1.06, y - uy * r * 1.06)
    ctx.lineTo(x - ux * r * 0.36 - px * r * 0.28, y - uy * r * 0.36 - py * r * 0.28)
    ctx.lineTo(x - ux * r * 0.68 - px * r * 0.78, y - uy * r * 0.68 - py * r * 0.78)
    ctx.lineTo(x + ux * r * 0.25 - px * r * 0.44, y + uy * r * 0.25 - py * r * 0.44)
    ctx.lineTo(x + ux * r * 0.08, y + uy * r * 0.08)
    ctx.lineTo(x + ux * r * 0.25 + px * r * 0.44, y + uy * r * 0.25 + py * r * 0.44)
    ctx.closePath()
  } else if (e.kind === 'mine') {
    ctx.rect(x - r * 0.58, y - r * 0.58, r * 1.16, r * 1.16)
  } else if (e.kind === 'brute') {
    ctx.moveTo(x + r, y)
    for (let i = 1; i < 8; i += 1) {
      const a = (i / 8) * TAU
      const rr = i % 2 ? r * 0.7 : r
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
    }
    ctx.closePath()
  } else if (e.kind === 'shooter') {
    const dx = view.playerX - e.x
    const dy = view.playerY - e.y
    const m = Math.hypot(dx, dy) || 1
    const ux = dx / m
    const uy = dy / m
    const px = -uy
    const py = ux
    ctx.moveTo(x + ux * r, y + uy * r)
    ctx.lineTo(x + px * r * 0.72 - ux * r * 0.25, y + py * r * 0.72 - uy * r * 0.25)
    ctx.lineTo(x - ux * r * 0.88, y - uy * r * 0.88)
    ctx.lineTo(x - px * r * 0.72 - ux * r * 0.25, y - py * r * 0.72 - uy * r * 0.25)
    ctx.closePath()
  } else if (e.kind === 'razor') {
    const speed = Math.hypot(e.vx, e.vy)
    const ux = speed > 8 ? e.vx / speed : 1
    const uy = speed > 8 ? e.vy / speed : 0
    const px = -uy
    const py = ux
    ctx.moveTo(x + ux * r * 1.9, y + uy * r * 1.9)
    ctx.lineTo(x - ux * r * 1.15 + px * r * 0.72, y - uy * r * 1.15 + py * r * 0.72)
    ctx.lineTo(x - ux * r * 0.32, y - uy * r * 0.32)
    ctx.lineTo(x - ux * r * 1.15 - px * r * 0.72, y - uy * r * 1.15 - py * r * 0.72)
    ctx.closePath()
  } else if (e.kind === 'skimmer') {
    ctx.moveTo(x + r * 1.1, y - r * 0.55)
    ctx.lineTo(x - r * 0.2, y - r * 1.08)
    ctx.lineTo(x - r * 1.15, y - r * 0.35)
    ctx.lineTo(x - r * 0.88, y + r * 0.72)
    ctx.lineTo(x + r * 0.86, y + r * 0.72)
    ctx.closePath()
  } else if (e.kind === 'shard') {
    const speed = Math.hypot(e.vx, e.vy)
    const ux = speed > 8 ? e.vx / speed : 1
    const uy = speed > 8 ? e.vy / speed : 0
    const px = -uy
    const py = ux
    ctx.moveTo(x + ux * r * 2.05, y + uy * r * 2.05)
    ctx.lineTo(x - ux * r * 0.36 + px * r * 0.92, y - uy * r * 0.36 + py * r * 0.92)
    ctx.lineTo(x - ux * r * 1.28 + px * r * 0.22, y - uy * r * 1.28 + py * r * 0.22)
    ctx.lineTo(x - ux * r * 0.36 - px * r * 0.92, y - uy * r * 0.36 - py * r * 0.92)
    ctx.closePath()
  } else if (e.kind === 'helix') {
    ctx.moveTo(x + r * 0.98, y)
    ctx.bezierCurveTo(x + r * 0.45, y - r * 1.1, x - r * 0.55, y - r * 1.1, x - r * 0.98, y)
    ctx.bezierCurveTo(x - r * 0.45, y + r * 1.1, x + r * 0.55, y + r * 1.1, x + r * 0.98, y)
    ctx.moveTo(x - r * 0.72, y - r * 0.62)
    ctx.lineTo(x + r * 0.72, y + r * 0.62)
    ctx.moveTo(x - r * 0.72, y + r * 0.62)
    ctx.lineTo(x + r * 0.72, y - r * 0.62)
  } else if (e.kind === 'prism') {
    ctx.moveTo(x + r * 1.15, y)
    ctx.lineTo(x + r * 0.32, y + r * 0.96)
    ctx.lineTo(x - r * 0.92, y + r * 0.62)
    ctx.lineTo(x - r * 0.58, y - r * 0.92)
    ctx.lineTo(x + r * 0.42, y - r * 0.76)
    ctx.closePath()
    ctx.moveTo(x - r * 0.48, y)
    ctx.lineTo(x + r * 0.48, y)
  } else if (e.kind === 'bulwark') {
    ctx.moveTo(x + r, y)
    ctx.arc(x, y, r, 0, TAU)
    ctx.moveTo(x + r * 0.62, y)
    ctx.arc(x, y, r * 0.62, 0, TAU)
    ctx.moveTo(x, y - r * 0.78)
    ctx.lineTo(x + r * 0.62, y)
    ctx.lineTo(x, y + r * 0.78)
    ctx.lineTo(x - r * 0.62, y)
    ctx.closePath()
  } else if (e.kind === 'siphon') {
    ctx.moveTo(x + r * 1.08, y)
    ctx.arc(x, y, r * 1.08, 0, TAU)
    ctx.moveTo(x + r * 0.62, y)
    ctx.arc(x, y, r * 0.62, 0, Math.PI * 1.55)
    ctx.moveTo(x - r * 0.15, y - r * 0.78)
    ctx.lineTo(x + r * 0.72, y)
    ctx.lineTo(x - r * 0.15, y + r * 0.78)
  } else if (e.kind === 'dreadnought') {
    ctx.moveTo(x + r * 1.28, y)
    ctx.lineTo(x + r * 0.42, y + r * 0.82)
    ctx.lineTo(x - r * 0.95, y + r * 0.62)
    ctx.lineTo(x - r * 1.32, y)
    ctx.lineTo(x - r * 0.95, y - r * 0.62)
    ctx.lineTo(x + r * 0.42, y - r * 0.82)
    ctx.closePath()
    ctx.moveTo(x - r * 0.42, y)
    ctx.arc(x - r * 0.42, y, r * 0.34, 0, TAU)
  } else if (e.kind === 'cathedral') {
    ctx.moveTo(x, y - r * 1.22)
    ctx.lineTo(x + r * 0.86, y - r * 0.34)
    ctx.lineTo(x + r * 0.62, y + r * 0.92)
    ctx.lineTo(x, y + r * 1.22)
    ctx.lineTo(x - r * 0.62, y + r * 0.92)
    ctx.lineTo(x - r * 0.86, y - r * 0.34)
    ctx.closePath()
    ctx.moveTo(x, y - r * 0.68)
    ctx.lineTo(x + r * 0.42, y)
    ctx.lineTo(x, y + r * 0.68)
    ctx.lineTo(x - r * 0.42, y)
    ctx.closePath()
  } else if (e.kind === 'warden') {
    ctx.moveTo(x + r, y)
    ctx.arc(x, y, r, 0, TAU)
    ctx.moveTo(x + r + 12, y)
    ctx.arc(x, y, r + 12, 0, TAU)
  } else {
    ctx.moveTo(x, y - r)
    ctx.lineTo(x + r, y)
    ctx.lineTo(x, y + r)
    ctx.lineTo(x - r, y)
    ctx.closePath()
  }
}

function renderEnemyLod(view: EnemiesView, e: Enemy, p: Vec): void {
  const ctx = view.ctx
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(e.phase)
  ctx.scale(view.scale, view.scale)
  ctx.strokeStyle = e.flash > 0 ? damageFeedbackConfig.hitFlash.color : e.color
  ctx.lineWidth = 1.5
  const r = e.radius
  ctx.beginPath()
  if (e.kind === 'lancer') {
    ctx.moveTo(r * 1.45, 0)
    ctx.lineTo(-r * 0.68, r * 0.78)
    ctx.lineTo(-r * 0.36, r * 0.28)
    ctx.lineTo(-r * 1.06, 0)
    ctx.lineTo(-r * 0.36, -r * 0.28)
    ctx.lineTo(-r * 0.68, -r * 0.78)
    ctx.lineTo(r * 0.24, -r * 0.42)
    ctx.lineTo(r * 0.08, 0)
    ctx.lineTo(r * 0.24, r * 0.42)
  } else if (e.kind === 'mine') {
    ctx.rect(-r * 0.55, -r * 0.55, r * 1.1, r * 1.1)
  } else if (e.kind === 'brute') {
    ctx.moveTo(r, 0)
    for (let i = 1; i < 8; i += 1) {
      const a = (i / 8) * TAU
      const rr = i % 2 ? r * 0.7 : r
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
    }
    ctx.closePath()
  } else if (e.kind === 'shooter') {
    ctx.moveTo(r, 0)
    ctx.lineTo(r * 0.22, r * 0.72)
    ctx.lineTo(-r * 0.9, 0)
    ctx.lineTo(r * 0.22, -r * 0.72)
    ctx.closePath()
  } else if (e.kind === 'razor') {
    ctx.moveTo(r * 1.8, 0)
    ctx.lineTo(-r * 1.05, r * 0.7)
    ctx.lineTo(-r * 0.32, 0)
    ctx.lineTo(-r * 1.05, -r * 0.7)
    ctx.closePath()
  } else if (e.kind === 'skimmer') {
    ctx.moveTo(r * 1.1, -r * 0.55)
    ctx.lineTo(-r * 0.2, -r * 1.05)
    ctx.lineTo(-r * 1.1, -r * 0.35)
    ctx.lineTo(-r * 0.85, r * 0.7)
    ctx.lineTo(r * 0.85, r * 0.7)
    ctx.closePath()
  } else if (e.kind === 'shard') {
    ctx.moveTo(r * 1.95, 0)
    ctx.lineTo(-r * 0.35, r * 0.88)
    ctx.lineTo(-r * 1.22, r * 0.18)
    ctx.lineTo(-r * 0.35, -r * 0.88)
    ctx.closePath()
  } else if (e.kind === 'helix') {
    ctx.moveTo(r, 0)
    ctx.bezierCurveTo(r * 0.45, -r * 1.05, -r * 0.55, -r * 1.05, -r, 0)
    ctx.bezierCurveTo(-r * 0.45, r * 1.05, r * 0.55, r * 1.05, r, 0)
    ctx.moveTo(-r * 0.68, -r * 0.55)
    ctx.lineTo(r * 0.68, r * 0.55)
  } else if (e.kind === 'prism') {
    ctx.moveTo(r * 1.12, 0)
    ctx.lineTo(r * 0.32, r * 0.92)
    ctx.lineTo(-r * 0.9, r * 0.58)
    ctx.lineTo(-r * 0.58, -r * 0.88)
    ctx.lineTo(r * 0.42, -r * 0.72)
    ctx.closePath()
  } else if (e.kind === 'bulwark') {
    ctx.moveTo(r, 0)
    ctx.arc(0, 0, r, 0, TAU)
    ctx.moveTo(r * 0.62, 0)
    ctx.arc(0, 0, r * 0.62, 0, TAU)
  } else {
    ctx.moveTo(0, -r)
    ctx.lineTo(r, 0)
    ctx.lineTo(0, r)
    ctx.lineTo(-r, 0)
    ctx.closePath()
  }
  ctx.stroke()
  ctx.restore()
}
