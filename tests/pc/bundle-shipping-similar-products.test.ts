import { test } from '../../fixtures/web/pc.fixture';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test('[테스트케이스 85번] 묶음 배송 및 비슷한 상품 추천', async ({ basePage }) => {
  const steps = new MainSteps(basePage);
  await createRun('PC Web', '테스트케이스 85번', basePage.getPage())(
    '최근 본 상품 상세 → 묶음 배송 상품보기 → 뒤로가기 → 비슷한 상품 추천 구좌 확인',
    () => steps.verifyBundleShippingAndSimilarProducts(),
    true,
  );
});
