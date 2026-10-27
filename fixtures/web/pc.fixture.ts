import { test as base, expect } from '@playwright/test';
import { existsSync } from 'fs';
import { BasePage } from '../../pages/common/BasePage';
import { CommonLocators } from '../../pages/common/common.locators';
import { LoginPage } from '../../pages/web/pc/login.page';

type Fixtures = { basePage: BasePage; sharedBasePage: BasePage; authenticated: void };

export const test = base.extend<Fixtures>({
  // 매 테스트 시작 시 최신 세션을 읽는다. 실제 유효성은 아래에서 확인한다.
  storageState: async ({}, use) => {
    await use(existsSync('auth.json') ? 'auth.json' : undefined);
  },
  basePage: async ({ page }, use) => { await use(new BasePage(page)); },
  sharedBasePage: async ({ basePage }, use) => { await use(basePage); },

  // page, basePage, sharedBasePage를 사용하는 모든 테스트에 자동 적용한다.
  authenticated: [async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.ensureLoggedIn();
    await loginPage.goToUrl(CommonLocators.urls.homePage);
    await loginPage.closeModal();
    await use();
  }, { auto: true, timeout: 360_000 }],
});

export { expect };
