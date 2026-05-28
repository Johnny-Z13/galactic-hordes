import type { SurfaceEventKind, SurfaceScenarioKind } from '../surface-encounters'
import { surfaceWavePressureReadout, type SurfaceWaveState } from './wave-director'

export interface SurfaceHudWaveTelegraph {
  spawnCount: number
}

export interface SurfaceHudRenderView {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  planetName: string
  scenario: SurfaceScenarioKind
  event: SurfaceEventKind
  collected: number
  resourceCount: number
  message: string
  nearShip: boolean
  nearLoreTitle: string | null
  nearAlienName: string | null
  wave: SurfaceWaveState
  waveTelegraphs: SurfaceHudWaveTelegraph[]
  activeThreats: number
  o2Returning: boolean
  allowGlow: boolean
}

export function renderSurfaceHud(view: SurfaceHudRenderView) {
  const { ctx } = view
  ctx.save()
  ctx.fillStyle = '#fff27a'
  ctx.shadowColor = '#fff27a'
  ctx.shadowBlur = 12
  ctx.font = view.width < 560 ? '12px Courier New' : '14px Courier New'
  ctx.textAlign = 'center'
  const message = view.nearLoreTitle
    ? `PRESS E / Y TO INSPECT: ${view.nearLoreTitle}`
    : view.nearAlienName
      ? `PRESS E / Y TO SPEAK: ${view.nearAlienName}`
      : view.nearShip
        ? 'PRESS E / Y TO BOARD SHIP'
        : view.message
  if (view.width < 560) {
    ctx.font = '11px Courier New'
    ctx.fillText(`${view.planetName} // ${surfaceScenarioLabel(view.scenario)}`, view.width / 2, 78, view.width - 24)
    ctx.fillText(`${surfaceEventLabel(view.event)} // ${view.collected}/${view.resourceCount} SIGNALS`, view.width / 2, 94, view.width - 24)
  } else {
    ctx.fillText(`${view.planetName} // ${surfaceScenarioLabel(view.scenario)} // ${surfaceEventLabel(view.event)} // ${view.collected}/${view.resourceCount} SIGNALS`, view.width / 2, 86, view.width - 16)
  }
  renderSurfacePressureHud(view)
  const actionInset = view.width < 560 ? 132 : 0
  const messageX = actionInset ? (view.width - actionInset) / 2 : view.width / 2
  ctx.font = view.width < 560 ? '11px Courier New' : '14px Courier New'
  ctx.fillText(message, messageX, view.width < 560 ? view.height - 72 : view.height - 42, view.width - actionInset - 18)
  ctx.restore()
}

function renderSurfacePressureHud(view: SurfaceHudRenderView) {
  const queuedThreats = view.waveTelegraphs.reduce((total, telegraph) => total + telegraph.spawnCount, 0)
  const readout = surfaceWavePressureReadout({
    wave: view.wave,
    event: view.event,
    scenario: view.scenario,
    activeThreats: view.activeThreats,
    queuedThreats,
    o2Returning: view.o2Returning
  })
  const color = readout.label === 'INCOMING' || readout.label === 'SATURATED'
    ? '#ff5d73'
    : readout.label === 'RISING'
      ? '#ff9f4a'
      : readout.label === 'RETURN'
        ? '#57fff3'
        : '#8fff7d'
  const barWidth = view.width < 560 ? Math.max(132, Math.min(220, view.width - 154)) : 300
  const barHeight = view.width < 560 ? 4 : 5
  const x = view.width / 2 - barWidth / 2
  const y = view.width < 560 ? 108 : 101
  const label = readout.queuedThreats > 0
    ? `PRESSURE ${readout.label} x${readout.queuedThreats}`
    : `PRESSURE ${readout.label} ${readout.activeThreats}/${readout.threatCap}`

  const { ctx } = view
  ctx.save()
  ctx.font = view.width < 560 ? '10px Courier New' : '11px Courier New'
  ctx.textAlign = 'center'
  ctx.shadowColor = color
  ctx.shadowBlur = view.allowGlow ? 10 : 0
  ctx.fillStyle = color
  ctx.fillText(label, view.width / 2, y, barWidth + 24)
  ctx.globalAlpha = 0.26
  ctx.fillRect(x, y + 6, barWidth, barHeight)
  ctx.globalAlpha = 0.92
  ctx.fillRect(x, y + 6, barWidth * readout.progress, barHeight)
  ctx.restore()
}

function surfaceEventLabel(event: SurfaceEventKind) {
  return {
    jackpot: 'JACKPOT',
    horde: 'HORDE VAULT',
    swarm: 'INFESTED',
    relic: 'RELIC SITE',
    repair: 'SAFE DOCK',
    volatile: 'VOLATILE',
    standard: 'UNKNOWN'
  }[event]
}

function surfaceScenarioLabel(scenario: SurfaceScenarioKind) {
  return {
    salvage: 'SALVAGE',
    boss: 'BOSS',
    friendly: 'CONTACT',
    mixed: 'MYSTERY',
    lore: 'RUINS',
    horde: 'VAST HORDE'
  }[scenario]
}
