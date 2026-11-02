import { test } from '../../fixtures/web/pc.fixture';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test.use({ requiresAuth: false });

test('[테스트케이스 90번] 편성표 TV·TV+ 현재 방송 상품', async ({ basePage }) => {
  const steps = new MainSteps(basePage);
  await createRun('PC Web', '테스트케이스 90번', basePage.getPage())(
    '편성표 TV·TV+ 탭 변경 → 지금 방송 중 상품 상단 노출 확인',
    () => steps.verifyScheduleChannelTabs(),
    true,
  );
});
