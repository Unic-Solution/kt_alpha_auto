import { test } from '../../fixtures/web/pc.fixture';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test.use({ requiresAuth: false });

test('[테스트케이스 92번] 오늘의 혜택 기획전 이동 확인', async ({ basePage }) => {
  const steps = new MainSteps(basePage);
  await createRun('PC Web', '테스트케이스 92번', basePage.getPage())(
    '혜택/이벤트 페이지 이동 → 오늘의 혜택 배너 → 기획전 페이지 확인',
    () => steps.verifyTodayBenefit(),
    true,
  );
});
