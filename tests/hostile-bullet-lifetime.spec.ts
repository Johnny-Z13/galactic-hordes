import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')

test('hostile bullets expire only after travelling off screen or hitting the player', () => {
  const main = source()

  expect(main).toContain('const bulletExpired = !b.hostile && b.life <= 0')
  expect(main).toContain('const bulletOffscreen =')
  expect(main).toContain('if (bulletExpired || bulletOffscreen)')
  expect(main).not.toContain('b.life <= 0 ||\n        Math.abs(b.x - this.player.x) > spaceEnemyBehavior.global.bulletDespawnDistance')
})
