import { test } from '../../fixtures/web/pc.fixture';
import { GsProductSteps } from '../../steps/pc/gs_product.steps';
import { createRun } from '../../utils/step-runner';

test.use({ browserName: 'chromium', video: 'on' });

test('체크리스트 78번: 선물 꾸미기 이미지 선택 (PC)', async ({ basePage }) => {
  const run = createRun('PC Web', '체크리스트 78번', basePage.getPage());
  await run('배너·카드 이미지 선택 → 선택 이미지 적용 확인', () => new GsProductSteps(basePage).gsVerifyGiftDecoration(), true);
});
