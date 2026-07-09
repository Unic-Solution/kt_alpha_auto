import type { FullResult, Reporter } from '@playwright/test/reporter';
import { unlinkSync } from 'fs';
import { postMessage } from './slack-progress';

export default class SlackReporter implements Reporter {
  async onEnd(result: FullResult) {
    const passed = result.status === 'passed';
    const emoji = passed ? '✅' : '❌';
    const status = passed ? '통과' : '실패';
    const ts = process.env.RUN_TIMESTAMP;
    const link = ts ? `\n<https://hujo733.github.io/kt_alpha_auto/runs/${ts}|📊 Allure 리포트 보기>` : '';
    await postMessage(`${emoji} PC 통합 테스트 ${status}${link}`);

    try { unlinkSync('.slack-ts'); } catch {}
  }
}
