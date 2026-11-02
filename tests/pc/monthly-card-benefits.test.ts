import { test } from '../../fixtures/web/pc.fixture';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test.use({ requiresAuth: false });

test('[테스트케이스 93번] 이달의 카드 혜택 페이지 이동 확인', async ({ basePage }) => {
  const steps = new MainSteps(basePage);
  await createRun('PC Web', '테스트케이스 93번', basePage.getPage())(
    '혜택/이벤트 페이지 이동 → 이달의 카드 혜택 선택 → 카드 혜택 페이지 확인',
    () => steps.verifyMonthlyCardBenefits(),
    true,
  );
});
