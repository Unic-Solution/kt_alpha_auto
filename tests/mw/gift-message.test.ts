import { test } from '../../fixtures/web/mw.fixture';
import { GsProductSteps } from '../../steps/mw/gs_product.steps';
import { createRun } from '../../utils/step-runner';

test.use({ browserName: 'chromium', video: 'on' });

test('체크리스트 79번: 선물 메시지 입력 및 수정 (MW)', async ({ basePage }) => {
  const run = createRun('MW Web', '체크리스트 79번', basePage.getPage());
  await run('추천 메시지 → 전체 삭제 후 직접 입력 → 특수문자 확인', () => new GsProductSteps(basePage).gsVerifyGiftMessage('감사합니다.'), true);
});
