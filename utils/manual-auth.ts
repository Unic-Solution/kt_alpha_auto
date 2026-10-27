import { expect, type Locator, type Page } from '@playwright/test';

/** 계정·비밀번호·세션 값은 알림에 포함하지 않는다. */
export async function notifyManualAuth(platform: string, action: '로그인' | '본인인증') {
  const message = `[${platform}] ${action} 필요: 테스트 러너의 열린 브라우저에서 직접 ${action}을 완료해 주세요. 최대 5분 대기하며 완료 후 자동으로 계속합니다.`;
  console.log(message);
  if (process.env.SLACK_NOTIFICATIONS_ENABLED !== 'true') return;
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) {
    console.warn('[Slack] SLACK_WEBHOOK_URL이 없어 사용자 작업 알림을 보내지 못했습니다.');
    return;
  }
  const runUrl = process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : undefined;
  const text = [message, process.env.RUNNER_NAME && `러너: ${process.env.RUNNER_NAME}`, runUrl && `실행 기록: ${runUrl}`].filter(Boolean).join('\n');
  try {
    const response = await fetch(webhook, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }), signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) console.warn(`[Slack] 사용자 작업 알림 전송 실패(HTTP ${response.status}). 브라우저에서는 계속 대기합니다.`);
  } catch {
    console.warn('[Slack] 사용자 작업 알림을 전송하지 못했습니다. 브라우저에서는 계속 대기합니다.');
  }
}

/** 로그인 실패 후 직접 입력 및 본인인증 완료를 기다린다. 인증 요청은 자동 클릭하지 않는다. */
export async function waitForManualAuthentication(
  page: Page, logout: Locator, certification: Locator, platform: string,
  loginRequired: boolean, timeout = 300_000,
) {
  if (await logout.isVisible()) return;
  if (loginRequired && !await certification.isVisible()) await notifyManualAuth(platform, '로그인');
  let certificationNotified = false;
  await expect.poll(async () => {
    if (page.isClosed()) throw new Error('사용자 인증 대기 중 브라우저가 닫혔습니다.');
    if (await logout.isVisible()) return true;
    if (!certificationNotified && await certification.isVisible()) {
      certificationNotified = true;
      await notifyManualAuth(platform, '본인인증');
    }
    return false;
  }, { timeout, message: '사용자가 로그인·본인인증을 완료해야 테스트를 계속할 수 있습니다.' }).toBe(true);
}
