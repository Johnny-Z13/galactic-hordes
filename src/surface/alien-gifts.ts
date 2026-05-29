import { clamp, TAU } from '../math-utils'
import { powerupBalance } from '../powerup-balance'
import { surfaceRunBalance, type AlienGiftKind } from '../surface-balance'

export interface AlienGiftThreatModel {
  x: number
  y: number
  vx: number
  vy: number
  hp: number
  radius: number
  phase: number
  color: string
  hit: number
}

export function alienGiftOfferCopy(gift: AlienGiftKind): string {
  return {
    herb: 'It unfolds a luminous herb in both hands. The suit reads medicine, poison, and prayer in equal measure.',
    idol: 'It offers a tiny idol made of cooled lightning. The object is either a charm or a trap pretending to be polite.',
    map: 'It draws a living map in the dust. The route keeps changing when you blink.',
    coin: 'It flips a black coin into the air and waits for your glove to open.',
    beacon: 'It holds up a cracked docking charter. The station signature inside is alive, frightened, and already calling your ship.'
  }[gift]
}

export function isAlienGiftGood(input: {
  luckRank: number
  surveyRank: number
  random: () => number
}): boolean {
  const chance = powerupBalance.upgradeApply.alienGiftGoodBaseChance
    + input.luckRank * powerupBalance.upgradeApply.alienGiftLuckPerRank
    + input.surveyRank * powerupBalance.upgradeApply.alienGiftSurveyPerRank
  return input.random() < chance
}

export function createBadAlienGiftThreats(input: {
  gift: AlienGiftKind
  origin: { x: number; y: number }
  surface: { width: number; height: number }
  time: number
  randomRange: (min: number, max: number) => number
}): AlienGiftThreatModel[] {
  const gift = surfaceRunBalance.alien.badGift
  if (input.gift === 'idol') {
    return createGiftThreatPack({
      count: gift.idolThreatCount,
      origin: input.origin,
      surface: input.surface,
      scatter: gift.idolThreatScatter,
      hp: gift.idolThreatHpBase + input.time * gift.idolThreatHpPerSecond,
      radius: gift.idolThreatRadius,
      color: '#ff5d73',
      randomRange: input.randomRange
    })
  }
  if (input.gift === 'beacon') {
    return createGiftThreatPack({
      count: gift.beaconThreatCount,
      origin: input.origin,
      surface: input.surface,
      scatter: gift.beaconThreatScatter,
      hp: gift.beaconThreatHpBase + input.time * gift.beaconThreatHpPerSecond,
      radius: gift.beaconThreatRadius,
      color: '#70a8ff',
      randomRange: input.randomRange
    })
  }
  return []
}

function createGiftThreatPack(input: {
  count: number
  origin: { x: number; y: number }
  surface: { width: number; height: number }
  scatter: number
  hp: number
  radius: number
  color: string
  randomRange: (min: number, max: number) => number
}): AlienGiftThreatModel[] {
  const threats: AlienGiftThreatModel[] = []
  for (let i = 0; i < input.count; i += 1) {
    threats.push({
      x: clamp(input.origin.x + input.randomRange(-input.scatter, input.scatter), 60, input.surface.width - 60),
      y: clamp(input.origin.y + input.randomRange(-input.scatter, input.scatter), 60, input.surface.height - 60),
      vx: 0,
      vy: 0,
      hp: input.hp,
      radius: input.radius,
      phase: input.randomRange(0, TAU),
      color: input.color,
      hit: 0
    })
  }
  return threats
}
