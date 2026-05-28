import type { SpaceWaveWarning } from './space-wave-director'

type RunObjectiveState = 'playing' | 'surface' | string
type SurfaceObjectiveKind = 'jackpot' | 'swarm' | 'relic' | 'repair' | 'volatile' | 'standard' | 'horde' | 'cache' | null
const STATION_DECISION_SECONDS = 30

export interface RunObjectiveReadoutInput {
  state: RunObjectiveState
  routeObjective: string
  routeIntel?: {
    directive: string
    reward: string
    risk: string
  }
  elapsed: number
  nextReturnBeaconAt: number
  returnBeaconDistance: number | null
  surfaceEvent: SurfaceObjectiveKind
  pendingUpgrades: number
  waveWarning?: SpaceWaveWarning | null
}

export interface RunObjectiveReadout {
  label: string
  text: string
}

export function runObjectiveReadout(input: RunObjectiveReadoutInput): RunObjectiveReadout {
  if (input.state === 'surface') {
    return {
      label: 'SURFACE',
      text: surfaceObjectiveText(input.surfaceEvent)
    }
  }
  if (input.returnBeaconDistance !== null) {
    const signalText = signalReadyText(input.pendingUpgrades)
    return {
      label: 'DOCK',
      text: `Station signal ${Math.max(0, Math.floor(input.returnBeaconDistance))}m${signalText ? ` // ${signalText}` : ''}`
    }
  }
  if (input.pendingUpgrades > 0) {
    return {
      label: 'SIGNAL',
      text: `${input.pendingUpgrades} mutation signal${input.pendingUpgrades === 1 ? '' : 's'} ready // dock or land to install`
    }
  }
  if (input.waveWarning) {
    const contacts = input.waveWarning.enemyTotal === 1 ? 'contact' : 'contacts'
    return {
      label: 'WAVE',
      text: `${input.waveWarning.label} in ${Math.ceil(input.waveWarning.secondsUntil)}s // ${input.waveWarning.enemyTotal} ${contacts}`
    }
  }
  const secondsUntilStation = Math.max(0, Math.ceil(input.nextReturnBeaconAt - input.elapsed))
  if (secondsUntilStation <= STATION_DECISION_SECONDS) {
    return {
      label: 'STATION',
      text: `Station signal in ${secondsUntilStation}s // hold route or prepare to dock`
    }
  }
  return {
    label: 'ROUTE',
    text: `${routeText(input)} // STATION ${secondsUntilStation}s`
  }
}

function routeText(input: RunObjectiveReadoutInput) {
  if (!input.routeIntel) return input.routeObjective
  return `${input.routeIntel.directive} // ${input.routeIntel.reward} // ${input.routeIntel.risk}`
}

function signalReadyText(count: number) {
  if (count <= 0) return ''
  return `${count} signal${count === 1 ? '' : 's'} ready`
}

function surfaceObjectiveText(event: SurfaceObjectiveKind) {
  if (event === 'cache') return 'Collect cache signals, then return to ship'
  if (event === 'relic') return 'Recover relic signal, then return to ship'
  if (event === 'repair') return 'Secure repairs, then return to ship'
  if (event === 'horde' || event === 'swarm') return 'Survive the landing zone, then return to ship'
  if (event === 'volatile') return 'Salvage unstable resources, then return to ship'
  return 'Collect surface resources, then return to ship'
}
