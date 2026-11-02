import { test } from '../../fixtures/web/pc.fixture';
import { ProductSteps } from '../../steps/pc/product.steps';
import { createRun } from '../../utils/step-runner';

test.use({ requiresAuth: false });

test('[테스트케이스 22번] 일반상품 장바구니', async ({ basePage }) => {
  const steps = new ProductSteps(basePage);
  await createRun('PC Web', '테스트케이스 22번', basePage.getPage())('일반상품 장바구니', () => steps.verifyProductCart(), true);
});
