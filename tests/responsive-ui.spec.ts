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
          <div class="sector-map-graph sector-map-starchart">
            <div class="sector-map-graph-header"><span>LOCAL STARCHART</span><b>2 ROUTES OPEN</b></div>
            <svg class="sector-map-lines" viewBox="0 0 100 100">
              <line class="available" x1="8" y1="48" x2="25" y2="18"></line>
              <line class="available" x1="8" y1="48" x2="25" y2="38"></line>
              <line class="locked" x1="25" y1="18" x2="42" y2="38"></line>
            </svg>
            <button class="sector-node mothership completed current" style="left: 8%; top: 48%" type="button" disabled>
              <span class="sector-node-core"><span class="sector-node-glyph">M</span></span><span class="sector-node-label">MOTHERSHIP</span><span class="sector-node-state">HERE</span>
            </button>
            <button class="sector-node hostile available" style="left: 25%; top: 18%" type="button">
              <span class="sector-node-core"><span class="sector-node-glyph">H</span></span><span class="sector-node-label">SAFE DRIFT</span><span class="sector-node-state">OPEN</span>
            </button>
            <button class="sector-node planet available" style="left: 25%; top: 38%" type="button">
              <span class="sector-node-core"><span class="sector-node-glyph">P</span></span><span class="sector-node-label">PLANET CLUSTER</span><span class="sector-node-state">OPEN</span>
            </button>
            <button class="sector-node final locked" style="left: 92%; top: 48%" type="button" disabled>
              <span class="sector-node-core"><span class="sector-node-glyph">F</span></span><span class="sector-node-label">LAST STAND</span><span class="sector-node-state">LOCK</span>
            </button>
            <div class="sector-map-legend">
              <span><i class="legend-swatch planet"></i>Planet</span>
              <span><i class="legend-swatch hostile"></i>Combat</span>
              <span><i class="legend-swatch anomaly"></i>Hazard</span>
              <span><i class="legend-swatch station"></i>Station</span>
            </div>
          </div>
          <div class="sector-map-details">
            <div class="sector-map-current">
              <span>CURRENT NODE</span>
              <h2>MOTHERSHIP</h2>
              <p>Safe launch node with light scouts and normal route access.</p>
            </div>
            <div class="sector-choice-list">
              <button class="sector-choice hostile" type="button">
                <span class="sector-choice-head"><span class="sector-choice-kind">COMBAT</span><b class="sector-choice-title">SAFE DRIFT 1-1</b></span>
                <small>Safe drift. Low pressure, modest rewards.</small>
                <span class="sector-choice-intel"><span>RECOVER</span><span>SALVAGE</span><span>LOW RISK</span></span>
                <span class="sector-choice-metrics"><span><b>1-2</b><em>PLANETS</em></span><span><b>1</b><em>SCOUTS</em></span><span><b>x0.50</b><em>PRESSURE</em></span><span><b>CLEAR</b><em>HAZARDS</em></span></span>
                <i class="sector-choice-readout">PLANETS 1-2 / WAVES 1 SCOUTS / HAZARDS CLEAR / PRESSURE x0.50</i>
              </button>
              <button class="sector-choice planet" type="button">
                <span class="sector-choice-head"><span class="sector-choice-kind">PLANET</span><b class="sector-choice-title">PLANET CLUSTER 1-2</b></span>
                <small>Planet route. More landings, moderate pressure.</small>
                <span class="sector-choice-intel"><span>LANDINGS</span><span>PLANETS</span><span>MED RISK</span></span>
                <span class="sector-choice-metrics"><span><b>3-6</b><em>PLANETS</em></span><span><b>2</b><em>SWARM</em></span><span><b>x0.88</b><em>PRESSURE</em></span><span><b>CLEAR</b><em>HAZARDS</em></span></span>
                <i class="sector-choice-readout">PLANETS 3-6 / WAVES 2 SWARM / HAZARDS CLEAR / PRESSURE x0.88</i>
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

const gameOverMarkup = (css: string) => `
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <style>${css}</style>
  <div id="app">
    <div class="screen gameover-screen visible">
      <div class="panel debrief-panel">
        <h1 class="title">BLACK BOX RECOVERED</h1>
        <p class="copy">The scout ship was lost. The mothership recovered partial cargo and all transmitted discoveries.</p>
        <div class="debrief-grid">
          <div><b>320</b><span>Scrap Recovered</span></div>
          <div><b>24</b><span>Crystals Recovered</span></div>
          <div><b>2</b><span>Cores Recovered</span></div>
          <div><b>7</b><span>Discoveries Logged</span></div>
          <div><b>150</b><span>Light Years</span></div>
          <div><b>3</b><span>Stations Docked</span></div>
        </div>
        <p class="copy small">Lathe Relay // Umber Choir // Pale Glass Archive // Station 29</p>
        <p class="copy small">Station route: Waystation 29 // Waystation 99 // Cinder Port</p>
        <input class="name-entry" placeholder="ACE" />
        <div class="button-row">
          <button class="vector-button" type="button">Return to Title</button>
          <button class="vector-button secondary" type="button">Scores</button>
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

test('game over black box fills mobile viewport without document scrolling', async ({ browser }) => {
  for (const viewport of [
    { name: 'iPhone portrait', width: 390, height: 844, isMobile: true },
    { name: 'short phone landscape', width: 844, height: 390, isMobile: true }
  ]) {
    const { context, page } = await renderShell(browser, viewport, true)
    await page.setContent(gameOverMarkup(styles()))

    const metrics = await page.evaluate(() => {
      const screen = document.querySelector('.gameover-screen')!
      const panel = document.querySelector('.gameover-screen .panel')!
      const actions = document.querySelector('.gameover-screen .button-row')!
      const screenBox = screen.getBoundingClientRect()
      const panelBox = panel.getBoundingClientRect()
      const actionsBox = actions.getBoundingClientRect()
      return {
        bodyScrollHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight,
        screen: {
          x: screenBox.x,
          y: screenBox.y,
          width: screenBox.width,
          height: screenBox.height
        },
        panel: {
          x: panelBox.x,
          y: panelBox.y,
          width: panelBox.width,
          height: panelBox.height
        },
        actionsBottom: actionsBox.bottom,
        screenOverflowY: getComputedStyle(screen).overflowY,
        panelOverflowY: getComputedStyle(panel).overflowY
      }
    })

    expect(metrics.bodyScrollHeight, `${viewport.name} document height`).toBeLessThanOrEqual(metrics.viewportHeight)
    expect(metrics.screen.width, `${viewport.name} screen width`).toBe(viewport.width)
    expect(metrics.screen.height, `${viewport.name} screen height`).toBe(viewport.height)
    expect(metrics.panel.x, `${viewport.name} panel x`).toBe(0)
    expect(metrics.panel.y, `${viewport.name} panel y`).toBe(0)
    expect(metrics.panel.width, `${viewport.name} panel width`).toBe(viewport.width)
    expect(metrics.panel.height, `${viewport.name} panel height`).toBe(viewport.height)
    expect(metrics.actionsBottom, `${viewport.name} actions bottom`).toBeLessThanOrEqual(viewport.height)
    expect(metrics.screenOverflowY, `${viewport.name} screen overflow`).toBe('hidden')
    expect(metrics.panelOverflowY, `${viewport.name} panel overflow`).toBe('hidden')

    await context.close()
  }
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
