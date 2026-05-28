import type { Bullet, Enemy } from './main-types'
import { clamp, norm } from './math-utils'
import { powerupBalance, type UpgradeId } from './powerup-balance'
import { spaceProjectileLifeForOffscreenTravel } from './space-camera'
import { optionOrbProfile, pulseVolleyCount, rearGunProfile } from './weapon-signatures'

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

export interface ChainBoltInput {
  bullets: Bullet[]
  enemies: Enemy[]
  source: Bullet
  hit: Enemy
  chainRank: number
  evolvedChain: boolean
  maxBullets: number
}

export interface OptionOrbDamageInput {
  enemies: Enemy[]
  player: WeaponPlayerState
  orbitRank: number
  fireSerial: number
  evolvedOrbit: boolean
  limitMight: number
  time: number
  dt: number
}

export interface OptionOrbDamageHit {
  enemy: Enemy
  damage: number
  color: string
}

export interface OptionOrbDamageResult {
  hits: OptionOrbDamageHit[]
}

export type PrimaryWeaponBuildState = Pick<Record<UpgradeId, number>, 'rapid' | 'split' | 'rail' | 'rift' | 'heat' | 'echo' | 'pierce' | 'chain'>

export interface WeaponLimitBreakState {
  cooldown: number
  might: number
  speed: number
  amount: number
}

export interface PrimaryWeaponFireInput extends WeaponViewportInput {
  bullets: Bullet[]
  player: WeaponPlayerState
  build: PrimaryWeaponBuildState
  evolved: { has(id: string): boolean }
  limitBreaks: WeaponLimitBreakState
  statsLevel: number
  fireSerial: number
  maxBullets: number
  glassRisk?: number
}

