import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')

test('game over and debrief actions return to the title screen', () => {
  const main = source()

  expect(main).toContain("if (e.code === 'Enter' && this.state === 'gameover') this.returnToTitleFromGameOver()")
  expect(main).toContain('private returnToTitleFromGameOver(')
  expect(main).toContain("continueButton.textContent = 'Return to Title'")
  expect(main).toContain('this.returnToTitleFromGameOver(input)')
  expect(main).toContain("retry.textContent = 'Title Screen'")
  expect(main).not.toContain("continueButton.textContent = 'Return to Mothership'")
})
