import { test } from '../../fixtures/web/mw.fixture';
import { BasePage } from '../../pages/common/BasePage';
import { MainSteps } from '../../steps/mw/main.steps';
import { createRun } from '../../utils/step-runner';

test.use({ browserName: 'chromium', video: 'on' });

test('체크리스트 2번: 홈 ON AIR 현재 방송 상품 정보 (MW)', async ({ page }, testInfo) => {
  const steps = new MainSteps(new BasePage(page));
  const run = createRun('MW Web', '체크리스트 2번', page);
  await run('홈 ON AIR 상품 정보·이미지 확인 및 편성표 현재 방송 상품 대조', () => steps.verifyOnAirModal(), true);
  await page.locator('section[class*="OnAirDisplayExpand_wrap"]').scrollIntoViewIfNeeded();
  const screenshot = testInfo.outputPath('onair.png');
  await page.screenshot({ path: screenshot });
  await testInfo.attach('ON AIR 검증 완료 화면', { path: screenshot, contentType: 'image/png' });
});
