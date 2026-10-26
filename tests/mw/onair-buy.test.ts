import { test } from '../../fixtures/web/mw.fixture';
import { BasePage } from '../../pages/common/BasePage';
import { MainSteps } from '../../steps/mw/main.steps';
import { createRun } from '../../utils/step-runner';

test.use({ browserName: 'chromium', video: 'on', storageState: { cookies: [], origins: [] } });

test('체크리스트 5번: 홈 ON AIR·편성표 구매하기 주문서 이동 (MW, 비회원)', async ({ page }, testInfo) => {
  const steps = new MainSteps(new BasePage(page));
  const run = createRun('MW Web', '체크리스트 5번', page);
  await run('ON AIR 또는 편성표 바로구매 → 구매하기 → 비회원 주문서 본문·상품·옵션·수량·금액 확인', () => steps.verifyOnAirBuy(), true);
  const screenshot = testInfo.outputPath('buy-order.png');
  await page.screenshot({ path: screenshot, fullPage: true });
  await testInfo.attach('주문서 검증 완료 화면', { path: screenshot, contentType: 'image/png' });
});
