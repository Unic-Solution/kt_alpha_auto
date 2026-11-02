import { test } from '../../fixtures/web/pc.fixture';
import { ProductSteps } from '../../steps/pc/product.steps';
import { createRun } from '../../utils/step-runner';

test('[테스트케이스 21번] 일반상품 선물하기', async ({ basePage }) => {
  const steps = new ProductSteps(basePage);
  await createRun('PC Web', '테스트케이스 21번', basePage.getPage())('일반상품 선물하기', () => steps.verifyProductGift(), true);
});
