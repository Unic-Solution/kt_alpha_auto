import { test as setup } from '../../fixtures/web/pc.fixture';

setup('로그인 세션 저장 (PC)', async ({ page }) => {
  await page.context().storageState({ path: 'auth.json' });
});
