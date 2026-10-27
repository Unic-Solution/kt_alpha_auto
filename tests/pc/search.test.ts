import { test } from '../../fixtures/web/pc.fixture';
import { MainPage } from '../../pages/web/pc/main.page';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test.use({ browserName: 'chromium', video: 'on', requiresAuth: false });

test('체크리스트 9번: 인기 검색어 결과에서 상품 상세 이동 (PC)', async ({ page }) => {
  const run = createRun('PC Web', '체크리스트 9번', page);
  await run('인기 검색어 선택 → 검색 결과 상품 선택 → 동일 상품 상세 확인', () => new MainSteps(new MainPage(page)).verifySearch(), true);
});
