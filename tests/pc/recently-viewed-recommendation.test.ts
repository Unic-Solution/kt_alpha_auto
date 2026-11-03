import { test } from '../../fixtures/web/pc.fixture';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test('[테스트케이스 83번] 최근 본 상품 추천 구좌', async ({ basePage }) => {
  const steps = new MainSteps(basePage);
  await createRun('PC Web', '테스트케이스 83번', basePage.getPage())(
    '카테고리 랭킹 1위 방문 → 오른쪽 최근 상품과 추천 구좌 태그 상품 일치 확인',
    () => steps.verifyRecentlyViewedProductRecommend(),
    true,
  );
});
