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
          <div class="sector-map-graph sector-map-hexchart">
            <div class="sector-map-graph-header"><span>LOCAL HEX FRONTIER</span><b>2 ADJACENT JUMPS</b></div>
            <div class="sector-route-string">MOTHERSHIP</div>
            <svg class="sector-map-lines" viewBox="0 0 100 100">
              <line class="available" x1="50" y1="50" x2="61" y2="50"></line>
              <line class="available" x1="50" y1="50" x2="56" y2="60"></line>
              <line class="locked" x1="61" y1="50" x2="67" y2="60"></line>
            </svg>
            <button class="sector-node mothership completed current" style="left: 50%; top: 50%" type="button" disabled>
              <span class="sector-node-core" aria-hidden="true"></span><span class="sector-node-label">MOTHERSHIP</span><span class="sector-node-state">HERE</span>
            </button>
            <button class="sector-node hostile available" style="left: 61%; top: 50%" type="button">
              <span class="sector-node-core" aria-hidden="true"></span><span class="sector-node-label">SAFE DRIFT</span><span class="sector-node-state">JUMP</span><span class="sector-station-edges"><i class="station-edge w"></i></span>
            </button>
            <button class="sector-node planet available" style="left: 56%; top: 60%" type="button">
              <span class="sector-node-core" aria-hidden="true"></span><span class="sector-node-label">PLANET CLUSTER</span><span class="sector-node-state">JUMP</span><span class="sector-station-edges"><i class="station-edge nw"></i></span>
            </button>
            <button class="sector-node final locked sector-node-frontier" style="left: 84%; top: 50%" type="button" disabled>
              <span class="sector-node-core" aria-hidden="true"></span><span class="sector-node-label">LAST STAND</span><span class="sector-node-state">LOCK</span>
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
            <div class="sector-selection-readout">
              <span>JUMP TARGET</span>
              <h2>Select Adjacent Hex</h2>
              <p>Illuminated edges are legal jumps from the current sector. Tap one to lock the readout before launch.</p>
              <span class="sector-choice-intel"><span>EDGE LIT</span><span>HEX WIREFRAME</span><span>AWAITING LOCK</span></span>
            </div>
            <button class="vector-button sector-launch-button" type="button" disabled>Select Sector</button>
            <details class="sector-debug-readout">
              <summary>ROUTE DEBUG</summary>
              <div class="sector-debug-row"><b>SAFE DRIFT 1-1</b><span>safeDrift / d0.20 / safe</span></div>
            </details>
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
        <section class="debrief-log">
          <span>EXPEDITION LOG</span>
          <b>LATHE RELAY DEEP ROUTE</b>
          <ul>
            <li>187 LY travelled across 4 route nodes.</li>
            <li>2 planets surveyed with 3 discoveries logged.</li>
            <li>Docked at LATHE RELAY.</li>
            <li>Skipped 2 station beacons for deep-route recovery.</li>
          </ul>
        </section>
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

const titleMarkup = (css: string) => `
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <style>${css}</style>
  <div id="app">
    <div class="screen title-screen visible">
      <div class="title-panel">
        <div class="front-menu-top">
          <button class="front-menu-pill danger" type="button">Quit</button>
          <div class="front-menu-cargo"><span></span><b>0</b></div>
          <button class="front-menu-pill" type="button">Options</button>
        </div>
        <h1 class="title-wordmark"><span>GALACTIC</span><span>HORDES</span></h1>
        <div class="front-menu-spacer"></div>
        <div class="title-actions">
          <button class="vector-button start-button" type="button">Launch Expedition</button>
          <button class="vector-button secondary" type="button">Collection</button>
          <button class="vector-button" type="button">Power Up</button>
          <button class="vector-button secondary" type="button">Scores</button>
          <button class="vector-button secondary danger tiny" type="button">Reset Progress</button>
        </div>
        <div class="front-menu-footer">
          <span><b>0</b> discoveries</span>
          <span><b>0</b> systems</span>
          <span><b>0</b> best</span>
        </div>
      </div>
    </div>
  </div>
`

