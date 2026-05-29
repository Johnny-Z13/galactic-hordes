import type { Vec, Enemy, EnemyKind } from './main-types'
import { balancedSpaceEnemyDefinition, enemyAttackCooldown } from './game-balance'
import { spaceEnemyBehavior } from './space-enemy-behavior'
import { norm, dist2, TAU } from './math-utils'

// Per-enemy AI extracted from GalacticHordesGame.updateEnemies in main.ts.
// Each entry is the body of one `if (e.kind === ...)` branch from the original
// if-ladder, with only mechanical substitutions applied:
//   this.player.x/y -> ctx.playerX/Y, this.stats.time -> ctx.time, hunger -> ctx.hunger,
//   this.bullets.push({...pierce:0,hostile:true}) -> ctx.spawnHostileBullet({...}),
//   this.burst/emitEnemyTrail/fire*/damagePlayer/killEnemy -> ctx.* delegates,
//   enemyBalance -> def (4th param). No numbers/colors/ordering changed.
// The shared tail (speed cap, damping, integration, trail, contact collision)
// stays in updateEnemies. norm/dist2/TAU come from math-utils (relocated from
// main.ts) so behaviors never import from main.ts (would be circular).

export interface EnemyBehaviorContext {
  readonly playerX: number
  readonly playerY: number
  readonly playerPos: Vec
  readonly time: number
  readonly hunger: number
  spawnHostileBullet(b: { x: number; y: number; vx: number; vy: number; life: number; damage: number; radius: number; color: string }): void
  burst(x: number, y: number, color: string, count: number, speed: number): void
  emitEnemyTrail(e: Enemy, color: string, intensity?: number): void
  fireHelixSpikes(e: Enemy, def: ReturnType<typeof balancedSpaceEnemyDefinition>, toP: Vec): void
  firePrismFan(e: Enemy, def: ReturnType<typeof balancedSpaceEnemyDefinition>, toP: Vec): void
  fireSiphonVortex(e: Enemy, def: ReturnType<typeof balancedSpaceEnemyDefinition>): void
  fireDreadnoughtBroadside(e: Enemy, def: ReturnType<typeof balancedSpaceEnemyDefinition>, toP: Vec): void
  fireCathedralLattice(e: Enemy, def: ReturnType<typeof balancedSpaceEnemyDefinition>, toP: Vec): void
  damagePlayer(amount: number): void
  killEnemy(e: Enemy, reward: boolean): void
}

export type EnemyBehaviorResult = 'consumed' | 'alive'
export type EnemyBehaviorFn = (e: Enemy, ctx: EnemyBehaviorContext, dt: number, def: ReturnType<typeof balancedSpaceEnemyDefinition>) => EnemyBehaviorResult

const behavior = spaceEnemyBehavior

