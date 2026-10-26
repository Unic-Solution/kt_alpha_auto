import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { join } from 'path';

let _params: Array<{ name: string; value: string }> = [];

export function parameter(name: string, value: string): void {
  _params.push({ name, value });
}

function writeStepResult(
  name: string,
  epic: string,
  feature: string,
  status: 'passed' | 'failed',
  start: number,
  stop: number,
  params: Array<{ name: string; value: string }>,
  errorMsg?: string,
  screenshot?: Buffer,
) {
  mkdirSync('allure-results', { recursive: true });
  const uuid = randomUUID();
  const result: Record<string, unknown> = {
    uuid,
    name,
    status,
    start,
    stop,
    labels: [
      { name: 'epic', value: epic },
      { name: 'feature', value: `${feature} (${process.env.TEST_RUN_TIMESTAMP})` },
      { name: 'story', value: name },
    ],
  };
  if (params.length > 0) result['parameters'] = params;
  if (errorMsg) result['statusDetails'] = { message: errorMsg };
  if (screenshot) {
    const attachUUID = randomUUID();
    const attachFile = `${attachUUID}-attachment.png`;
    writeFileSync(join('allure-results', attachFile), screenshot);
    result['attachments'] = [{ name: 'screenshot', type: 'image/png', source: attachFile }];
  }
  writeFileSync(join('allure-results', `${uuid}-result.json`), JSON.stringify(result));
}

export function createMobileRun(epicName: string, featureName: string) {
  const softErrors: string[] = [];

  const run = async (name: string, fn: () => Promise<boolean>, hard = false) => {
    const start = Date.now();
    let passed = true;
    let errorMsg: string | undefined;
    _params = [];
    try {
      const result = await fn();
      if (!result) { passed = false; errorMsg = 'expected true but received false'; }
    } catch (e) {
      passed = false;
      errorMsg = String(e);
    } finally {
      writeStepResult(name, epicName, featureName, passed ? 'passed' : 'failed', start, Date.now(), [..._params], errorMsg);
      _params = [];
    }
    if (!passed) {
      if (hard) throw new Error(errorMsg);
      softErrors.push(`[${name}] ${errorMsg}`);
    }
  };

  const finish = () => {
    if (softErrors.length > 0) throw new Error(softErrors.join('\n'));
  };

  return { run, finish };
}

export function createRun(epicName: string, featureName: string, page?: Page) {
  return async (name: string, fn: () => Promise<boolean>, hard = false) => {
    const start = Date.now();
    let passed = true;
    let errorMsg: string | undefined;
    _params = [];
    try {
      await test.step(name, async () => {
        try {
          const result = await fn();
          if (!result) { passed = false; errorMsg = 'expected true but received false'; }
          (hard ? expect : expect.soft)(result).toBe(true);
        } catch (e) {
          passed = false;
          errorMsg = String(e);
          if (hard) throw e;
          expect.soft(false, String(e)).toBe(true);
        }
      });
    } catch (e) {
      if (hard) throw e;
    } finally {
      const screenshot = (!passed && page)
        ? await page.screenshot({ fullPage: false }).catch(() => undefined)
        : undefined;
      writeStepResult(name, epicName, featureName, passed ? 'passed' : 'failed', start, Date.now(), [..._params], errorMsg, screenshot);
      _params = [];
    }
  };
}
