import type { SpaceWaveWarning } from '../space-wave-director'

export interface SectorWaveWarningView {
  ctx: CanvasRenderingContext2D
  width: number
  glow: boolean
  warning: SpaceWaveWarning
}

export function renderSectorWaveWarning(view: SectorWaveWarningView) {
  const { ctx, width, glow, warning } = view
  const boxWidth = width < 560 ? Math.max(220, width - 48) : 360
  const boxX = width / 2 - boxWidth / 2
  const y = width < 560 ? 124 : 118
  const label = `SECTOR WAVE INBOUND // ${warning.label.toUpperCase()}`
  const details = `${Math.ceil(warning.secondsUntil)}s // ${warning.enemyTotal} CONTACT${warning.enemyTotal === 1 ? '' : 'S'}`

  ctx.save()
  ctx.globalCompositeOperation = glow ? 'lighter' : 'source-over'
  ctx.fillStyle = 'rgba(2, 8, 12, 0.72)'
  ctx.fillRect(boxX, y - 16, boxWidth, 48)
  ctx.strokeStyle = '#ff9f4a'
  ctx.shadowColor = '#ff9f4a'
  ctx.shadowBlur = glow ? 18 : 0
  ctx.lineWidth = 1.5
  ctx.strokeRect(boxX + 0.5, y - 15.5, boxWidth - 1, 47)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff27a'
  ctx.font = width < 560 ? '10px Courier New' : '12px Courier New'
  ctx.fillText(label, width / 2, y, boxWidth - 18)
  ctx.fillStyle = '#ffedf1'
  ctx.font = width < 560 ? '10px Courier New' : '11px Courier New'
  ctx.fillText(details, width / 2, y + 15, boxWidth - 18)
  ctx.globalAlpha = 0.28
  ctx.fillStyle = '#ff9f4a'
  ctx.fillRect(boxX + 12, y + 23, boxWidth - 24, 3)
  ctx.globalAlpha = 0.96
  ctx.fillRect(boxX + 12, y + 23, (boxWidth - 24) * warning.progress, 3)
  ctx.restore()
}
