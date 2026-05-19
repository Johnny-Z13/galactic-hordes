import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const styles = () => readFileSync(resolve(process.cwd(), 'src/style.css'), 'utf8')

test('planet popups center their copy and action buttons', () => {
  const main = source()
  const css = styles()

  expect(main.match(/panel\.className = 'panel planet-panel'/g)?.length).toBe(3)
  expect(css).toContain('.planet-panel')
  expect(css).toContain('justify-items: center')
  expect(css).toContain('.planet-panel .button-row')
  expect(css).toContain('justify-content: center')
})
