import { test } from '../../fixtures/web/mw.fixture';
import { LoginSteps } from '../../steps/mw/login.steps';
import { createRun } from '../../utils/step-runner';

test('로그인 (MW)', async ({ sharedBasePage: basePage }) => {
  test.setTimeout(660_000);
  const loginSteps = new LoginSteps(basePage);
  const run = createRun('MW Web', '로그인', basePage.getPage());

  await run('로그인 상태 확인', () => loginSteps.verifyLocalLogin());
});
