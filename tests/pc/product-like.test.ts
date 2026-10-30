import { test } from '../../fixtures/web/pc.fixture';
import { ProductSteps } from '../../steps/pc/product.steps';
import { createRun } from '../../utils/step-runner';

test('[테스트케이스 16번] 상품 좋아요', async ({ basePage }) => {
  const steps = new ProductSteps(basePage);
  await createRun('PC Web', '테스트케이스 16번', basePage.getPage())('상품 좋아요', () => steps.verifyProductLike(), true);
});
