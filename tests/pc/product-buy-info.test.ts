import { test } from '../../fixtures/web/pc.fixture';
import { ProductSteps } from '../../steps/pc/product.steps';
import { createRun } from '../../utils/step-runner';

test.use({ requiresAuth: false });

test('[테스트케이스 18번] 상품 구매정보', async ({ basePage }) => {
  const steps = new ProductSteps(basePage);
  await createRun('PC Web', '테스트케이스 18번', basePage.getPage())('상품 구매정보', () => steps.verifyProductBuyInfo(), true);
});
