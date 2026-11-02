import { expect, type Locator, type Page } from '@playwright/test';
import { postMessage, postThreadReply, readThreadTs } from './slack-progress';

/** 계정·비밀번호·세션 값은 알림에 포함하지 않는다. */
export async function notifyManualAuth(platform: string, action: '로그인' | '본인인증') {
  const message = `[${platform}] ${action} 필요: 테스트 러너의 열린 브라우저에서 직접 ${action}을 완료해 주세요. 최대 5분 대기하며 완료 후 자동으로 계속합니다.`;
  console.log(message);
  if (process.env.SLACK_NOTIFICATIONS_ENABLED !== 'true') return;
  const runUrl = process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : undefined;
  const threadTs = process.env.SLACK_THREAD_TS || readThreadTs();
  const text = [message, process.env.RUNNER_NAME && `러너: ${process.env.RUNNER_NAME}`, runUrl && `실행 기록: ${runUrl}`].filter(Boolean).join('\n');
  const sentTs = threadTs ? await postThreadReply(threadTs, text) : await postMessage(text);
  if (sentTs) {
    console.log(`[Slack] ${action} 필요 알림 전송 완료${threadTs ? ' (스레드)' : ''}`);
    return;
  }
  if (threadTs && await postMessage(text)) {
    console.log(`[Slack] ${action} 필요 알림을 채널 메시지로 재전송했습니다.`);
    return;
  }
  console.warn(`[Slack] ${action} 필요 알림 전송에 실패했습니다. 브라우저에서는 계속 대기합니다.`);
}

/** 로그인 실패 후 직접 입력 및 본인인증 완료를 기다린다. 인증 요청은 자동 클릭하지 않는다. */
export async function waitForManualAuthentication(
  page: Page, logout: Locator, certification: Locator, platform: string,
  loginRequired: boolean, timeout = 300_000,
  isAlternativeCompletion: () => Promise<boolean> = async () => false,
) {
  if (await logout.isVisible() || await isAlternativeCompletion()) return;
  if (loginRequired && !await certification.isVisible()) await notifyManualAuth(platform, '로그인');
  let certificationNotified = false;
  await expect.poll(async () => {
    if (page.isClosed()) throw new Error('사용자 인증 대기 중 브라우저가 닫혔습니다.');
    if (await logout.isVisible() || await isAlternativeCompletion()) return true;
    if (!certificationNotified && await certification.isVisible()) {
      certificationNotified = true;
      await notifyManualAuth(platform, '본인인증');
    }
    return false;
  }, { timeout, message: '사용자가 로그인·본인인증을 완료해야 테스트를 계속할 수 있습니다.' }).toBe(true);
}
