import { test } from '../../fixtures/web/pc.fixture';
import { GsMainSteps } from '../../steps/pc/gs_main.steps';
import { createRun } from '../../utils/step-runner';

test.use({ requiresAuth: false });

test('[테스트케이스 64번] 기프티쇼 GNB', async ({ basePage }) => {
  const steps = new GsMainSteps(basePage);
  await createRun('PC Web', '테스트케이스 64번', basePage.getPage())('기프티쇼 GNB', () => steps.gsVerifyAllNavItems(), true);
});
