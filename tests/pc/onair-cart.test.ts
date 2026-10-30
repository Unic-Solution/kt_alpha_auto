import { test } from '../../fixtures/web/pc.fixture';
import { BasePage } from '../../pages/common/BasePage';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test.use({ browserName: 'chromium', video: 'on', requiresAuth: false });

test('체크리스트 4번: 홈 ON AIR 장바구니 상품 추가 (PC)', async ({ page }) => {
  const steps = new MainSteps(new BasePage(page));
  const run = createRun('PC Web', '체크리스트 4번', page);
  await run('ON AIR 상품 담기 → 상품 코드·옵션·수량·금액 확인 → 추가 항목만 삭제', () => steps.verifyOnAirCart(), true);
});
