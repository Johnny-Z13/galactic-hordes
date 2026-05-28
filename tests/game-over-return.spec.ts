import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const debriefSource = () => readFileSync(resolve(process.cwd(), 'src/ui/debrief.ts'), 'utf8')

test('game over and debrief actions return to the title screen', () => {
  const main = source()
  const debrief = debriefSource()

  expect(main).toContain("if (e.code === 'Enter' && this.state === 'gameover') this.returnToTitleFromGameOver()")
  expect(main).toContain("this.ui.gameover.className = 'screen gameover-screen'")
  expect(main).toContain('private returnToTitleFromGameOver(')
  expect(debrief).toContain("continueButton.textContent = 'Return to Title'")
  expect(debrief).toContain("self['returnToTitleFromGameOver'](input)")
  expect(debrief).toContain("retry.textContent = 'Title Screen'")
  expect(debrief).not.toContain("continueButton.textContent = 'Return to Mothership'")
})
