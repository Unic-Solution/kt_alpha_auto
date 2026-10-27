import { test } from '../../fixtures/web/pc.fixture';
import { BasePage } from '../../pages/common/BasePage';
import { QuickSteps } from '../../steps/pc/quick.steps';
import { createRun } from '../../utils/step-runner';

test.use({ browserName: 'chromium', video: 'on' });

test('체크리스트 7번: 고정 메뉴 연속 이동 및 TOP (PC)', async ({ page }) => {
  const steps = new QuickSteps(new BasePage(page));
  const run = createRun('PC Web', '체크리스트 7번', page);
  await run('현재 화면에서 홈 → 카테고리 → 마이 → 기프티쇼 → KT알파쇼핑 → TOP 연속 클릭', () => steps.verifyFixedNavigation(), true);
});
