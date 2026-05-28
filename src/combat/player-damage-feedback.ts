export type PlayerDamageFlashKind = 'shield' | 'hull' | 'critical' | 'surface'

export interface PlayerDamageFlash {
  kind: PlayerDamageFlashKind
  color: string
  life: number
  maxLife: number
  alpha: number
}

export function createPlayerDamageFlash(input: {
  hullRatio: number
  hullDamage: number
  shieldDamage: number
  surface: boolean
}): PlayerDamageFlash {
  const kind = playerDamageFlashKind(input)
  const maxLife = kind === 'critical' ? 0.68 : kind === 'surface' ? 0.52 : kind === 'hull' ? 0.46 : 0.32
  const alpha = kind === 'critical' ? 0.52 : kind === 'surface' ? 0.42 : kind === 'hull' ? 0.4 : 0.26
  return {
    kind,
    color: kind === 'shield' ? '#57fff3' : '#ff5d73',
    life: maxLife,
    maxLife,
    alpha
  }
}

export function advancePlayerDamageFlash(flash: PlayerDamageFlash | null, dt: number): PlayerDamageFlash | null {
  if (!flash) return null
  flash.life -= dt
  return flash.life > 0 ? flash : null
}

export function vitalCriticalClass(ratio: number): 'critical' | '' {
  return ratio <= 0.3 ? 'critical' : ''
}

function playerDamageFlashKind(input: {
  hullRatio: number
  hullDamage: number
  shieldDamage: number
  surface: boolean
}): PlayerDamageFlashKind {
  if (input.surface) return 'surface'
  if (input.hullDamage <= 0 && input.shieldDamage > 0) return 'shield'
  return input.hullRatio <= 0.3 ? 'critical' : 'hull'
}
