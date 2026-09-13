import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ['list'],
    [
      'allure-playwright',
      {
        outputFolder: 'allure-results',
        // Attach Playwright video, trace and screenshot to each Allure test result
        environmentInfo: {
          framework: 'Playwright',
          language: 'TypeScript',
        },
      },
    ],
  ],
  use: {
    baseURL: 'https://litecart.stqa.ru',
    // Record video for every test — visible in Allure report
    video: 'on',
    // Keep trace on first retry for debugging flaky tests
    trace: 'on-first-retry',
    // Screenshot on failure
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        },
      },
    },
  ],
});