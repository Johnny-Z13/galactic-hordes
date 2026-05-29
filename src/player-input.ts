import type { Vec } from './main-types'
import { norm } from './math-utils'

export interface TouchStickState {
  active: boolean
  startX: number
  startY: number
  x: number
  y: number
}

interface GamepadButtonLike {
  pressed?: boolean
  value?: number
}

interface GamepadLike {
  axes: ArrayLike<number>
  buttons: ArrayLike<GamepadButtonLike | undefined>
}

export interface PlayerInputAxesInput {
  keys: ReadonlySet<string>
  touchStick: TouchStickState
  gamepad?: GamepadLike | null
}

export interface PlayerInputAxes {
  move: Vec
  moveActive: boolean
  aimX: number
  aimY: number
  gamepadFire: boolean
  gamepadDash: boolean
  gamepadInteract: boolean
}

const TOUCH_STICK_RADIUS = 82
const GAMEPAD_DEADZONE = 0.18

export const gamepadDeadzone = (value: number) => {
  if (Math.abs(value) < GAMEPAD_DEADZONE) return 0
  return Math.sign(value) * ((Math.abs(value) - GAMEPAD_DEADZONE) / (1 - GAMEPAD_DEADZONE))
}

export const touchStickVector = (touchStick: TouchStickState): Vec => {
  if (!touchStick.active) return { x: 0, y: 0 }

  const dx = touchStick.x - touchStick.startX
  const dy = touchStick.y - touchStick.startY
  const distance = Math.min(TOUCH_STICK_RADIUS, Math.hypot(dx, dy))
  const direction = Math.atan2(dy, dx)
  return {
    x: Math.cos(direction) * (distance / TOUCH_STICK_RADIUS),
    y: Math.sin(direction) * (distance / TOUCH_STICK_RADIUS)
  }
}

export const resolvePlayerInputAxes = ({ keys, touchStick, gamepad }: PlayerInputAxesInput): PlayerInputAxes => {
  let mx = 0
  let my = 0
  if (keys.has('KeyA')) mx -= 1
  if (keys.has('KeyD')) mx += 1
  if (keys.has('KeyW')) my -= 1
  if (keys.has('KeyS')) my += 1

  if (touchStick.active) {
    const touchMove = touchStickVector(touchStick)
    mx = touchMove.x
    my = touchMove.y
  }

  let aimX = 0
  let aimY = 0
  if (keys.has('ArrowLeft') || keys.has('KeyJ')) aimX -= 1
  if (keys.has('ArrowRight') || keys.has('KeyL')) aimX += 1
  if (keys.has('ArrowUp') || keys.has('KeyI')) aimY -= 1
  if (keys.has('ArrowDown') || keys.has('KeyK')) aimY += 1

  let gamepadFire = false
  let gamepadDash = false
  let gamepadInteract = false

  if (gamepad) {
    const lx = gamepadDeadzone(gamepad.axes[0] ?? 0)
    const ly = gamepadDeadzone(gamepad.axes[1] ?? 0)
    const rx = gamepadDeadzone(gamepad.axes[2] ?? 0)
    const ry = gamepadDeadzone(gamepad.axes[3] ?? 0)

    if (Math.abs(lx) + Math.abs(ly) > 0) {
      mx = lx
      my = ly
    }
    if (Math.abs(rx) + Math.abs(ry) > 0) {
      aimX = rx
      aimY = ry
      gamepadFire = true
    }

    gamepadFire ||= (gamepad.buttons[7]?.value ?? 0) > 0.45 || !!gamepad.buttons[0]?.pressed
    gamepadDash ||= !!gamepad.buttons[1]?.pressed || !!gamepad.buttons[5]?.pressed
    gamepadInteract ||= !!gamepad.buttons[3]?.pressed
  }

  const moveActive = Math.abs(mx) + Math.abs(my) > 0.04
  const move = norm(mx, my)
  if (!moveActive) {
    move.x = 0
    move.y = 0
  }

  return {
    move,
    moveActive,
    aimX,
    aimY,
    gamepadFire,
    gamepadDash,
    gamepadInteract
  }
}
