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
