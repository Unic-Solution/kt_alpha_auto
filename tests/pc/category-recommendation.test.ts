import { test } from '../../fixtures/web/pc.fixture';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test('[테스트케이스 86번] 카테고리 추천구좌', async ({ basePage }) => {
  const steps = new MainSteps(basePage);
  await createRun('PC Web', '테스트케이스 86번', basePage.getPage())(
    '상세 카테고리 상품 방문 → 메인 복귀 → 카테고리 추천구좌 확인',
    () => steps.verifyCategoryRecommendationAfterProductVisit(),
    true,
  );
});
