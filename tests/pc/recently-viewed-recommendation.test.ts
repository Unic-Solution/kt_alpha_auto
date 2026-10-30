import { test } from '../../fixtures/web/pc.fixture';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test('[테스트케이스 83번] 최근 본 상품 추천 구좌', async ({ basePage }) => {
  const steps = new MainSteps(basePage);
  await createRun('PC Web', '테스트케이스 83번', basePage.getPage())(
    '최근 본 상품 방문 → 추천 구좌 상품 선택 → 상세 화면 확인',
    () => steps.verifyRecentlyViewedProductRecommend(),
    true,
  );
});
