import type { Page } from '@playwright/test'

export const HARNESS_URL = 'http://127.0.0.1:5176/?harness=1'
export const RESET_HARNESS_URL = 'http://127.0.0.1:5176/?harness=1&resetProgress=1'
export const HARNESS_READY_TIMEOUT = 10_000

type HarnessWindow = Window & {
  __galacticHarness?: { snapshot?: unknown }
}

export async function loadHarnessPage(page: Page, url = HARNESS_URL) {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'domcontentloaded' })
  await waitForHarnessReady(page)
}

export async function waitForHarnessReady(page: Page) {
  await page.waitForFunction(
    () => typeof (window as HarnessWindow).__galacticHarness?.snapshot === 'function',
    null,
    { timeout: HARNESS_READY_TIMEOUT }
  )
}

export async function waitForHarnessFunction(page: Page, name: string) {
  await page.waitForFunction(
    (functionName) => typeof (window as unknown as Record<string, unknown>)[functionName] === 'function',
    name,
    { timeout: HARNESS_READY_TIMEOUT }
  )
}