const mothershipMarkup = (css: string) => `
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <style>${css}</style>
  <div id="app">
    <div class="screen mothership-screen visible">
      <div class="mothership-command first-command">
        <header class="mothership-command-top">
          <div class="mothership-command-title">
            <span>COMMAND DECK</span>
            <h1>MOTHERSHIP</h1>
            <p>First scout is hot. Find a signal world, crack one cache, and bring something impossible home.</p>
          </div>
          <div class="mothership-resources">
            <span><b>Scrap</b>0</span>
            <span><b>Crystals</b>0</span>
            <span><b>Cores</b>0</span>
          </div>
        </header>
        <section class="mothership-flight">
          <div class="mothership-launch-stack">
            <div class="mothership-ship-bay">
              <div class="mothership-ship-art"></div>
              <button class="vector-button start-button mothership-launch" type="button">Open Sector Map</button>
              <div class="mothership-launch-meters">
                <div class="mothership-meter health"><div><span>Hull Integrity</span><b>100%</b></div><i><em style="width:100%"></em></i></div>
                <div class="mothership-meter xp"><div><span>Mutation XP</span><b>LV 1 // 0/80</b></div><i><em style="width:0%"></em></i></div>
                <div class="mothership-meter archive"><div><span>Archive Signal</span><b>0 records</b></div><i><em style="width:0%"></em></i></div>
              </div>
            </div>
            <section class="mothership-route-preview">
              <div class="mothership-route-head">
                <b>SECTOR MAP</b>
                <span>MOTHERSHIP // 3 jump routes armed</span>
              </div>
              <div class="mothership-route-map" aria-label="Sector route preview">
                <svg class="mothership-route-lines" viewBox="0 0 100 100" aria-hidden="true">
                  <line x1="8" y1="52" x2="28" y2="24"></line>
                  <line x1="8" y1="52" x2="28" y2="52"></line>
                  <line x1="8" y1="52" x2="28" y2="78"></line>
                </svg>
                <span class="mothership-route-node current" style="left:8%;top:52%"><b>M</b><em>MOTHERSHIP</em></span>
                <span class="mothership-route-node available hostile" style="left:28%;top:24%"><b>H</b><em>SAFE DRIFT</em></span>
                <span class="mothership-route-node available planet" style="left:28%;top:52%"><b>P</b><em>PLANET CLUSTER</em></span>
                <span class="mothership-route-node locked final" style="left:88%;top:52%"><b>F</b><em>LAST STAND</em></span>
              </div>
            </section>
          </div>
        </section>
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

test('title launch action stays readable across app breakpoints', async ({ browser }) => {
  for (const viewport of [
    ...touchViewports,
    { name: 'desktop', width: 1440, height: 900, isMobile: false }
  ]) {
    const { context, page } = await renderShell(browser, viewport, viewport.isMobile)
    await page.setContent(titleMarkup(styles()))

    const buttonBox = await page.locator('.start-button').boundingBox()
    const metrics = await page.locator('.start-button').evaluate((button) => ({
      clientWidth: button.clientWidth,
      scrollWidth: button.scrollWidth,
      text: button.textContent?.trim()
    }))

    expect(buttonBox, `${viewport.name} launch action should render`).not.toBeNull()
    expect(metrics.text).toBe('Launch Expedition')
    expect(buttonBox!.x, `${viewport.name} launch action left edge`).toBeGreaterThanOrEqual(0)
    expect(buttonBox!.x + buttonBox!.width, `${viewport.name} launch action right edge`).toBeLessThanOrEqual(viewport.width)
    expect(metrics.scrollWidth, `${viewport.name} launch copy should fit`).toBeLessThanOrEqual(metrics.clientWidth)

    await context.close()
  }
})

test('mothership launch deck keeps route preview inside phone viewport', async ({ browser }) => {
  const viewport = { name: 'iPhone portrait', width: 390, height: 844, isMobile: true }
  const { context, page } = await renderShell(browser, viewport, true)
  await page.setContent(mothershipMarkup(styles()))

  const routePreviewBox = await page.locator('.mothership-route-preview').boundingBox()
  const launchBox = await page.locator('.mothership-launch').boundingBox()

  expect(launchBox, 'launch action should render').not.toBeNull()
  expect(routePreviewBox, 'route preview should render').not.toBeNull()
  expect(routePreviewBox!.y, 'route preview top').toBeGreaterThanOrEqual(0)
  expect(routePreviewBox!.y + routePreviewBox!.height, 'route preview bottom').toBeLessThanOrEqual(viewport.height)
  expect(launchBox!.x + launchBox!.width, 'launch action right edge').toBeLessThanOrEqual(viewport.width)

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
    const readoutBox = await page.locator('.sector-selection-readout').boundingBox()
    const launchBox = await page.locator('.sector-launch-button').boundingBox()
    const detailsDisplay = await page.locator('.sector-map-body').evaluate((el) => getComputedStyle(el).gridTemplateColumns)
    const debugOpen = await page.locator('.sector-debug-readout').evaluate((el) => (el as HTMLDetailsElement).open)

    expect(graphBox, `${viewport.name} sector graph should render`).not.toBeNull()
    expect(readoutBox, `${viewport.name} sector readout should render`).not.toBeNull()
    expect(launchBox, `${viewport.name} launch action should render`).not.toBeNull()
    expect(readoutBox!.y, `${viewport.name} readout top`).toBeGreaterThanOrEqual(0)
    expect(readoutBox!.y, `${viewport.name} readout starts inside first viewport`).toBeLessThan(viewport.height)
    expect(readoutBox!.x + readoutBox!.width, `${viewport.name} readout right edge`).toBeLessThanOrEqual(viewport.width)
    expect(launchBox!.x + launchBox!.width, `${viewport.name} launch right edge`).toBeLessThanOrEqual(viewport.width)
    expect(debugOpen, `${viewport.name} debug readout should stay collapsed`).toBe(false)

    if (viewport.width <= 980) {
      expect(detailsDisplay.split(' ').length, `${viewport.name} uses stacked sector map layout`).toBe(1)
    }

    await context.close()
  }
})