export interface PrimaryWeaponFireResult {
  fireCooldown: number
  damage: number
  speed: number
  rayCount: number
  rail: boolean
  needle: boolean
  rapid: number
  fireSerial: number
  nextFireSerial: number
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

export function applyOptionOrbDamage(input: OptionOrbDamageInput): OptionOrbDamageResult {
  const profile = optionOrbProfile({ orbitRank: input.orbitRank, fireSerial: input.fireSerial, evolved: input.evolvedOrbit })
  const count = profile.count
  const hits: OptionOrbDamageHit[] = []
  if (count <= 0) return { hits }

  const radius = powerupBalance.orbit.radiusBase + input.orbitRank * powerupBalance.orbit.radiusPerRank
  const damage = (
    powerupBalance.orbit.damageBase
    + input.orbitRank * powerupBalance.orbit.damagePerRank
    + input.limitMight * powerupBalance.orbit.limitMightDamagePerRank
  ) * (input.evolvedOrbit ? powerupBalance.orbit.gravityDamageMultiplier : 1) * input.dt

  for (const enemy of input.enemies) {
    if (input.evolvedOrbit && (enemy.x - input.player.x) ** 2 + (enemy.y - input.player.y) ** 2 < (radius + powerupBalance.orbit.gravityPullRadiusBonus) ** 2) {
      const pull = norm(input.player.x - enemy.x, input.player.y - enemy.y)
      enemy.vx += pull.x * powerupBalance.orbit.gravityPullForce * input.dt
      enemy.vy += pull.y * powerupBalance.orbit.gravityPullForce * input.dt
    }
    for (let index = 0; index < count; index += 1) {
      const orb = optionOrbWorldPosition(input.player, input.time, index, count, radius)
      const rr = enemy.radius + 12
      if ((enemy.x - orb.x) ** 2 + (enemy.y - orb.y) ** 2 < rr * rr) {
        hits.push({ enemy, damage, color: input.evolvedOrbit ? '#fff27a' : '#8fff7d' })
      }
    }
  }

  return { hits }
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

export function firePrimaryWeapon(input: PrimaryWeaponFireInput): PrimaryWeaponFireResult {
  if (input.bullets.length > input.maxBullets) input.bullets.splice(0, input.bullets.length - input.maxBullets)
  const rapid = input.build.rapid
  const choir = input.evolved.has('rapid')
  const shatter = input.evolved.has('split')
  const solar = input.evolved.has('rail')
  const resonance = input.evolved.has('echo')
  const storm = input.evolved.has('chain')
  const blackNeedle = input.evolved.has('rift')
  const glassRisk = input.glassRisk ?? 1
  const fireCooldown = clamp(
    (
      powerupBalance.weapon.baseFireCooldown
      - rapid * powerupBalance.weapon.rapidCooldownPerRank
      - input.build.heat * powerupBalance.weapon.heatCooldownPerRank
      - input.limitBreaks.cooldown * powerupBalance.weapon.limitCooldownPerRank
    ) * (choir ? powerupBalance.weapon.choirCooldownMultiplier : 1),
    powerupBalance.weapon.minFireCooldown,
    powerupBalance.weapon.baseFireCooldown
  )
  const damage = (
    powerupBalance.weapon.baseDamage
    + input.statsLevel * powerupBalance.weapon.damagePerLevel
    + input.build.rail * powerupBalance.weapon.railDamagePerRank
    + input.build.rift * powerupBalance.weapon.riftDamagePerRank
    + input.limitBreaks.might * powerupBalance.weapon.limitMightDamagePerRank
  ) * glassRisk
  const speed = powerupBalance.weapon.baseProjectileSpeed
    + input.build.echo * powerupBalance.weapon.echoProjectileSpeedPerRank
    + input.build.heat * powerupBalance.weapon.heatProjectileSpeedPerRank
    + input.limitBreaks.speed * powerupBalance.weapon.limitSpeedProjectileSpeedPerRank
  const rayCount = 1 + input.build.split + (shatter ? powerupBalance.weapon.shatterExtraRays : 0) + Math.floor(input.limitBreaks.amount / powerupBalance.weapon.limitAmountRanksPerExtraRay)
  const spread = rayCount === 1 ? 0 : clamp(
    powerupBalance.weapon.spreadBase + rayCount * powerupBalance.weapon.spreadPerRay,
    powerupBalance.weapon.spreadBase,
    powerupBalance.weapon.spreadMax
  )
  const railInterval = Math.max((solar ? powerupBalance.weapon.solarRailBaseInterval : powerupBalance.weapon.railBaseInterval) - input.build.rail, powerupBalance.weapon.railMinimumInterval)
  const needleInterval = Math.max((blackNeedle ? powerupBalance.weapon.blackNeedleBaseInterval : powerupBalance.weapon.needleBaseInterval) - input.build.rift, powerupBalance.weapon.needleMinimumInterval)
  const rail = input.build.rail > 0 && input.fireSerial % railInterval === 0
  const needle = input.build.rift > 0 && input.fireSerial % needleInterval === 0
  const volleys = pulseVolleyCount({ rapidRank: rapid, fireSerial: input.fireSerial, evolved: choir })
  const cadenceDouble = volleys > 1 && !choir
  const pulseColor = storm ? '#8fff7d' : choir ? '#f6fffe' : cadenceDouble ? '#d7fff7' : input.build.heat >= 3 ? '#ff9d5c' : input.build.pierce >= 3 ? '#70a8ff' : '#57fff3'

  for (let volleyIndex = 0; volleyIndex < volleys; volleyIndex += 1) {
    for (let rayIndex = 0; rayIndex < rayCount; rayIndex += 1) {
      const offset = (rayCount === 1 ? 0 : (rayIndex - (rayCount - 1) / 2) * spread) + (volleys === 1 ? 0 : (volleyIndex - 0.5) * powerupBalance.weapon.volleyOffset)
      const angle = input.player.aimAngle + offset
      const vx = Math.cos(angle) * speed + input.player.vx * 0.14
      const vy = Math.sin(angle) * speed + input.player.vy * 0.14
      const bulletSpeed = Math.hypot(vx, vy)
      const bulletLife = rail
        ? spaceProjectileLifeForOffscreenTravel(
          powerupBalance.weapon.railBaseLife + (solar ? powerupBalance.weapon.solarRailLifeBonus : 0),
          bulletSpeed,
          input.width,
          input.height,
          input.scale
        )
        : spaceProjectileLifeForOffscreenTravel(
          powerupBalance.weapon.pulseBaseLife + input.build.echo * powerupBalance.weapon.echoLifePerRank + (resonance ? powerupBalance.weapon.resonanceLifeBonus : 0),
          bulletSpeed,
          input.width,
          input.height,
          input.scale
        )
      input.bullets.push({
        x: input.player.x + Math.cos(angle) * 22,
        y: input.player.y + Math.sin(angle) * 22,
        vx,
        vy,
        life: bulletLife,
        damage: rail
          ? damage * (solar ? powerupBalance.weapon.solarRailDamageMultiplier : powerupBalance.weapon.railDamageMultiplier)
          : damage * (shatter && rayIndex !== Math.floor(rayCount / 2) ? powerupBalance.weapon.shatterSideRayDamageMultiplier : 1),
        radius: rail ? (solar ? 7 : 5) : 3.5,
        color: rail ? '#fff27a' : needle ? '#b990ff' : pulseColor,
        pierce: rail
          ? powerupBalance.weapon.railPierceBase + input.build.pierce + (solar ? powerupBalance.weapon.solarRailPierceBonus : 0)
          : input.build.pierce + (resonance ? powerupBalance.weapon.resonancePierceBonus : 0),
        rail,
        chain: input.build.chain + (storm ? powerupBalance.weapon.stormChainBonus : 0)
      })
    }
  }

  if (needle) {
    const angle = input.player.aimAngle
    input.bullets.push({
      x: input.player.x + Math.cos(angle) * 24,
      y: input.player.y + Math.sin(angle) * 24,
      vx: Math.cos(angle) * (speed * powerupBalance.weapon.needleSpeedMultiplier),
      vy: Math.sin(angle) * (speed * powerupBalance.weapon.needleSpeedMultiplier),
      life: spaceProjectileLifeForOffscreenTravel(
        powerupBalance.weapon.needleLife,
        speed * powerupBalance.weapon.needleSpeedMultiplier,
        input.width,
        input.height,
        input.scale
      ),
      damage: damage * (blackNeedle ? powerupBalance.weapon.blackNeedleDamageMultiplier : powerupBalance.weapon.needleDamageMultiplier),
      radius: blackNeedle ? powerupBalance.weapon.blackNeedleRadius : powerupBalance.weapon.needleRadius,
      color: blackNeedle ? '#ffffff' : '#b990ff',
      pierce: powerupBalance.weapon.needlePierceBase + input.build.rift + (blackNeedle ? powerupBalance.weapon.blackNeedlePierceBonus : 0),
      rail: true,
      chain: storm ? powerupBalance.weapon.stormNeedleChainBonus : 0
    })
  }

  return {
    fireCooldown,
    damage,
    speed,
    rayCount,
    rail,
    needle,
    rapid,
    fireSerial: input.fireSerial,
    nextFireSerial: input.fireSerial + 1
  }
}

export function spawnChainBolt(input: ChainBoltInput) {
  if (input.bullets.length > input.maxBullets - 4) return
  let best: Enemy | null = null
  let bestD = (powerupBalance.chain.rangeBase + input.chainRank * powerupBalance.chain.rangePerRank) ** 2
  for (const enemy of input.enemies) {
    if (enemy === input.hit || enemy.hp <= 0) continue
    const d = (enemy.x - input.hit.x) ** 2 + (enemy.y - input.hit.y) ** 2
    if (d < bestD) {
      bestD = d
      best = enemy
    }
  }
  if (!best) return
  const dx = best.x - input.hit.x
  const dy = best.y - input.hit.y
  const length = Math.hypot(dx, dy) || 1
  const aim = { x: dx / length, y: dy / length }
  input.bullets.push({
    x: input.hit.x,
    y: input.hit.y,
    vx: aim.x * 960,
    vy: aim.y * 960,
    life: 0.16,
    damage: input.source.damage * (input.evolvedChain ? 0.58 : 0.42),
    radius: 4,
    color: '#fff27a',
    pierce: 0,
    rail: true,
    chain: input.source.chain ? input.source.chain - 1 : 0
  })
}
