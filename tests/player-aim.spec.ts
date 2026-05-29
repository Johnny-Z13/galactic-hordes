import { expect, test } from '@playwright/test'

test('player aim uses explicit aim axes before mouse or auto target', async () => {
  const { resolvePlayerAim } = await import('../src/player-aim')
  const aim = resolvePlayerAim({
    aimX: 0,
    aimY: -1,
    previousAimAngle: 1.25,
    player: { x: 10, y: 10 },
    mouseWorld: { x: 30, y: 10 },
    autoTarget: { x: 10, y: 40 },
    isPlaying: true
  })

  expect(aim.aiming).toBe(true)
  expect(aim.aimAngle).toBeCloseTo(-Math.PI / 2)
  expect(aim.autoFire).toBe(false)
})

test('player aim falls back to mouse world position when axes are idle', async () => {
  const { resolvePlayerAim } = await import('../src/player-aim')
  const aim = resolvePlayerAim({
    aimX: 0,
    aimY: 0,
    previousAimAngle: 1.25,
    player: { x: 10, y: 10 },
    mouseWorld: { x: 30, y: 10 },
    autoTarget: { x: 10, y: 40 },
    isPlaying: true
  })

  expect(aim.aiming).toBe(true)
  expect(aim.aimAngle).toBeCloseTo(0)
  expect(aim.autoFire).toBe(false)
})

test('player aim auto targets only while playing when direct aiming is idle', async () => {
  const { resolvePlayerAim } = await import('../src/player-aim')
  const idle = resolvePlayerAim({
    aimX: 0,
    aimY: 0,
    previousAimAngle: 1.25,
    player: { x: 10, y: 10 },
    mouseWorld: null,
    autoTarget: { x: 10, y: 40 },
    isPlaying: false
  })
  const active = resolvePlayerAim({
    aimX: 0,
    aimY: 0,
    previousAimAngle: 1.25,
    player: { x: 10, y: 10 },
    mouseWorld: null,
    autoTarget: { x: 10, y: 40 },
    isPlaying: true
  })

  expect(idle.aiming).toBe(false)
  expect(idle.aimAngle).toBe(1.25)
  expect(idle.autoFire).toBe(false)
  expect(active.aiming).toBe(true)
  expect(active.aimAngle).toBeCloseTo(Math.PI / 2)
  expect(active.autoFire).toBe(true)
})
