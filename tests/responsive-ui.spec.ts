import { expect, test, type Browser } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const styles = () => readFileSync(resolve(process.cwd(), 'src/style.css'), 'utf8')

type ViewportCase = {
  name: string
  width: number
  height: number
  isMobile: boolean
}

const touchViewports: ViewportCase[] = [
  { name: 'iPhone portrait', width: 390, height: 844, isMobile: true },
  { name: 'iPad portrait', width: 820, height: 1180, isMobile: true },
  { name: 'iPad landscape', width: 1180, height: 820, isMobile: true }
]

const shellMarkup = (css: string) => `
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <style>${css}</style>
  <div id="app">
    <div class="game-shell">
      <canvas></canvas>
      <div class="hud">
        <div class="minimap"></div>
        <div class="touch-controls visible">
          <div class="touch-buttons">
            <button class="touch-button action hidden" type="button">ACTION</button>
            <button class="touch-button dash" type="button">DASH</button>
          </div>
        </div>
      </div>
    </div>
  </div>
`

const renderShell = async (browser: Browser, viewport: ViewportCase, hasTouch: boolean) => {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    hasTouch,
    isMobile: viewport.isMobile
  })
  const page = await context.newPage()
  await page.setContent(shellMarkup(styles()))
  return { context, page }
}

test('touch dash control stays visible and in bounds on phone and tablet layouts', async ({ browser }) => {
  for (const viewport of touchViewports) {
    const { context, page } = await renderShell(browser, viewport, true)
    const dash = page.locator('.touch-button.dash')
    const dashBox = await dash.boundingBox()
    const minimapBox = await page.locator('.minimap').boundingBox()

    expect(dashBox, `${viewport.name} dash button should render`).not.toBeNull()
    expect(minimapBox, `${viewport.name} minimap should render`).not.toBeNull()

    const dashRect = dashBox!
    const minimapRect = minimapBox!
    const overlapX = Math.max(0, Math.min(dashRect.x + dashRect.width, minimapRect.x + minimapRect.width) - Math.max(dashRect.x, minimapRect.x))
    const overlapY = Math.max(0, Math.min(dashRect.y + dashRect.height, minimapRect.y + minimapRect.height) - Math.max(dashRect.y, minimapRect.y))

    expect(dashRect.width, `${viewport.name} dash touch target width`).toBeGreaterThanOrEqual(72)
    expect(dashRect.height, `${viewport.name} dash touch target height`).toBeGreaterThanOrEqual(72)
    expect(dashRect.x, `${viewport.name} dash left edge`).toBeGreaterThanOrEqual(0)
    expect(dashRect.y, `${viewport.name} dash top edge`).toBeGreaterThanOrEqual(0)
    expect(dashRect.x + dashRect.width, `${viewport.name} dash right edge`).toBeLessThanOrEqual(viewport.width)
    expect(dashRect.y + dashRect.height, `${viewport.name} dash bottom edge`).toBeLessThanOrEqual(viewport.height)
    expect(overlapX * overlapY, `${viewport.name} dash should not overlap minimap`).toBe(0)

    await context.close()
  }
})

test('desktop pointer layout keeps touch controls hidden', async ({ browser }) => {
  const { context, page } = await renderShell(browser, { name: 'desktop', width: 1440, height: 900, isMobile: false }, false)
  await expect(page.locator('.touch-controls.visible')).toHaveCSS('display', 'none')
  await context.close()
})
