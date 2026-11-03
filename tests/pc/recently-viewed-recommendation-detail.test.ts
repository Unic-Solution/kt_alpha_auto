import { test } from '../../fixtures/web/pc.fixture';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test('[테스트케이스 84번] 최근 본 상품 상세 이동', async ({ basePage }) => {
  const steps = new MainSteps(basePage);
  await createRun('PC Web', '테스트케이스 84번', basePage.getPage())(
    '카테고리 랭킹 1위 방문 → 최근 본 상품 태그 상품 → 상세 화면 확인',
    () => steps.verifyRecentlyViewedProductDetail(),
    true,
  );
});
