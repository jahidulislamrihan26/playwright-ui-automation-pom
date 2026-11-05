import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 2 : undefined,
  reporter: [
    ['list'],
    ...(CI ? ([['github']] as const) : []),
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['json', { outputFile: 'reports/results.json' }], // read by tools/summary.js
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    testIdAttribute: 'data-test', // lets us use page.getByTestId('login-button')
    actionTimeout: 10_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Logs in once and saves the session so most tests start already signed in.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, dependencies: ['setup'] },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, dependencies: ['setup'] },
    // A phone: Chromium with a Pixel 7 profile (touch, small screen). Only the specs where this matters.
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] }, testMatch: /(login|responsive)\.spec\.ts/, dependencies: ['setup'] },
    // Real Microsoft Edge, when it is installed on the machine: EDGE=1 npx playwright test --project=edge
    ...(process.env.EDGE ? [{ name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' }, dependencies: ['setup'] }] : []),
  ],
});
