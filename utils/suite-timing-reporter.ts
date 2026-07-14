import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { existsSync, appendFileSync, writeFileSync } from 'fs';

interface SuiteTiming {
  start: number;
  end: number;
}

/**
 * 테스트 suite별 실행 시간을 측정해 Allure 리포트의 Environment 탭에 기록하는 커스텀 reporter
 *
 * allure-results/environment.properties 파일에 기록되며
 * Allure 리포트 Overview의 Environment 섹션에 표시됨
 */
class SuiteTimingReporter implements Reporter {
  // suite 이름을 키로, 해당 suite 내 모든 테스트의 최초 시작~최후 종료 시간을 값으로 보관
  private timings = new Map<string, SuiteTiming>();

  onTestEnd(test: TestCase, result: TestResult) {
    const suiteName = test.parent?.title;
    if (!suiteName) return;

    const start = result.startTime.getTime();
    const end = start + result.duration;
    const existing = this.timings.get(suiteName);

    // 같은 suite에 여러 테스트가 있을 때 전체 범위로 확장
    if (!existing) {
      this.timings.set(suiteName, { start, end });
    } else {
      this.timings.set(suiteName, {
        start: Math.min(existing.start, start),
        end: Math.max(existing.end, end),
      });
    }
  }

  onEnd(_result: FullResult) {
    if (this.timings.size === 0) return;

    const lines: string[] = [];
    // properties 파일 형식: key = value (공백·등호·줄바꿈은 언더스코어로 치환)
    const fmt = (ms: number) => {
      const d = new Date(ms);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${String(d.getFullYear()).slice(2)}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    for (const [name, { start, end }] of this.timings) {
      const totalSec = Math.round((end - start) / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      const duration = m > 0 ? `${m}m ${s}s` : `${s}s`;
      const key = name.replace(/[\s=\n\r]/g, '_');
      lines.push(`${key} = ${fmt(start)} ~ ${fmt(end)} | 소요시간: ${duration}`);
    }

    const file = 'allure-results/environment.properties';
    const content = lines.join('\n') + '\n';
    try {
      existsSync(file)
        ? appendFileSync(file, content, 'utf-8')
        : writeFileSync(file, content, 'utf-8');
    } catch {}
  }
}

export default SuiteTimingReporter;
