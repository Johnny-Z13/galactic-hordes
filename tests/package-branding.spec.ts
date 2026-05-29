import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('package metadata uses the Galactic Hordes project name', () => {
  const manifest = JSON.parse(readFileSync('package.json', 'utf8')) as { name: string }
  const lockfile = JSON.parse(readFileSync('package-lock.json', 'utf8')) as {
    name: string
    packages: Record<string, { name?: string }>
  }

  expect(manifest.name).toBe('galactic-hordes')
  expect(lockfile.name).toBe('galactic-hordes')
  expect(lockfile.packages[''].name).toBe('galactic-hordes')
})

test('browser storage writes use Galactic Hordes keys with legacy fallbacks', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const scoreStorage = readFileSync('src/score-storage.ts', 'utf8')
  const progressStorage = readFileSync('src/persistent-progress-storage.ts', 'utf8')

  expect(scoreStorage).toContain("export const SCORE_STORAGE_KEY = 'galactic_hordes_high_scores_v1'")
  expect(scoreStorage).toContain("export const LEGACY_SCORE_STORAGE_KEYS = ['vector_shooter_high_scores']")
  expect(progressStorage).toContain("export const GRAPHICS_STORAGE_KEY = 'galactic_hordes_graphics_v1'")
  expect(progressStorage).toContain("export const LEGACY_GRAPHICS_STORAGE_KEYS = ['vector_shooter_graphics']")
  expect(scoreStorage).toContain('storage.setItem(SCORE_STORAGE_KEY')
  expect(main).toContain('localStorage.setItem(GRAPHICS_STORAGE_KEY')
  expect(main).not.toContain("localStorage.setItem('vector_shooter_graphics'")
})

test('browser debug global exposes Galactic Hordes name with legacy alias', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain('__galacticHordes?: VectorShooter')
  expect(main).toContain('window.__galacticHordes = new VectorShooter()')
  expect(main).toContain('window.__vectorShooter = window.__galacticHordes')
})
