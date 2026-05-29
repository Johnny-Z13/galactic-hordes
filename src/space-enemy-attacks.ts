import { balancedSpaceEnemyDefinition, enemyAttackCooldown } from './game-balance'
import type { Bullet, Enemy, Vec } from './main-types'
import { TAU } from './math-utils'
import { spaceEnemyBehavior } from './space-enemy-behavior'

type EnemyBalance = ReturnType<typeof balancedSpaceEnemyDefinition>
type HostileBulletInput = Omit<Bullet, 'hostile' | 'pierce'>

export interface SpaceEnemyAttackContext {
  time: number
  spawnHostileBullet(bullet: HostileBulletInput): void
  burst(x: number, y: number, color: string, count: number, speed: number): void
  shakeCamera(amount: number): void
}

export function fireSiphonVortex(ctx: SpaceEnemyAttackContext, e: Enemy, enemyBalance: EnemyBalance) {
  const tuned = spaceEnemyBehavior.siphon
  e.cd = enemyAttackCooldown(enemyBalance, ctx.time)
  const speed = enemyBalance.projectileSpeed ?? 0
  const damage = enemyBalance.projectileDamage ?? 0
  for (let arm = 0; arm < tuned.vortexArms; arm += 1) {
    for (let k = 0; k < tuned.vortexShotsPerArm; k += 1) {
      const a = e.phase * tuned.swirlFrequency + arm * Math.PI + k * tuned.vortexAngleStep
      const laneSpeed = speed * (tuned.vortexSpeedBase + k * tuned.vortexSpeedStep)
      ctx.spawnHostileBullet({
        x: e.x + Math.cos(a) * e.radius * 0.92,
        y: e.y + Math.sin(a) * e.radius * 0.92,
        vx: Math.cos(a) * laneSpeed,
        vy: Math.sin(a) * laneSpeed,
        life: tuned.vortexProjectileLife,
        damage,
        radius: tuned.vortexProjectileRadius,
        color: k % 2 ? '#8fff7d' : '#57fff3'
      })
    }
  }
  ctx.burst(e.x, e.y, '#8fff7d', 14, 180)
}

export function fireHelixSpikes(ctx: SpaceEnemyAttackContext, e: Enemy, enemyBalance: EnemyBalance, toP: Vec) {
  const tuned = spaceEnemyBehavior.helix
  e.cd = enemyAttackCooldown(enemyBalance, ctx.time)
  const speed = enemyBalance.projectileSpeed ?? 0
  const damage = enemyBalance.projectileDamage ?? 0
  const baseAngle = Math.atan2(toP.y, toP.x)
  for (let pair = 0; pair < tuned.shotPairs; pair += 1) {
    const offset = (pair + 1) * tuned.shotAngleStep
    for (const sign of [-1, 1]) {
      const a = baseAngle + sign * offset + Math.sin(e.phase * tuned.corkscrewFrequency) * 0.08
      ctx.spawnHostileBullet({
        x: e.x + Math.cos(a) * e.radius,
        y: e.y + Math.sin(a) * e.radius,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: tuned.projectileLife,
        damage,
        radius: tuned.projectileRadius,
        color: sign > 0 ? '#7df7ff' : '#a6ff4d'
      })
    }
  }
  ctx.burst(e.x, e.y, '#7df7ff', 7, 125)
}

export function firePrismFan(ctx: SpaceEnemyAttackContext, e: Enemy, enemyBalance: EnemyBalance, toP: Vec) {
  const tuned = spaceEnemyBehavior.prism
  e.cd = enemyAttackCooldown(enemyBalance, ctx.time)
  const speed = enemyBalance.projectileSpeed ?? 0
  const damage = enemyBalance.projectileDamage ?? 0
  const baseAngle = Math.atan2(toP.y, toP.x)
  const center = (tuned.beamCount - 1) / 2
  for (let shot = 0; shot < tuned.beamCount; shot += 1) {
    const offset = (shot - center) * tuned.beamSpreadRadians
    const a = baseAngle + offset
    ctx.spawnHostileBullet({
      x: e.x + Math.cos(a) * e.radius * 0.9,
      y: e.y + Math.sin(a) * e.radius * 0.9,
      vx: Math.cos(a) * speed * (1 - Math.abs(offset) * 0.18),
      vy: Math.sin(a) * speed * (1 - Math.abs(offset) * 0.18),
      life: tuned.projectileLife,
      damage,
      radius: tuned.projectileRadius,
      color: shot % 2 ? '#ff8cf0' : '#fff27a'
    })
  }
  ctx.burst(e.x, e.y, '#ff8cf0', 9, 150)
}

