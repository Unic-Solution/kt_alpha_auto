import { test } from '../../fixtures/web/mw.fixture';
import { BasePage } from '../../pages/common/BasePage';
import { MainSteps } from '../../steps/mw/main.steps';
import { createRun } from '../../utils/step-runner';

test.use({ browserName: 'chromium', video: 'on' });

test('체크리스트 3번: 홈 ON AIR 선물하기 주문서 이동 (MW)', async ({ page }, testInfo) => {
  test.setTimeout(660_000);
  const steps = new MainSteps(new BasePage(page));
  const run = createRun('MW Web', '체크리스트 3번', page);
  await run('ON AIR 바로구매·상품 옵션 선택 → 선물하기 주문서 본문·상품 확인', () => steps.verifyOnAirGift(), true);
  const screenshot = testInfo.outputPath('gift-order.png');
  await page.screenshot({ path: screenshot });
  await testInfo.attach('선물하기 주문서 검증 완료', { path: screenshot, contentType: 'image/png' });
});
