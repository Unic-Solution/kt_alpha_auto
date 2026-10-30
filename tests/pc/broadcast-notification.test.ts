import { test } from '../../fixtures/web/pc.fixture';
import { ProductSteps } from '../../steps/pc/product.steps';
import { createRun } from '../../utils/step-runner';

test('[테스트케이스 15번] 방송알림', async ({ basePage }) => {
  const steps = new ProductSteps(basePage);
  await createRun('PC Web', '테스트케이스 15번', basePage.getPage())('방송알림', () => steps.verifyBroadcastNotification(), true);
});
