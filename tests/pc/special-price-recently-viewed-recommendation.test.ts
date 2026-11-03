import { test } from '../../fixtures/web/pc.fixture';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test('[테스트케이스 89번] 특가상품 유사 상품 추천 구좌', async ({ basePage }) => {
  const steps = new MainSteps(basePage);
  await createRun('PC Web', '테스트케이스 89번', basePage.getPage())(
    '특가상품 상세 방문 → 메인 페이지 이동 → 방금 본 상품과 비슷한 상품 구좌 확인',
    () => steps.verifySpecialPriceRecentlyViewedRecommendation(),
    true,
  );
});
