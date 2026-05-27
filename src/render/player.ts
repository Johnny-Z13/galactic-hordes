import type { Vec } from '../main-types'
import type { LimitId, UpgradeId } from '../powerup-balance'
import { powerupBalance } from '../powerup-balance'
import { len, TAU } from '../math-utils'
import { navigationTrailProfile } from '../navigation-cruise'
import { starterSignatureFlags } from '../weapon-signatures'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export interface PlayerRenderState {
  x: number
  y: number
  angle: number
  aimAngle: number
  radius: number
  vx: number
  vy: number
  dashTime: number
  pickupAbsorbPulse: number
  speed: number
  invuln: number
  shield: number
  maxShield: number
}

export interface PlayerView {
  ctx: CanvasRenderingContext2D
  player: PlayerRenderState
  build: Record<UpgradeId, number>
  limitBreaks: Record<LimitId, number>
  evolvedSize: number
  graphicsMode: 'LOW' | 'MED' | 'GLOW'
  allowGlow: boolean
  time: number
  scale: number
  worldToScreen: (x: number, y: number) => Vec
}

export function renderPlayer(view: PlayerView): void {
  const ctx = view.ctx
  const p = view.worldToScreen(view.player.x, view.player.y)
  const scale = view.scale
  const a = view.player.angle
  const engineGlow = view.build.engine + view.build.heat + view.limitBreaks.speed * 0.2
  const weaponGlow = view.build.rapid + view.build.split + view.build.rail + view.build.rift + view.build.orbit
  const hullGlow = view.build.repair + view.limitBreaks.hull
  const navGlow = view.build.nav
  const signature = starterSignatureFlags(view.build)
  const travelSpeed = len(view.player.vx, view.player.vy)
  const dashActive = view.player.dashTime > 0
  const absorbPulse = view.player.pickupAbsorbPulse
  const speedCap = view.player.speed
    + view.build.engine * powerupBalance.ship.maxSpeedPerEngineRank
    + view.build.nav * powerupBalance.ship.maxSpeedPerNavRank
  const trail = navigationTrailProfile({ navRank: navGlow, speedRatio: speedCap > 0 ? travelSpeed / speedCap : 0 })
  const hullColor = view.evolvedSize > 0 ? '#fff27a' : weaponGlow > 8 ? '#f6fffe' : '#57fff3'
  const exhaustColor = view.build.heat >= 3 ? '#ff9d5c' : navGlow >= 5 ? '#fff27a' : view.build.engine >= 3 || navGlow > 0 ? '#70a8ff' : '#57fff3'
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(a)
  ctx.scale(scale, scale)
  if (dashActive) {
    const dashColor = view.build.phase >= 2 ? '#b990ff' : view.build.engine >= 4 ? '#fff27a' : '#70a8ff'
    ctx.save()
    ctx.globalCompositeOperation = view.allowGlow ? 'lighter' : 'source-over'
    ctx.strokeStyle = dashColor
    ctx.shadowColor = dashColor
    ctx.shadowBlur = view.graphicsMode === 'LOW' ? 0 : 24 + view.build.engine * 2
    ctx.lineWidth = 2.4 + Math.min(2.2, view.build.engine * 0.28)
    ctx.globalAlpha = dashActive ? 0.7 : 0.32
    ctx.beginPath()
    ctx.moveTo(-16, -13)
    ctx.lineTo(-58 - view.build.engine * 7, -28 - view.build.phase * 4)
    ctx.lineTo(-38 - view.build.engine * 5, 0)
    ctx.lineTo(-58 - view.build.engine * 7, 28 + view.build.phase * 4)
    ctx.lineTo(-16, 13)
    ctx.stroke()
    ctx.globalAlpha = 0.35
    ctx.beginPath()
    ctx.arc(0, 0, 30 + view.build.engine * 3 + Math.sin(view.time * 24) * 3, -0.85, 0.85)
    ctx.stroke()
    ctx.restore()
  }
  if (travelSpeed > 22) {
    ctx.save()
    ctx.globalCompositeOperation = view.allowGlow ? 'lighter' : 'source-over'
    ctx.shadowColor = trail.color
    ctx.shadowBlur = view.graphicsMode === 'LOW' ? 0 : 12 + trail.tier * 4
    ctx.lineWidth = 1.2 + trail.tier * 0.35
    for (let i = 0; i < trail.bands; i += 1) {
      const offset = (i - (trail.bands - 1) / 2) * (5 + trail.tier * 2)
      const wobble = Math.sin(view.time * (7 + i) + i * 1.7) * (2 + trail.tier)
      ctx.globalAlpha = trail.alpha * (1 - i * 0.12)
      ctx.strokeStyle = i === 0 ? trail.color : trail.accent
      ctx.beginPath()
      ctx.moveTo(-13, offset * 0.42)
      ctx.lineTo(-trail.length * 0.54, offset + wobble)
      ctx.lineTo(-trail.length, offset * 0.35 - wobble * 0.65)
      ctx.stroke()
    }
    if (trail.tier >= 2) {
      ctx.globalAlpha = trail.alpha * 0.42
      ctx.strokeStyle = trail.accent
      ctx.beginPath()
      ctx.arc(-trail.length * 0.46, 0, 10 + trail.tier * 4 + Math.sin(view.time * 9) * 1.5, -0.75, 0.75)
      ctx.stroke()
    }
    ctx.restore()
  }
  ctx.strokeStyle = view.player.invuln > 0 ? '#fff27a' : hullColor
  ctx.shadowColor = hullColor
  ctx.shadowBlur = dashActive ? 24 + Math.min(12, engineGlow * 1.4) : 14 + Math.min(8, weaponGlow)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(24, 0)
  ctx.lineTo(-15, -13)
  ctx.lineTo(-8, 0)
  ctx.lineTo(-15, 13)
  ctx.closePath()
  ctx.stroke()
  if (signature.prismFins || signature.eliteLance) {
    ctx.strokeStyle = view.build.rail > 0 ? '#fff27a' : '#70a8ff'
    ctx.beginPath()
    ctx.moveTo(2, -12)
    ctx.lineTo(16 + Math.min(10, view.build.rail * 2), -20 - Math.min(8, view.build.split))
    ctx.moveTo(2, 12)
    ctx.lineTo(16 + Math.min(10, view.build.rail * 2), 20 + Math.min(8, view.build.split))
    ctx.stroke()
  }
  if (signature.pulseWake) {
    ctx.strokeStyle = signature.heatBloom ? '#ff9d5c' : '#57fff3'
    ctx.globalAlpha = 0.48
    ctx.beginPath()
    ctx.arc(16, 0, 9 + Math.sin(view.time * 12) * 2, -0.9, 0.9)
    ctx.moveTo(6, -7)
    ctx.lineTo(22, -3)
    ctx.moveTo(6, 7)
    ctx.lineTo(22, 3)
    ctx.stroke()
    ctx.globalAlpha = 1
  }
  if (signature.engineChevrons) {
    ctx.strokeStyle = '#70a8ff'
    ctx.globalAlpha = 0.42
    ctx.beginPath()
    for (let i = 0; i < 2; i += 1) {
      const x = -21 - i * 7
      ctx.moveTo(x, -10)
      ctx.lineTo(x - 6, 0)
      ctx.lineTo(x, 10)
    }
    ctx.stroke()
    ctx.globalAlpha = 1
  }
  if (hullGlow > 0) {
    ctx.strokeStyle = '#8fff7d'
    ctx.globalAlpha = 0.72
    ctx.beginPath()
    ctx.moveTo(-8, -8)
    ctx.lineTo(6, -4)
    ctx.moveTo(-8, 8)
    ctx.lineTo(6, 4)
    ctx.stroke()
    ctx.globalAlpha = 1
  }
  if (absorbPulse > 0) {
    ctx.save()
    ctx.globalCompositeOperation = view.allowGlow ? 'lighter' : 'source-over'
    ctx.strokeStyle = '#70a8ff'
    ctx.shadowColor = '#57fff3'
    ctx.shadowBlur = view.graphicsMode === 'LOW' ? 0 : 18 + absorbPulse * 18
    ctx.lineWidth = 1.4 + absorbPulse * 2.2
    ctx.globalAlpha = clamp(absorbPulse * 2.8, 0, 0.9)
    ctx.beginPath()
    ctx.arc(0, 0, 26 + absorbPulse * 34, 0, TAU)
    ctx.stroke()
    ctx.globalAlpha = clamp(absorbPulse * 1.8, 0, 0.52)
    ctx.beginPath()
    ctx.arc(15, 0, 7 + absorbPulse * 15, -0.95, 0.95)
    ctx.stroke()
    ctx.restore()
  }
  if (navGlow > 0) {
    ctx.strokeStyle = navGlow >= 6 ? '#fff27a' : '#70a8ff'
    ctx.globalAlpha = 0.35 + Math.min(0.25, navGlow * 0.035)
    ctx.beginPath()
    ctx.arc(-2, 0, 19 + navGlow * 1.8 + Math.sin(view.time * 7) * 1.5, -0.8, 0.8)
    ctx.stroke()
    ctx.globalAlpha = 1
  }
  ctx.beginPath()
  ctx.moveTo(-16, -8)
  ctx.strokeStyle = exhaustColor
  ctx.shadowColor = exhaustColor
  ctx.lineTo(-28 - Math.random() * (8 + engineGlow * 2 + (dashActive ? 22 + view.build.engine * 4 : 0)), 0)
  ctx.lineTo(-16, 8)
  ctx.stroke()
  if (view.build.phase > 0) {
    ctx.globalAlpha = 0.35
    ctx.strokeStyle = '#b990ff'
    ctx.beginPath()
    ctx.arc(0, 0, 28 + Math.sin(view.time * 8) * 2, 0, TAU)
    ctx.stroke()
  }
  ctx.restore()

  if (view.player.maxShield > 0 && view.player.shield > 1) {
    ctx.save()
    ctx.strokeStyle = `rgba(112,168,255,${0.25 + view.player.shield / view.player.maxShield * 0.42})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(p.x, p.y, (view.player.radius + 10) * scale, 0, TAU)
    ctx.stroke()
    if (signature.shieldHalo) {
      ctx.strokeStyle = 'rgba(143,255,125,0.42)'
      ctx.setLineDash([5 * scale, 6 * scale])
      ctx.beginPath()
      ctx.arc(p.x, p.y, (view.player.radius + 18 + view.build.shield * 2) * scale, 0, TAU)
      ctx.stroke()
      ctx.setLineDash([])
    }
    ctx.restore()
  }

  if (signature.salvageField) {
    ctx.save()
    ctx.strokeStyle = 'rgba(255,242,122,0.24)'
    ctx.shadowColor = '#fff27a'
    ctx.shadowBlur = view.allowGlow ? 10 : 0
    ctx.lineWidth = 1
    ctx.setLineDash([4 * scale, 10 * scale])
    ctx.beginPath()
    ctx.arc(p.x, p.y, (view.player.radius + 34 + view.build.magnet * 4 + Math.sin(view.time * 4) * 2) * scale, 0, TAU)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }

  ctx.save()
  ctx.strokeStyle = 'rgba(255,242,122,0.52)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(p.x, p.y)
  ctx.lineTo(p.x + Math.cos(view.player.aimAngle) * 58 * scale, p.y + Math.sin(view.player.aimAngle) * 58 * scale)
  ctx.stroke()
  ctx.restore()
}
