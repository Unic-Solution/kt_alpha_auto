import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { postThreadReply, readThreadTs, updateMessage } from './slack-progress';

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

/** 통합 테스트는 각 케이스 실패를 기록하고 나머지를 실행한 뒤 마지막에 모아 실패 처리한다. */
export function createSuiteRun(epicName: string, featureName: string, page: Page) {
  const failures: string[] = [];
  const parentTs = readThreadTs();

  const run = async (name: string, fn: () => Promise<boolean>) => {
    const replyTs = parentTs ? await postThreadReply(parentTs, `:arrow_forward: ${name}`) : undefined;
    const start = Date.now();
    let passed = true;
    let errorMsg: string | undefined;
    _params = [];
    await test.step(name, async () => {
      try {
        if (!await fn()) throw new Error('expected true but received false');
      } catch (error) {
        passed = false;
        errorMsg = String(error);
        failures.push(`[${name}] ${errorMsg}`);
      }
    });
    const screenshot = passed ? undefined : await page.screenshot({ fullPage: false }).catch(() => undefined);
    writeStepResult(name, epicName, featureName, passed ? 'passed' : 'failed', start, Date.now(), [..._params], errorMsg, screenshot);
    _params = [];
    if (replyTs) updateMessage(replyTs, passed ? `:white_check_mark: ${name}` : `:x: ${name}`);
  };

  const finish = () => {
    if (failures.length) throw new Error(`통합 테스트 실패 ${failures.length}건\n${failures.join('\n')}`);
  };

  return { run, finish };
}
