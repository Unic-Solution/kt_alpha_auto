import { existsSync } from 'fs';
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
    ['list', { printSteps: true }],
    ['html'],
    ['./utils/suite-timing-reporter.ts'],
  ],

  use: {
    channel: process.env.PW_CHANNEL,
    launchOptions: { slowMo: Number(process.env.PW_SLOW_MO ?? 0) },
    actionTimeout: 10_000,
    navigationTimeout: 10_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // PC AUTH SETUP
    {
      name: 'setup',
      testMatch: /tests\/pc\/auth\.setup\.ts/,
      use: {
        viewport: { width: 1440, height: 900 },
        launchOptions: { args: ['--start-maximized'], slowMo: Number(process.env.PW_SLOW_MO ?? 0) },
      },
    },

    // PC WEB (auth 필요)
    {
      name: 'pc',
      testMatch: /tests\/pc\/(?!auth\.setup|login|buy-login|integrated).*\.test\.ts/,
      fullyParallel: false,
      use: {
        viewport: { width: 1440, height: 900 },
        storageState: existsSync('auth.json') ? 'auth.json' : undefined,
        launchOptions: { args: ['--start-maximized'], slowMo: Number(process.env.PW_SLOW_MO ?? 0) },
      },
    },

    // PC WEB (auth 불필요 - login, integrated)
    {
      name: 'pc-no-auth',
      testMatch: /tests\/pc\/(login|buy-login|integrated)\.test\.ts/,
      fullyParallel: false,
      use: {
        viewport: { width: 1440, height: 900 },
        launchOptions: { args: ['--start-maximized'], slowMo: Number(process.env.PW_SLOW_MO ?? 0) },
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
        storageState: existsSync('mw-auth.json') ? 'mw-auth.json' : undefined,
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
