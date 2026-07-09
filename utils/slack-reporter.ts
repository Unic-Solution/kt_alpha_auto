import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { postMessage, postThreadReply, uploadScreenshot } from './slack-progress';
import { toFriendlyError } from './error-map';

export default class SlackReporter implements Reporter {
  private initialMessageTs: string | undefined;
  private pendingTasks: Promise<void>[] = [];

  async onBegin() {
    try {
      if (existsSync('.slack-ts')) {
        this.initialMessageTs = readFileSync('.slack-ts', 'utf-8').trim();
      }
    } catch {}
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (!this.initialMessageTs || result.status === 'skipped') return;

    const passed = result.status === 'passed';
    const emoji = passed ? '✅' : '❌';

    let message = `${emoji} ${test.title}`;
    if (!passed) {
      const error = result.errors[0]?.message ?? '';
      message += `\n${toFriendlyError(error)}`;
    }

    const task = postThreadReply(this.initialMessageTs, message).then(async () => {
      if (passed) return;
      const screenshot = result.attachments.find(a => a.name === 'screenshot' && a.path);
      if (screenshot?.path) {
        await uploadScreenshot(screenshot.path, test.title, this.initialMessageTs!);
      }
    }).catch(() => {});

    this.pendingTasks.push(task);
  }

  async onEnd(result: FullResult) {
    await Promise.allSettled(this.pendingTasks);

    const passed = result.status === 'passed';
    const emoji = passed ? '✅' : '❌';
    const status = passed ? '통과' : '실패';
    const ts = process.env.RUN_TIMESTAMP;
    const link = ts ? `\n<https://hujo733.github.io/kt_alpha_auto/runs/${ts}|📊 Allure 리포트 보기>` : '';
    await postMessage(`${emoji} PC 통합 테스트 ${status}${link}`);

    try { unlinkSync('.slack-ts'); } catch {}
  }
}
