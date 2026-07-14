import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  globalSetup: './configs/global-setup.ts',
  timeout: 300_000,

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html'],
    ['./utils/suite-timing-reporter.ts'],
    ['./utils/slack-reporter.ts'],
  ],

  use: {
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },

  projects: [
    // PC AUTH SETUP
    {
      name: 'setup',
      testMatch: /tests\/pc\/auth\.setup\.ts/,
      use: {
        viewport: null,
        launchOptions: { args: ['--start-maximized'] },
      },
    },

    // PC WEB (auth 필요)
    {
      name: 'pc',
      testMatch: /tests\/pc\/(?!auth\.setup|login|integrated).*\.test\.ts/,
      fullyParallel: false,
      use: {
        viewport: null,
        storageState: 'auth.json',
        launchOptions: { args: ['--start-maximized'] },
      },
    },

    // PC WEB (auth 불필요 - login, integrated)
    {
      name: 'pc-no-auth',
      testMatch: /tests\/pc\/(login|integrated)\.test\.ts/,
      fullyParallel: false,
      use: {
        viewport: null,
        launchOptions: { args: ['--start-maximized'] },
      },
    },

    // MW AUTH SETUP
    {
      name: 'mw-setup',
      testMatch: /tests\/mw\/auth\.setup\.ts/,
      use: {
        ...devices['iPhone 13'],
      },
    },

    // MOBILE WEB (auth 필요)
    {
      name: 'mw',
      testMatch: /tests\/mw\/(?!auth\.setup|login|integrated).*\.test\.ts/,
      fullyParallel: false,
      use: {
        ...devices['iPhone 13'],
        storageState: 'mw-auth.json',
      },
    },

    // MOBILE WEB (auth 불필요 - login, integrated)
    {
      name: 'mw-no-auth',
      testMatch: /tests\/mw\/(login|integrated)\.test\.ts/,
      fullyParallel: false,
      use: {
        ...devices['iPhone 13'],
      },
    },
  ],
});
