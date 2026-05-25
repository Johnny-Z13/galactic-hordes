export interface SimRng {
  seed: number
  next: () => number
  int: (min: number, max: number) => number
  chance: (probability: number) => boolean
  range: (min: number, max: number) => number
}

export function createSimRng(seed: number): SimRng {
  let state = seed >>> 0
  const next = () => {
    state += 0x6d2b79f5
    let r = Math.imul(state ^ (state >>> 15), 1 | state)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }

  return {
    seed: seed >>> 0,
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    chance: (probability) => next() < probability,
    range: (min, max) => min + next() * (max - min)
  }
}

export function pickWeighted<T>(choices: Array<{ value: T; weight: number }>, rng: SimRng): T {
  const available = choices.filter((choice) => choice.weight > 0)
  if (!available.length) throw new Error('pickWeighted requires at least one positive weight')

  let roll = rng.next() * available.reduce((sum, choice) => sum + choice.weight, 0)
  for (const choice of available) {
    roll -= choice.weight
    if (roll <= 0) return choice.value
  }
  return available[available.length - 1].value
}
