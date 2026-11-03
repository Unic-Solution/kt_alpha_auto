import { test } from '../../fixtures/web/pc.fixture';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test('[테스트케이스 87번] 검색 추천구좌', async ({ basePage }) => {
  const steps = new MainSteps(basePage);
  await createRun('PC Web', '테스트케이스 87번', basePage.getPage())(
    '검색 완료 → 검색 결과 추천 구좌 확인',
    () => steps.verifyPopularSearchBroadcastProducts(),
    true,
  );
});
