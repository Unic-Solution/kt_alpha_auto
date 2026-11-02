import { test } from '../../fixtures/web/mw.fixture';
import { MainPage } from '../../pages/web/mw/main.page';
import { MainSteps } from '../../steps/mw/main.steps';
import { createRun } from '../../utils/step-runner';

test.use({ browserName: 'chromium', video: 'on', requiresAuth: false });

test('체크리스트 8번: 카테고리 1·2·3depth 및 전체 필터·정렬 (MW)', async ({ page }) => {
  const run = createRun('MW Web', '체크리스트 8번', page);
  await run('홈쇼핑 > 2depth > 3depth 이동 및 필터 4종·정렬 6종 확인', () => new MainSteps(new MainPage(page)).verifyCategory(), true);
});
