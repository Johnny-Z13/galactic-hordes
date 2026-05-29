import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

test('balance documentation generator is wired into package scripts and git hook', () => {
  const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> }

  expect(pkg.scripts['docs:balance']).toBe('node scripts/update-balance-docs.mjs')
  expect(pkg.scripts['hooks:install']).toBe('git config core.hooksPath .githooks')
  expect(pkg.scripts.test).toBe('playwright test')
  expect(read('.githooks/pre-commit')).toContain('npm run docs:balance')
})

test('README and balance design doc contain generated balance sections', () => {
  for (const path of ['README.md', 'docs/game-balance-design.md']) {
    const doc = read(path)

    expect(doc).toContain('<!-- BALANCE-GENERATED:START -->')
    expect(doc).toContain('<!-- BALANCE-GENERATED:END -->')
    expect(doc).toContain('Active balance mode')
    expect(doc).toContain('| Enemy | HP | Speed | Contact |')
    expect(doc).toContain('Run And Surface Balance Snapshot')
    expect(doc).toContain('Sector Node Config Snapshot')
    expect(doc).toContain('src/run-balance.ts')
    expect(doc).toContain('src/surface-balance.ts')
    expect(doc).toContain('src/sector-map.ts')
  }
})

test('generated balance tables do not keep carriage returns inside cells', () => {
  for (const path of ['README.md', 'docs/game-balance-design.md']) {
    const doc = read(path)
    const generated = doc.slice(doc.indexOf('<!-- BALANCE-GENERATED:START -->'), doc.indexOf('<!-- BALANCE-GENERATED:END -->'))

    expect(generated).not.toContain('\r |')
  }
})
