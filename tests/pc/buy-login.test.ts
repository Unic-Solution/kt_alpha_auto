import { test } from '../../fixtures/web/pc.fixture';
import { LoginSteps } from '../../steps/pc/login.steps';
import { createRun } from '../../utils/step-runner';

test.use({ requiresAuth: false });

test('[테스트케이스 12번] 상품 구매하기에서 일반 계정 로그인', async ({ sharedBasePage: basePage }) => {
  test.setTimeout(660_000);
  const loginSteps = new LoginSteps(basePage);
  await createRun('PC Web', '테스트케이스 12번', basePage.getPage())(
    '상품 구매하기에서 일반 계정 로그인',
    () => loginSteps.verifyBuyAndLogin(),
  );
});
