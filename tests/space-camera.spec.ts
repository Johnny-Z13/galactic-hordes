import { expect, test } from '@playwright/test'
import { cameraTargetFor, spaceProjectileLifeForOffscreenTravel, spaceProjectileLifeScale, spaceViewportScale, screenToWorld, worldToScreen } from '../src/space-camera'

test('portrait mobile camera zooms out to show more world around the ship', () => {
  const scale = spaceViewportScale(390, 844)
  const target = cameraTargetFor({ x: 1200, y: -340 }, 390, 844, scale)

  expect(scale).toBeCloseTo(0.65, 2)
  expect(390 / scale).toBeGreaterThan(590)
  expect(844 / scale).toBeGreaterThan(1290)
  const screen = worldToScreen({ x: 1200, y: -340 }, target, scale)
  expect(screen.x).toBeCloseTo(195)
  expect(screen.y).toBeCloseTo(422)
})

test('desktop camera keeps the existing one-to-one framing', () => {
  const scale = spaceViewportScale(1280, 720)
  const target = cameraTargetFor({ x: 1200, y: -340 }, 1280, 720, scale)

  expect(scale).toBe(1)
  expect(target).toEqual({ x: 560, y: -700 })
  expect(screenToWorld({ x: 640, y: 360 }, target, scale)).toEqual({ x: 1200, y: -340 })
})

test('projectile life scale keeps mobile compact but lets desktop use the wider view', () => {
  expect(spaceProjectileLifeScale(390, 844, spaceViewportScale(390, 844))).toBe(1)
  expect(spaceProjectileLifeScale(1280, 720, spaceViewportScale(1280, 720))).toBe(2)
  expect(spaceProjectileLifeScale(900, 700, spaceViewportScale(900, 700))).toBeGreaterThan(1)
  expect(spaceProjectileLifeScale(900, 700, spaceViewportScale(900, 700))).toBeLessThan(2)
  expect(spaceProjectileLifeScale(2560, 1440, spaceViewportScale(2560, 1440))).toBe(2)
})

test('starter projectiles live long enough to leave the visible playfield', () => {
  const mobileScale = spaceViewportScale(390, 844)
  const desktopScale = spaceViewportScale(1280, 720)
  const baseLife = 0.62
  const baseSpeed = 650

  expect(spaceProjectileLifeForOffscreenTravel(baseLife, baseSpeed, 390, 844, mobileScale) * baseSpeed)
    .toBeGreaterThan(Math.hypot(390 / mobileScale, 844 / mobileScale) / 2)
  expect(spaceProjectileLifeForOffscreenTravel(baseLife, baseSpeed, 1280, 720, desktopScale) * baseSpeed)
    .toBeGreaterThan(Math.hypot(1280 / desktopScale, 720 / desktopScale) / 2)
})
