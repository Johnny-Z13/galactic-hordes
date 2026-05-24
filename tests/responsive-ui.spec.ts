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

const sectorMapMarkup = (css: string) => `
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <style>${css}</style>
  <div id="app">
    <div class="screen sector-map-screen visible">
      <div class="sector-map-panel">
        <div class="sector-map-top">
          <div class="sector-map-title">
            <span>RUN ROUTE</span>
            <h1>SECTOR MAP</h1>
            <p>Choose the next jump. Route progress resets on death; mothership upgrades persist.</p>
          </div>
          <div class="sector-map-status">
            <span><b>0</b> CLEARED</span>
            <span><b>3</b> ROUTES</span>
            <span><b>0</b> SCRAP</span>
          </div>
        </div>
        <div class="sector-map-body">
          <div class="sector-map-graph">
            <svg class="sector-map-lines" viewBox="0 0 100 100">
              <line class="available" x1="8" y1="48" x2="25" y2="18"></line>
              <line class="available" x1="8" y1="48" x2="25" y2="38"></line>
              <line class="locked" x1="25" y1="18" x2="42" y2="38"></line>
            </svg>
            <button class="sector-node mothership completed current" style="left: 8%; top: 48%" type="button" disabled>
              <span class="sector-node-glyph">M</span><span class="sector-node-label">MOTHERSHIP</span>
            </button>
            <button class="sector-node hostile available" style="left: 25%; top: 18%" type="button">
              <span class="sector-node-glyph">H</span><span class="sector-node-label">SAFE DRIFT</span>
            </button>
            <button class="sector-node planet available" style="left: 25%; top: 38%" type="button">
              <span class="sector-node-glyph">P</span><span class="sector-node-label">PLANET CLUSTER</span>
            </button>
            <button class="sector-node final locked" style="left: 92%; top: 48%" type="button" disabled>
              <span class="sector-node-glyph">F</span><span class="sector-node-label">LAST STAND</span>
            </button>
          </div>
          <div class="sector-map-details">
            <div class="sector-map-current">
              <span>CURRENT NODE</span>
              <h2>MOTHERSHIP</h2>
              <p>Safe launch node with light scouts and normal route access.</p>
            </div>
            <div class="sector-choice-list">
              <button class="sector-choice hostile" type="button">
                <span class="sector-choice-kind">COMBAT</span>
                <b>SAFE DRIFT 1-1</b>
                <small>Safe drift. Low pressure, modest rewards.</small>
                <i>PLANETS 1-2 / WAVES 1 SCOUTS / HAZARDS CLEAR / PRESSURE x0.50</i>
              </button>
              <button class="sector-choice planet" type="button">
                <span class="sector-choice-kind">PLANET</span>
                <b>PLANET CLUSTER 1-2</b>
                <small>Planet route. More landings, moderate pressure.</small>
                <i>PLANETS 3-6 / WAVES 2 SWARM / HAZARDS CLEAR / PRESSURE x0.88</i>
              </button>
              <details class="sector-debug-readout">
                <summary>ROUTE DEBUG</summary>
                <div class="sector-debug-row"><b>SAFE DRIFT 1-1</b><span>safeDrift / d0.20 / safe</span></div>
              </details>
            </div>
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

test('sector map route planner keeps graph and first route visible across app breakpoints', async ({ browser }) => {
  for (const viewport of [
    ...touchViewports,
    { name: 'desktop', width: 1440, height: 900, isMobile: false }
  ]) {
    const { context, page } = await renderShell(browser, viewport, viewport.isMobile)
    await page.setContent(sectorMapMarkup(styles()))

    const graphBox = await page.locator('.sector-map-graph').boundingBox()
    const firstChoiceBox = await page.locator('.sector-choice').first().boundingBox()
    const detailsDisplay = await page.locator('.sector-map-body').evaluate((el) => getComputedStyle(el).gridTemplateColumns)
    const debugOpen = await page.locator('.sector-debug-readout').evaluate((el) => (el as HTMLDetailsElement).open)

    expect(graphBox, `${viewport.name} sector graph should render`).not.toBeNull()
    expect(firstChoiceBox, `${viewport.name} first route should render`).not.toBeNull()
    expect(firstChoiceBox!.y, `${viewport.name} first route top`).toBeGreaterThanOrEqual(0)
    expect(firstChoiceBox!.y, `${viewport.name} first route starts inside first viewport`).toBeLessThan(viewport.height)
    expect(firstChoiceBox!.x + firstChoiceBox!.width, `${viewport.name} first route right edge`).toBeLessThanOrEqual(viewport.width)
    expect(debugOpen, `${viewport.name} debug readout should stay collapsed`).toBe(false)

    if (viewport.width <= 980) {
      expect(detailsDisplay.split(' ').length, `${viewport.name} uses stacked sector map layout`).toBe(1)
    }

    await context.close()
  }
})
