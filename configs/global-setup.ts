import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { postMessage, postDevMessage } from '../utils/slack-progress';

/**
 * 모든 테스트 시작 전 한 번만 실행 (playwright.config.ts의 globalSetup)
 *
 * TEST_RUN_TIMESTAMP는 step-runner.ts에서 Allure feature 라벨에 사용되어
 * Allure 리포트에서 실행 회차별로 결과를 구분함
 */
export default async function globalSetup() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  process.env.TEST_RUN_TIMESTAMP = timestamp;

  const required = ['LOGIN_ID', 'LOGIN_PW', 'NAME', 'YEAR', 'MONTH', 'DAY', 'PHONE_NUMBER'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`필수 환경변수 누락: ${missing.join(', ')}`);
  }

  const startMessageTs = await postMessage('PC 통합 테스트 시작');
  if (startMessageTs) writeFileSync('.slack-ts', startMessageTs);

  const devStartMessageTs = await postDevMessage('PC 통합 테스트 시작');
  if (devStartMessageTs) writeFileSync('.slack-dev-ts', devStartMessageTs);

  mkdirSync('allure-results', { recursive: true });
  writeFileSync(
    join('allure-results', 'categories.json'),
    JSON.stringify([
      { name: '타임아웃',           messageRegex: '.*TimeoutError.*|.*Timeout.*exceeded.*' },
      { name: '검증 실패',          messageRegex: '.*expected true but received false.*' },
      { name: '네트워크 오류',      messageRegex: '.*net::ERR_.*|.*NS_ERROR_.*' },
      { name: '페이지 이동 실패',   messageRegex: '.*Navigation failed.*|.*ERR_ABORTED.*' },
      { name: '요소 없음/비노출',   messageRegex: '.*not visible.*|.*not enabled.*|.*out of viewport.*' },
      { name: '요소 중복',          messageRegex: '.*strict mode violation.*|.*resolved to.*' },
      { name: '브라우저 종료',      messageRegex: '.*Target closed.*|.*browser has been closed.*' },
      { name: 'DOM 오류',           messageRegex: '.*detached.*|.*not attached to a Document.*' },
      { name: '스크립트 오류',      messageRegex: '.*TypeError.*|.*Cannot read properties.*' },
    ], null, 2),
  );
}