export const enemyBehaviors: Partial<Record<EnemyKind, EnemyBehaviorFn>> = {
  chaser: (e, ctx, dt) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    const pursuit = e.kind === 'chaser' ? behavior.chaser.pursuit : behavior.splinter.pursuit
    e.vx += toP.x * e.speed * pursuit * ctx.hunger * dt
    e.vy += toP.y * e.speed * pursuit * ctx.hunger * dt
    return 'alive'
  },
  splinter: (e, ctx, dt) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    const pursuit = e.kind === 'chaser' ? behavior.chaser.pursuit : behavior.splinter.pursuit
    e.vx += toP.x * e.speed * pursuit * ctx.hunger * dt
    e.vy += toP.y * e.speed * pursuit * ctx.hunger * dt
    return 'alive'
  },
  brute: (e, ctx, dt) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    e.vx += toP.x * e.speed * behavior.brute.pursuit * ctx.hunger * dt
    e.vy += toP.y * e.speed * behavior.brute.pursuit * ctx.hunger * dt
    return 'alive'
  },
  shooter: (e, ctx, dt, def) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    const tuned = behavior.shooter
    const d = Math.sqrt(dist2(e, ctx.playerPos))
    const side = { x: -toP.y, y: toP.x }
    const rangePull = d > tuned.farDistance ? tuned.farPull : d < tuned.nearDistance ? tuned.nearPull : tuned.holdPull
    e.vx += (toP.x * rangePull * e.speed + side.x * e.speed * tuned.strafe) * dt
    e.vy += (toP.y * rangePull * e.speed + side.y * e.speed * tuned.strafe) * dt
    if (e.cd <= 0 && d < (def.attackRange ?? 0)) {
      e.cd = enemyAttackCooldown(def, ctx.time)
      const spread = ctx.time > tuned.spreadUnlockSeconds ? tuned.spreadRadians : 0
      for (let shot = spread ? -1 : 0; shot <= (spread ? 1 : 0); shot += 1) {
        const a = Math.atan2(toP.y, toP.x) + shot * spread
        ctx.spawnHostileBullet({
          x: e.x + Math.cos(a) * e.radius,
          y: e.y + Math.sin(a) * e.radius,
          vx: Math.cos(a) * (def.projectileSpeed ?? 0),
          vy: Math.sin(a) * (def.projectileSpeed ?? 0),
          life: tuned.projectileLife,
          damage: def.projectileDamage ?? 0,
          radius: tuned.projectileRadius,
          color: '#ff61d8'
        })
      }
      ctx.burst(e.x, e.y, '#ff61d8', 5, 100)
    }
    return 'alive'
  },
  razor: (e, ctx, dt, def) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    const tuned = behavior.razor
    const sideSign = e.id % 2 === 0 ? 1 : -1
    const side = { x: -toP.y * sideSign, y: toP.x * sideSign }
    e.vx += (side.x * e.speed * tuned.strafe + toP.x * e.speed * tuned.pursuit) * dt
    e.vy += (side.y * e.speed * tuned.strafe + toP.y * e.speed * tuned.pursuit) * dt
    if (e.cd <= 0) {
      e.cd = def.attackCooldownSeconds ?? 0
      e.vx += side.x * tuned.dashSideImpulse + toP.x * tuned.dashForwardImpulse
      e.vy += side.y * tuned.dashSideImpulse + toP.y * tuned.dashForwardImpulse
      ctx.emitEnemyTrail(e, '#57fff3', tuned.trailIntensity)
    }
    return 'alive'
  },
  skimmer: (e, ctx, dt, def) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    const tuned = behavior.skimmer
    const d = Math.sqrt(dist2(e, ctx.playerPos))
    const sideSign = e.id % 2 === 0 ? 1 : -1
    const side = { x: -toP.y * sideSign, y: toP.x * sideSign }
    const rangePull = d > tuned.farDistance ? tuned.farPull : d < tuned.nearDistance ? tuned.nearPull : tuned.holdPull
    const wave = Math.sin(e.phase * tuned.waveFrequency) * e.speed * tuned.waveScale
    e.vx += (toP.x * rangePull * e.speed + side.x * e.speed * tuned.strafe + side.x * wave) * dt
    e.vy += (toP.y * rangePull * e.speed + side.y * e.speed * tuned.strafe + side.y * wave) * dt
    if (e.cd <= 0 && d < (def.attackRange ?? 0)) {
      e.cd = enemyAttackCooldown(def, ctx.time)
      const baseAngle = Math.atan2(toP.y, toP.x)
      for (let shot = -1; shot <= 1; shot += 1) {
        const a = baseAngle + shot * tuned.spreadRadians
        ctx.spawnHostileBullet({
          x: e.x + Math.cos(a) * e.radius,
          y: e.y + Math.sin(a) * e.radius,
          vx: Math.cos(a) * (def.projectileSpeed ?? 0),
          vy: Math.sin(a) * (def.projectileSpeed ?? 0),
          life: tuned.projectileLife,
          damage: def.projectileDamage ?? 0,
          radius: tuned.projectileRadius,
          color: '#ffe66d'
        })
      }
      ctx.burst(e.x, e.y, '#ffe66d', 6, 120)
    }
    return 'alive'
  },
  shard: (e, ctx, dt, def) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    const tuned = behavior.shard
    const sideSign = Math.sin(e.phase * tuned.cornerFrequency + e.id) >= 0 ? 1 : -1
    const side = { x: -toP.y * sideSign, y: toP.x * sideSign }
    const corner = Math.sign(Math.sin(e.phase * tuned.cornerFrequency * 0.5 + e.id)) || 1
    e.vx += (toP.x * e.speed * tuned.pursuit + side.x * e.speed * tuned.strafe) * dt
    e.vy += (toP.y * e.speed * tuned.pursuit + side.y * e.speed * tuned.strafe) * dt
    e.vx += side.x * tuned.cornerForce * corner * dt
    e.vy += side.y * tuned.cornerForce * corner * dt
    if (e.cd <= 0) {
      e.cd = def.attackCooldownSeconds ?? 0
      e.vx += toP.x * tuned.dashForwardImpulse + side.x * tuned.dashSideImpulse
      e.vy += toP.y * tuned.dashForwardImpulse + side.y * tuned.dashSideImpulse
      ctx.emitEnemyTrail(e, '#a6ff4d', tuned.trailIntensity)
    }
    return 'alive'
  },
  helix: (e, ctx, dt, def) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    const tuned = behavior.helix
    const d = Math.sqrt(dist2(e, ctx.playerPos))
    const side = { x: -toP.y, y: toP.x }
    const rangePull = d > tuned.farDistance ? tuned.farPull : d < tuned.nearDistance ? tuned.nearPull : tuned.holdPull
    const corkscrew = Math.sin(e.phase * tuned.corkscrewFrequency + e.id) * e.speed * tuned.corkscrewScale
    e.vx += (toP.x * rangePull * e.speed + side.x * corkscrew) * dt
    e.vy += (toP.y * rangePull * e.speed + side.y * corkscrew) * dt
    if (e.cd <= 0 && d < (def.attackRange ?? 0)) ctx.fireHelixSpikes(e, def, toP)
    return 'alive'
  },
  prism: (e, ctx, dt, def) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    const tuned = behavior.prism
    const d = Math.sqrt(dist2(e, ctx.playerPos))
    const side = { x: -toP.y, y: toP.x }
    const rangePull = d > tuned.farDistance ? tuned.farPull : d < tuned.nearDistance ? tuned.nearPull : tuned.holdPull
    const orbit = Math.sin(e.phase * tuned.orbitFrequency + e.id * 0.7) * e.speed * tuned.orbitScale
    e.vx += (toP.x * rangePull * e.speed + side.x * orbit) * dt
    e.vy += (toP.y * rangePull * e.speed + side.y * orbit) * dt
    if (e.cd <= 0 && d < (def.attackRange ?? 0)) ctx.firePrismFan(e, def, toP)
    return 'alive'
  },
  bulwark: (e, ctx, dt, def) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    const tuned = behavior.bulwark
    const d = Math.sqrt(dist2(e, ctx.playerPos))
    const side = { x: -toP.y, y: toP.x }
    const rangePull = d > tuned.farDistance ? tuned.farPull : d < tuned.nearDistance ? tuned.nearPull : tuned.holdPull
    const drift = Math.sin(e.phase * tuned.driftFrequency + e.id) * e.speed * tuned.driftScale
    e.vx += (toP.x * rangePull * e.speed + side.x * drift) * dt
    e.vy += (toP.y * rangePull * e.speed + side.y * drift) * dt
    if (e.cd <= 0 && d < (def.attackRange ?? 0)) {
      e.cd = def.attackCooldownSeconds ?? 0
      for (let k = 0; k < tuned.shotCount; k += 1) {
        const a = (k / tuned.shotCount) * TAU + e.phase * tuned.spinScale
        ctx.spawnHostileBullet({
          x: e.x + Math.cos(a) * e.radius,
          y: e.y + Math.sin(a) * e.radius,
          vx: Math.cos(a) * (def.projectileSpeed ?? 0),
          vy: Math.sin(a) * (def.projectileSpeed ?? 0),
          life: tuned.projectileLife,
          damage: def.projectileDamage ?? 0,
          radius: tuned.projectileRadius,
          color: '#f46cff'
        })
      }
      ctx.burst(e.x, e.y, '#f46cff', 10, 150)
    }
    return 'alive'
  },
  siphon: (e, ctx, dt, def) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    const tuned = behavior.siphon
    const d = Math.sqrt(dist2(e, ctx.playerPos))
    const sideSign = e.id % 2 === 0 ? 1 : -1
    const side = { x: -toP.y * sideSign, y: toP.x * sideSign }
    const rangePull = d > tuned.farDistance ? tuned.farPull : d < tuned.nearDistance ? tuned.nearPull : tuned.holdPull
    const swirl = Math.sin(e.phase * tuned.swirlFrequency) * e.speed * tuned.swirlScale
    e.vx += (toP.x * rangePull * e.speed + side.x * (e.speed * tuned.strafe + swirl)) * dt
    e.vy += (toP.y * rangePull * e.speed + side.y * (e.speed * tuned.strafe + swirl)) * dt
    if (e.cd <= 0 && d < (def.attackRange ?? 0)) ctx.fireSiphonVortex(e, def)
    return 'alive'
  },
  dreadnought: (e, ctx, dt, def) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    const tuned = behavior.dreadnought
    const d = Math.sqrt(dist2(e, ctx.playerPos))
    const side = { x: -toP.y, y: toP.x }
    const rangePull = d > tuned.farDistance ? tuned.farPull : d < tuned.nearDistance ? tuned.nearPull : tuned.holdPull
    const broadsideDrift = Math.sin(e.phase * tuned.driftFrequency + e.id) * e.speed * tuned.driftScale
    e.vx += (toP.x * rangePull * e.speed + side.x * broadsideDrift) * dt
    e.vy += (toP.y * rangePull * e.speed + side.y * broadsideDrift) * dt
    if (e.cd <= 0 && d < (def.attackRange ?? 0)) ctx.fireDreadnoughtBroadside(e, def, toP)
    return 'alive'
  },
  cathedral: (e, ctx, dt, def) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    const tuned = behavior.cathedral
    const d = Math.sqrt(dist2(e, ctx.playerPos))
    const side = { x: -toP.y, y: toP.x }
    const rangePull = d > tuned.farDistance ? tuned.farPull : d < tuned.nearDistance ? tuned.nearPull : tuned.holdPull
    const orbit = Math.sin(e.phase * tuned.orbitFrequency) * e.speed * tuned.orbitScale
    e.vx += (toP.x * rangePull * e.speed + side.x * orbit) * dt
    e.vy += (toP.y * rangePull * e.speed + side.y * orbit) * dt
    if (e.cd <= 0 && d < (def.attackRange ?? 0)) ctx.fireCathedralLattice(e, def, toP)
    return 'alive'
  },
  lancer: (e, ctx, dt, def) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    const tuned = behavior.lancer
    const d = Math.sqrt(dist2(e, ctx.playerPos))
    if (e.cd <= 0 && d < tuned.chargeRange) {
      const chargeSpeed = tuned.chargeSpeedBase + ctx.time * tuned.chargeSpeedPerSecond
      e.vx = toP.x * chargeSpeed
      e.vy = toP.y * chargeSpeed
      e.cd = def.attackCooldownSeconds ?? 0
      ctx.burst(e.x, e.y, '#fff27a', 8, 120)
    } else {
      e.vx += Math.sin(e.phase * tuned.wobbleXFrequency) * tuned.wobbleForce * dt
      e.vy += Math.cos(e.phase * tuned.wobbleYFrequency) * tuned.wobbleForce * dt
    }
    return 'alive'
  },
  mine: (e, ctx, dt, def) => {
    const tuned = behavior.mine
    e.vx += Math.sin(e.phase * tuned.wobbleXFrequency) * tuned.wobbleForce * dt
    e.vy += Math.cos(e.phase * tuned.wobbleYFrequency) * tuned.wobbleForce * dt
    if (Math.sqrt(dist2(e, ctx.playerPos)) < tuned.triggerRadius) {
      ctx.damagePlayer(def.contactDamage)
      ctx.killEnemy(e, false)
      return 'consumed'
    }
    return 'alive'
  },
  warden: (e, ctx, dt, def) => {
    const toP = norm(ctx.playerX - e.x, ctx.playerY - e.y)
    const tuned = behavior.warden
    const d = Math.sqrt(dist2(e, ctx.playerPos))
    e.vx += toP.x * (d > tuned.desiredDistance ? tuned.approachForce : tuned.retreatForce) * dt
    e.vy += toP.y * (d > tuned.desiredDistance ? tuned.approachForce : tuned.retreatForce) * dt
    if (e.cd <= 0) {
      e.cd = def.attackCooldownSeconds ?? 0
      for (let k = 0; k < tuned.shotCount; k += 1) {
        const a = (k / tuned.shotCount) * TAU + e.phase
        ctx.spawnHostileBullet({
          x: e.x + Math.cos(a) * e.radius,
          y: e.y + Math.sin(a) * e.radius,
          vx: Math.cos(a) * (def.projectileSpeed ?? 0),
          vy: Math.sin(a) * (def.projectileSpeed ?? 0),
          life: tuned.projectileLife,
          damage: def.projectileDamage ?? 0,
          radius: tuned.projectileRadius,
          color: '#ff5d73'
        })
      }
    }
    return 'alive'
  }
}
