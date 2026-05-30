import { defineConfig } from '@playwright/test'

export default defineConfig({
  // The browser harness drives a single in-page game singleton through a fixed URL, so
  // harness specs cannot run concurrently without stomping shared first-run/localStorage
  // state. Keep the suite single-worker (see tests/playwright-config.spec.ts).
  workers: 1,
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5176/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  }
})