export function fireDreadnoughtBroadside(ctx: SpaceEnemyAttackContext, e: Enemy, enemyBalance: EnemyBalance, toP: Vec) {
  const tuned = spaceEnemyBehavior.dreadnought
  e.cd = enemyBalance.attackCooldownSeconds ?? 0
  const speed = enemyBalance.projectileSpeed ?? 0
  const damage = enemyBalance.projectileDamage ?? 0
  const baseAngle = Math.atan2(toP.y, toP.x)
  for (let shot = -3; shot <= 3; shot += 1) {
    const a = baseAngle + shot * tuned.broadsideSpreadRadians
    const sideFalloff = 1 - Math.abs(shot) * tuned.broadsideSideSpeedLoss
    ctx.spawnHostileBullet({
      x: e.x + Math.cos(a) * e.radius,
      y: e.y + Math.sin(a) * e.radius,
      vx: Math.cos(a) * speed * sideFalloff,
      vy: Math.sin(a) * speed * sideFalloff,
      life: tuned.broadsideLife,
      damage,
      radius: shot === 0 ? tuned.broadsideCenterRadius : tuned.broadsideSideRadius,
      color: shot === 0 ? '#fff27a' : '#ff5d73'
    })
  }
  for (const offset of tuned.rearOffsets) {
    const a = baseAngle + Math.PI + offset
    ctx.spawnHostileBullet({
      x: e.x + Math.cos(a) * e.radius * 0.75,
      y: e.y + Math.sin(a) * e.radius * 0.75,
      vx: Math.cos(a) * speed * tuned.rearSpeedMultiplier,
      vy: Math.sin(a) * speed * tuned.rearSpeedMultiplier,
      life: tuned.rearLife,
      damage: damage * tuned.rearDamageMultiplier,
      radius: tuned.rearRadius,
      color: '#b990ff'
    })
  }
  ctx.shakeCamera(5)
  ctx.burst(e.x, e.y, '#ff5d73', 16, 210)
}

export function fireCathedralLattice(ctx: SpaceEnemyAttackContext, e: Enemy, enemyBalance: EnemyBalance, toP: Vec) {
  const tuned = spaceEnemyBehavior.cathedral
  e.cd = enemyBalance.attackCooldownSeconds ?? 0
  const speed = enemyBalance.projectileSpeed ?? 0
  const damage = enemyBalance.projectileDamage ?? 0
  for (let ring = 0; ring < tuned.latticeRings; ring += 1) {
    for (let k = 0; k < tuned.latticeShotsPerRing; k += 1) {
      const a = e.phase * (ring % 2 ? -tuned.latticeSpinScale : tuned.latticeSpinScale) + (k / tuned.latticeShotsPerRing) * TAU + ring * tuned.latticeRingAngleStep
      const outerRing = ring === tuned.latticeRings - 1
      ctx.spawnHostileBullet({
        x: e.x + Math.cos(a) * e.radius * (tuned.latticeSpawnRadiusBase + ring * tuned.latticeSpawnRadiusStep),
        y: e.y + Math.sin(a) * e.radius * (tuned.latticeSpawnRadiusBase + ring * tuned.latticeSpawnRadiusStep),
        vx: Math.cos(a) * speed * (tuned.latticeSpeedBase + ring * tuned.latticeSpeedStep),
        vy: Math.sin(a) * speed * (tuned.latticeSpeedBase + ring * tuned.latticeSpeedStep),
        life: tuned.latticeLife,
        damage: damage * (outerRing ? tuned.latticeOuterDamageMultiplier : tuned.latticeInnerDamageMultiplier),
        radius: outerRing ? tuned.latticeOuterRadius : tuned.latticeInnerRadius,
        color: ring === 1 ? '#b990ff' : '#d7fff7'
      })
    }
  }
  const aim = Math.atan2(toP.y, toP.x)
  for (const offset of tuned.aimedOffsets) {
    const a = aim + offset
    ctx.spawnHostileBullet({
      x: e.x + Math.cos(a) * e.radius,
      y: e.y + Math.sin(a) * e.radius,
      vx: Math.cos(a) * speed * tuned.aimedSpeedMultiplier,
      vy: Math.sin(a) * speed * tuned.aimedSpeedMultiplier,
      life: tuned.aimedLife,
      damage: damage * tuned.aimedDamageMultiplier,
      radius: tuned.aimedRadius,
      color: '#fff27a'
    })
  }
  ctx.shakeCamera(4)
  ctx.burst(e.x, e.y, '#d7fff7', 18, 190)
}
