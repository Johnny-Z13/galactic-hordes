import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('surface effect layer mode is shared across particle and shockwave rendering', async () => {
  const modulePath = '../src/render/effect-layer'
  const helper = await import(modulePath).catch(() => null)
  expect(helper).not.toBeNull()

  const { surfaceEffectMode, effectLayerCamera } = helper as {
    surfaceEffectMode: (input: { hasSurface: boolean; state: string; transitionProgress: number }) => boolean
    effectLayerCamera: (input: {
      surfaceMode: boolean
      surfaceCamera: { x: number; y: number } | null
      spaceCamera: { x: number; y: number }
    }) => { x: number; y: number }
  }

  expect(surfaceEffectMode({ hasSurface: false, state: 'surface', transitionProgress: 1 })).toBe(false)
  expect(surfaceEffectMode({ hasSurface: true, state: 'surface', transitionProgress: 0 })).toBe(true)
  expect(surfaceEffectMode({ hasSurface: true, state: 'takeoff', transitionProgress: 0 })).toBe(true)
  expect(surfaceEffectMode({ hasSurface: true, state: 'landing', transitionProgress: 0.58 })).toBe(false)
  expect(surfaceEffectMode({ hasSurface: true, state: 'landing', transitionProgress: 0.59 })).toBe(true)
  expect(surfaceEffectMode({ hasSurface: true, state: 'playing', transitionProgress: 1 })).toBe(false)

  const surfaceCamera = { x: 24, y: 40 }
  const spaceCamera = { x: 240, y: 400 }
  expect(effectLayerCamera({ surfaceMode: true, surfaceCamera, spaceCamera })).toBe(surfaceCamera)
  expect(effectLayerCamera({ surfaceMode: false, surfaceCamera, spaceCamera })).toBe(spaceCamera)
  expect(effectLayerCamera({ surfaceMode: true, surfaceCamera: null, spaceCamera })).toBe(spaceCamera)
})

test('main delegates effect coordinate mode instead of duplicating transition rules', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain("from './render/effect-layer'")
  expect(main).toContain('surfaceEffectMode({')
  expect(main).toContain('effectLayerCamera({')
  expect(main).not.toContain("this.state === 'surface' || this.state === 'takeoff' || (this.state === 'landing'")
})
