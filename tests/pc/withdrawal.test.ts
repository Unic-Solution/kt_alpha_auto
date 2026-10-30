import { test } from '../../fixtures/web/pc.fixture';
import { MySteps } from '../../steps/pc/my.steps';
import { createRun } from '../../utils/step-runner';

test.use({ browserName: 'chromium', video: 'on' });
test.setTimeout(360_000);

test('[테스트케이스 55번] 회원 탈퇴', async ({ basePage }) => {
  const run = createRun('PC Web', '체크리스트 55번', basePage.getPage());
  await run('회원 탈퇴 선택 → 수동 본인인증 → 탈퇴 안내 화면 확인', () => new MySteps(basePage).verifyWithdrawal(), true);
});
