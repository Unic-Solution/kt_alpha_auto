import { test } from '../../fixtures/web/pc.fixture';
import { BasePage } from '../../pages/common/BasePage';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test.use({ browserName: 'chromium', video: 'on', requiresAuth: false });

test('체크리스트 1번: GNB 스크롤 노출 및 메뉴별 이동 (PC)', async ({ page }) => {
  const steps = new MainSteps(new BasePage(page));
  const run = createRun('PC Web', '체크리스트 1번', page);
  await run('최상단 GNB 숨김 → 스크롤 노출 → 모든 메뉴 목적지 확인 → 홈 복귀 후 최상단 숨김', () => steps.verifyAllNavItems(), true);
});
