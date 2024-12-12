import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['list']],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8081',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take a screenshot when the test fails */
    screenshot: 'only-on-failure',

    permissions: ['clipboard-read', 'clipboard-write'],
    navigationTimeout: 30000,
    actionTimeout: 30000,
    video: 'retain-on-failure'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'yarn web',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 30000

    /* Uncomment to see better logs in the terminal */
    // stdout: 'pipe',
    // stderr: 'pipe'
  },

  globalTimeout: 600000,
  expect: {
    timeout: 10000
  }
});
