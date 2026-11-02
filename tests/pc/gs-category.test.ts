import { test } from '../../fixtures/web/pc.fixture';
import { GsMainSteps } from '../../steps/pc/gs_main.steps';
import { createRun } from '../../utils/step-runner';

test.use({ requiresAuth: false });

test('[테스트케이스 65번] 기프티쇼 카테고리', async ({ basePage }) => {
  const steps = new GsMainSteps(basePage);
  await createRun('PC Web', '테스트케이스 65번', basePage.getPage())('기프티쇼 카테고리', () => steps.gsVerifyCategory(), true);
});
