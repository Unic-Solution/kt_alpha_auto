import { test } from '../../fixtures/web/mw.fixture';
import { MySteps } from '../../steps/mw/my.steps';
import { createRun } from '../../utils/step-runner';

test.use({ browserName: 'chromium', video: 'on' });
test.setTimeout(360_000);

test('체크리스트 55번: 회원 탈퇴 화면 이동 (MW)', async ({ basePage }) => {
  const run = createRun('MW Web', '체크리스트 55번', basePage.getPage());
  await run('회원 탈퇴 선택 → 수동 본인인증 → 탈퇴 안내 화면 확인', () => new MySteps(basePage).verifyWithdrawal(), true);
});
