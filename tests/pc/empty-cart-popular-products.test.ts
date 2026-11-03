import { test } from '../../fixtures/web/pc.fixture';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test('[테스트케이스 88번] 빈 장바구니 인기 상품 추천 구좌', async ({ basePage }) => {
  const steps = new MainSteps(basePage);
  await createRun('PC Web', '테스트케이스 88번', basePage.getPage())(
    '장바구니 상품 전체 삭제 → 빈 장바구니 인기 상품 추천 구좌 확인',
    () => steps.verifyEmptyCartPopularProducts(),
    true,
  );
});
