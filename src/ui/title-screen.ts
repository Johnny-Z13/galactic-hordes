import titleLogoMarkUrl from '../assets/title-logo-mark.png'

interface TitleScreenView extends Object {}

interface TitleScreenRuntime {
  state: 'title'
  ui: {
    title: HTMLElement
  }
  mothership: {
    archive: {
      records: Record<string, unknown>
    }
    departments: Record<string, number>
    resources: {
      cores: number
    }
  }
  highs: Array<{ score: number }>
  toast(message: string): void
  cycleGraphicsMode(): void
  showMothership(): void
  showCollection(): void
  showPowerUps(): void
  showScores(): void
  resetPersistentProgress(): void
  showOnly(which: 'title'): void
}

function titleRuntime(self: TitleScreenView) {
  return self as TitleScreenRuntime
}

export function showTitle(self: TitleScreenView) {
  const runtime = titleRuntime(self)
  runtime.state = 'title'
  runtime.ui.title.innerHTML = ''
  runtime.ui.title.className = 'screen title-screen'
  const recordCount = Object.keys(runtime.mothership.archive.records).length
  const maxedDepartments = Object.values(runtime.mothership.departments).filter((tier) => tier > 0).length
  const panel = document.createElement('div')
  panel.className = 'title-panel'
  const top = document.createElement('div')
  top.className = 'front-menu-top'
  const quit = document.createElement('button')
  quit.className = 'front-menu-pill danger'
  quit.type = 'button'
  quit.textContent = 'Quit'
  quit.addEventListener('click', () => runtime.toast('SIGNAL HELD'))
  const cargo = document.createElement('div')
  cargo.className = 'front-menu-cargo'
  cargo.innerHTML = `<img src="${titleLogoMarkUrl}" alt=""><b>${runtime.mothership.resources.cores}</b>`
  const options = document.createElement('button')
  options.className = 'front-menu-pill'
  options.type = 'button'
  options.textContent = 'Options'
  options.addEventListener('click', () => runtime.cycleGraphicsMode())
  top.append(quit, cargo, options)

  const wordmark = document.createElement('h1')
  wordmark.className = 'title-wordmark'
  wordmark.innerHTML = '<span>GALACTIC</span><span>HORDES</span>'
  const spacer = document.createElement('div')
  spacer.className = 'front-menu-spacer'
  const row = document.createElement('div')
  row.className = 'title-actions'
  const start = document.createElement('button')
  start.className = 'vector-button start-button'
  start.textContent = 'Launch Expedition'
  start.addEventListener('click', () => runtime.showMothership())
  const collection = document.createElement('button')
  collection.className = 'vector-button secondary'
  collection.textContent = 'Collection'
  collection.addEventListener('click', () => runtime.showCollection())
  const powerups = document.createElement('button')
  powerups.className = 'vector-button'
  powerups.textContent = 'Power Up'
  powerups.addEventListener('click', () => runtime.showPowerUps())
  const scores = document.createElement('button')
  scores.className = 'vector-button secondary'
  scores.textContent = 'Scores'
  scores.addEventListener('click', () => runtime.showScores())
  const reset = document.createElement('button')
  reset.className = 'vector-button secondary danger tiny'
  reset.textContent = 'Reset Progress'
  reset.addEventListener('click', () => {
    if (reset.dataset.confirm === 'true') {
      runtime.resetPersistentProgress()
      return
    }
    reset.dataset.confirm = 'true'
    reset.textContent = 'Confirm Reset'
  })
  const footer = document.createElement('div')
  footer.className = 'front-menu-footer'
  footer.innerHTML = `
      <span><b>${recordCount}</b> discoveries</span>
      <span><b>${maxedDepartments}</b> systems</span>
      <span><b>${runtime.highs[0]?.score ?? 0}</b> best</span>
    `
  row.append(start, collection, powerups, scores, reset)
  panel.append(top, wordmark, spacer, row, footer)
  runtime.ui.title.append(panel)
  runtime.showOnly('title')
}
