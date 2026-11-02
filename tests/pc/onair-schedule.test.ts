import { test } from '../../fixtures/web/pc.fixture';
import { BasePage } from '../../pages/common/BasePage';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

test.use({ browserName: 'chromium', video: 'on', requiresAuth: false });

test('체크리스트 6번: 이전·다음 방송 및 편성표·상품 상세 이동 (PC)', async ({ page }) => {
  const steps = new MainSteps(new BasePage(page));
  const run = createRun('PC Web', '체크리스트 6번', page);
  await run('이전·다음 방송 정보·이미지 확인 → 편성표 대조 → 각 상품 상세 이동', () => steps.verifyAdjacentBroadcasts(), true);
});
