import { test } from '../../fixtures/web/mw.fixture';
import { BasePage } from '../../pages/common/BasePage';
import { MainSteps } from '../../steps/mw/main.steps';
import { createRun } from '../../utils/step-runner';

test.use({ browserName: 'chromium', video: 'on', storageState: { cookies: [], origins: [] } });

test('체크리스트 1번: GNB 스크롤 노출 및 메뉴별 이동 (MW)', async ({ page }) => {
  const steps = new MainSteps(new BasePage(page));
  const run = createRun('MW Web', '체크리스트 1번', page);
  await run('최상단 GNB 숨김 → 스크롤 노출 → 모든 메뉴 목적지 확인 → 홈 복귀 후 최상단 숨김', () => steps.verifyAllNavItems(), true);
});
