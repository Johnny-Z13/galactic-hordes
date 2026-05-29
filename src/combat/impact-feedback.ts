export type ImpactPulseKind = 'hit' | 'kill'

export interface ImpactPulse {
  kind: ImpactPulseKind
  x: number
  y: number
  color: string
  life: number
  maxLife: number
  radius: number
  lineWidth: number
}

export function createImpactPulse(input: {
  kind: ImpactPulseKind
  x: number
  y: number
  color: string
  amount: number
  giant: boolean
  highLoad: boolean
}): ImpactPulse | null {
  if (input.kind === 'hit') {
    if (input.highLoad || input.amount < 1) return null
    const maxLife = 0.18
    return {
      kind: 'hit',
      x: input.x,
      y: input.y,
      color: input.color,
      life: maxLife,
      maxLife,
      radius: Math.min(30, 13 + Math.sqrt(input.amount) * 3),
      lineWidth: 1.4
    }
  }

  const maxLife = input.giant ? 0.72 : 0.42
  return {
    kind: 'kill',
    x: input.x,
    y: input.y,
    color: input.color,
    life: maxLife,
    maxLife,
    radius: input.giant ? 88 : 46,
    lineWidth: input.giant ? 2.8 : 2
  }
}

export function advanceImpactPulses(input: {
  pulses: ImpactPulse[]
  dt: number
}) {
  for (let i = input.pulses.length - 1; i >= 0; i -= 1) {
    input.pulses[i].life -= input.dt
    if (input.pulses[i].life <= 0) input.pulses.splice(i, 1)
  }
}

export function appendImpactPulse(input: {
  pulses: ImpactPulse[]
  pulse: ImpactPulse | null
  cap: number
}) {
  if (!input.pulse) return
  input.pulses.push(input.pulse)
  if (input.pulses.length > input.cap) input.pulses.shift()
}
