import { test as base, expect, Page, WorkerInfo } from '@playwright/test';
import { existsSync } from 'fs';
import { BasePage } from '../../pages/common/BasePage';
import { CommonLocators } from '../../pages/common/common.locators';
import { PcLocators } from '../../pages/web/pc/locators';
import { LoginPage } from '../../pages/web/pc/login.page';

type PCWorkerFixtures = {
  appPage: Page;
  basePage: BasePage;
  sharedBasePage: BasePage;
};

/**
 * 광고 리다이렉트로 인해 ERR_ABORTED가 간헐적으로 발생하므로 한 번 재시도하는 안전한 goto
 */
async function gotoSafe(page: Page, url: string) {
  try {
    await page.goto(url);
  } catch (e: any) {
    if (e.message?.includes('ERR_ABORTED')) await page.goto(url);
    else throw e;
  }
}

/**
 * auth.json의 세션이 만료됐을 때 자동으로 재로그인하고 auth.json을 갱신
 *
 * 마이페이지 접근 후 로그인 버튼이 노출되면 세션 만료로 판단하여 재로그인 수행
 */
async function ensureLoggedIn(page: Page) {
  const myPageUrl = PcLocators.urls.myPage;
  await gotoSafe(page, myPageUrl);
  await page.locator(PcLocators.login.loginButton).waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
  const isNotLoggedIn = await page.locator(PcLocators.login.loginButton).isVisible();
  if (!isNotLoggedIn) return;

  // 세션 만료 - 재로그인
  const loginPage = new LoginPage(page);
  await loginPage.goToHome();
  await loginPage.clickMyButton();
  await loginPage.clickLoginButton();
  await loginPage.fillId(process.env.LOGIN_ID ?? '');
  await loginPage.fillPw(process.env.LOGIN_PW ?? '');
  await loginPage.submitLogin();

  try {
    await loginPage.clickCertificationRequestButton();
    await loginPage.wait(20);
  } catch {
    // OTP 불필요 또는 자동 로그인 성공
  }

  await page.context().storageState({ path: 'auth.json' }).catch(() => {});
}

export const test = base.extend<{}, PCWorkerFixtures>({
  // scope: 'worker' — 같은 worker의 모든 테스트가 브라우저 컨텍스트를 공유 (테스트마다 새로 열지 않음)
  // auth.json이 있으면 로그인 상태로 시작하고, 세션 만료 시 ensureLoggedIn이 자동 재로그인
  appPage: [async ({ browser }, use, workerInfo: WorkerInfo) => {
    const storageState = existsSync('auth.json') ? 'auth.json' : undefined;
    const context = await browser.newContext({ viewport: null, storageState });
    const page = await context.newPage();
    page.setDefaultTimeout(workerInfo.project.use.actionTimeout ?? 10_000);
    page.setDefaultNavigationTimeout(workerInfo.project.use.navigationTimeout ?? 10_000);
    page.on('requestfailed', req => {
      console.warn(`[NETWORK FAIL] ${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
    });
    await ensureLoggedIn(page);
    await gotoSafe(page, CommonLocators.urls.homePage);
    await use(page);
    await context.close();
  }, { scope: 'worker' }],

  // appPage를 BasePage로 래핑한 fixture (auth 필요한 테스트용)
  basePage: [async ({ appPage }, use) => {
    await use(new BasePage(appPage));
  }, { scope: 'worker' }],

  // 로그인 없이 새 컨텍스트로 시작 (integrated 테스트처럼 로그인을 직접 수행하는 테스트용)
  sharedBasePage: [async ({ browser }, use) => {
    const context = await browser.newContext({ viewport: null });
    const page = await context.newPage();
    await page.goto(CommonLocators.urls.homePage).catch(() => {});
    await use(new BasePage(page));
    await context.close();
  }, { scope: 'worker' }],
});

export { expect };
