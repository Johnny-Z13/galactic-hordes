import type { Bullet } from './main-types'
import { powerupBalance } from './powerup-balance'
import { spaceProjectileLifeForOffscreenTravel } from './space-camera'
import { optionOrbProfile, rearGunProfile } from './weapon-signatures'

export interface WeaponPlayerState {
  x: number
  y: number
  vx: number
  vy: number
  aimAngle: number
}

interface WeaponViewportInput {
  width: number
  height: number
  scale: number
}

export interface OptionOrbFireInput extends WeaponViewportInput {
  bullets: Bullet[]
  player: WeaponPlayerState
  orbitRank: number
  fireSerial: number
  evolvedOrbit: boolean
  evolvedChain: boolean
  damage: number
  speed: number
  time: number
  maxBullets: number
}

export interface RearGunFireInput extends WeaponViewportInput {
  bullets: Bullet[]
  player: WeaponPlayerState
  rearRank: number
  damage: number
  speed: number
  maxBullets: number
}

export function optionOrbAngle(time: number, index: number, count: number) {
  return time * (2.4 + count * 0.18) + (index / count) * Math.PI * 2
}

export function optionOrbWorldPosition(player: WeaponPlayerState, time: number, index: number, count: number, radius: number) {
  const a = optionOrbAngle(time, index, count)
  return {
    x: player.x + Math.cos(a) * radius,
    y: player.y + Math.sin(a) * radius,
    angle: a
  }
}

export function fireOptionOrbs(input: OptionOrbFireInput) {
  const profile = optionOrbProfile({ orbitRank: input.orbitRank, fireSerial: input.fireSerial, evolved: input.evolvedOrbit })
  if (!profile.fires || profile.count <= 0) return

  const radius = powerupBalance.orbit.radiusBase + input.orbitRank * powerupBalance.orbit.radiusPerRank
  const boltSpeed = input.speed * powerupBalance.orbit.boltSpeedMultiplier
  const boltLife = spaceProjectileLifeForOffscreenTravel(
    powerupBalance.weapon.pulseBaseLife * powerupBalance.orbit.boltLifeMultiplier,
    boltSpeed,
    input.width,
    input.height,
    input.scale
  )
  const color = input.evolvedOrbit ? '#fff27a' : '#8fff7d'
  for (let i = 0; i < profile.count; i += 1) {
    if (input.bullets.length > input.maxBullets) input.bullets.shift()
    const orb = optionOrbWorldPosition(input.player, input.time, i, profile.count, radius)
    const lace = profile.count > 1 ? (i - (profile.count - 1) / 2) * 0.025 : 0
    const a = input.player.aimAngle + lace
    input.bullets.push({
      x: orb.x + Math.cos(a) * 10,
      y: orb.y + Math.sin(a) * 10,
      vx: Math.cos(a) * boltSpeed + input.player.vx * 0.1,
      vy: Math.sin(a) * boltSpeed + input.player.vy * 0.1,
      life: boltLife,
      damage: input.damage * profile.damageMultiplier,
      radius: input.evolvedOrbit ? 3.4 : 2.8,
      color,
      pierce: profile.pierce,
      chain: input.evolvedChain ? 1 : 0,
      option: true
    })
  }
}

export function fireRearGun(input: RearGunFireInput) {
  const profile = rearGunProfile(input.rearRank)
  if (profile.shots <= 0) return

  const rearSpeed = input.speed * profile.speedMultiplier
  for (let i = 0; i < profile.shots; i += 1) {
    if (input.bullets.length > input.maxBullets) input.bullets.shift()
    const offset = profile.shots === 1 ? 0 : (i - (profile.shots - 1) / 2) * profile.spread
    const a = input.player.aimAngle + Math.PI + offset
    const vx = Math.cos(a) * rearSpeed + input.player.vx * 0.1
    const vy = Math.sin(a) * rearSpeed + input.player.vy * 0.1
    const bulletSpeed = Math.hypot(vx, vy)
    input.bullets.push({
      x: input.player.x + Math.cos(a) * 21,
      y: input.player.y + Math.sin(a) * 21,
      vx,
      vy,
      life: spaceProjectileLifeForOffscreenTravel(
        powerupBalance.weapon.pulseBaseLife * powerupBalance.rearGun.lifeMultiplier,
        bulletSpeed,
        input.width,
        input.height,
        input.scale
      ),
      damage: input.damage * profile.damageMultiplier,
      radius: 3.2,
      color: '#ff9d5c',
      pierce: profile.pierce,
      rail: false,
      chain: 0
    })
  }
}
