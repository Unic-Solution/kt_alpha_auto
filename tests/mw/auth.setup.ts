import { test as setup } from '../../fixtures/web/mw.fixture';

setup.use({ browserName: 'chromium' });

setup('로그인 세션 저장 (MW)', async ({ page }) => {
  await page.context().storageState({ path: 'mw-auth.json' });
});
