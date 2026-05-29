import { expect, test } from '@playwright/test'

const keys = (...codes: string[]) => new Set(codes)
const button = (pressed = false, value = 0) => ({ pressed, value })

test('player input resolves keyboard movement and aim axes', async () => {
  const { resolvePlayerInputAxes } = await import('../src/player-input')
  const input = resolvePlayerInputAxes({
    keys: keys('KeyW', 'KeyD', 'ArrowLeft', 'KeyI'),
    touchStick: { active: false, startX: 0, startY: 0, x: 0, y: 0 },
    gamepad: null
  })

  expect(input.moveActive).toBe(true)
  expect(input.move.x).toBeCloseTo(Math.SQRT1_2)
  expect(input.move.y).toBeCloseTo(-Math.SQRT1_2)
  expect(input.aimX).toBe(-1)
  expect(input.aimY).toBe(-1)
})

test('touch stick overrides keyboard movement with capped analog magnitude', async () => {
  const { resolvePlayerInputAxes, touchStickVector } = await import('../src/player-input')
  expect(touchStickVector({ active: true, startX: 10, startY: 20, x: 92, y: 20 })).toEqual({ x: 1, y: 0 })

  const input = resolvePlayerInputAxes({
    keys: keys('KeyA'),
    touchStick: { active: true, startX: 0, startY: 0, x: 0, y: 41 },
    gamepad: null
  })

  expect(input.moveActive).toBe(true)
  expect(input.move.x).toBeCloseTo(0)
  expect(input.move.y).toBeCloseTo(1)
})

test('gamepad axes override movement and right stick implies fire', async () => {
  const { resolvePlayerInputAxes } = await import('../src/player-input')
  const input = resolvePlayerInputAxes({
    keys: keys('KeyA'),
    touchStick: { active: false, startX: 0, startY: 0, x: 0, y: 0 },
    gamepad: {
      axes: [0.6, 0, 0, -0.7],
      buttons: [button(false), button(false), button(false), button(true), button(false), button(true), button(false), button(false, 0)]
    }
  })

  expect(input.move.x).toBeCloseTo(1)
  expect(input.move.y).toBeCloseTo(0)
  expect(input.aimX).toBe(0)
  expect(input.aimY).toBeCloseTo(-0.6341)
  expect(input.gamepadFire).toBe(true)
  expect(input.gamepadDash).toBe(true)
  expect(input.gamepadInteract).toBe(true)
})
