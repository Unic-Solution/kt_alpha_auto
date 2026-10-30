import { waitForManualAuthentication } from '../../../utils/manual-auth';
import { CommonLocators } from '../../common/common.locators';
import { expect } from '@playwright/test';
import { BasePage } from '../../common/BasePage';
import { PcLocators } from './locators';

export class LoginPage extends BasePage {

  /** 로그인 상태라면 로그아웃해 로그인 테스트의 시작 상태를 맞춘다. */
  async ensureLoggedOut(): Promise<boolean> {
    await this.goToUrl(new URL(PcLocators.urls.myPage, CommonLocators.urls.homePage).href);
    await this.closeModal();
    const logout = this.page.locator(PcLocators.login.logoutButton).filter({ visible: true }).first();
    if (!await logout.isVisible()) return false;
    await logout.click();
    await expect.poll(() => logout.isVisible(), { message: '로그아웃 완료 확인' }).toBe(false);
    return true;
  }

  /** 세션을 재사용하고, 자동 로그인 실패 시 사용자 입력을 기다린다. */
  async ensureLoggedIn(fromHome = false) {
    if (fromHome) {
      await this.goToHome();
      await this.clickMyButton();
    } else {
      await this.goToUrl(new URL(PcLocators.urls.myPage, CommonLocators.urls.homePage).href);
    }
    await this.closeModal();
    const login = this.page.locator(PcLocators.login.loginButton);
    const logout = this.page.locator(PcLocators.login.logoutButton);
    const certification = this.page.locator(PcLocators.login.certificationRequestButton);
    await expect.poll(async () => await login.filter({ visible: true }).count() > 0 || await logout.isVisible(),
      { timeout: 20_000, message: '로그인 상태 확인' }).toBe(true);
    if (await logout.isVisible()) return;
    await this.clickLoginButton();
    await this.completeLoginFromCurrentScreen();
  }

  /** 구매하기 등에서 이미 열린 로그인 화면의 인증을 완료한다. */
  async completeLoginFromCurrentScreen(successUrl?: string) {
    const logout = this.page.locator(PcLocators.login.logoutButton);
    const certification = this.page.locator(PcLocators.login.certificationRequestButton);
    const loginCompleted = async () => await logout.isVisible() || Boolean(successUrl && this.page.url().includes(successUrl));
    await expect(this.page.locator(PcLocators.login.idInput)).toBeVisible({ timeout: 20_000 });
    let manualLoginRequired = true;
    const id = process.env.LOGIN_ID;
    const pw = process.env.LOGIN_PW;
    if (id && pw) {
      try {
        await this.fillId(id);
        await this.fillPw(pw);
        await this.submitLogin();
        await expect.poll(async () => await loginCompleted() || await certification.isVisible() ||
          await this.page.getByText(/아이디 또는 비밀번호가 일치하지 않습니다/).isVisible(),
        { timeout: 20_000, message: '자동 로그인 결과 확인' }).toBe(true);
        manualLoginRequired = !await loginCompleted() && !await certification.isVisible();
      } catch (error) {
        if (this.page.isClosed()) throw error;
        console.log('[PC] 자동 로그인이 완료되지 않아 사용자 직접 입력으로 전환합니다.');
      }
    }
    if (manualLoginRequired) await this.ensureManualLoginScreen(logout, certification);
    await waitForManualAuthentication(this.page, logout, certification, 'PC', manualLoginRequired, 300_000, loginCompleted);
    await this.saveStorageState('auth.json');
  }

  /** 상품 구매 로그인 완료 후 주문서 도착까지 확인한다. */
  async completeProductPurchaseLogin() {
    await this.completeLoginFromCurrentScreen(PcLocators.urls.onAirBuyOrder);
  }

  /** 직접 입력을 기다리기 전에 사용자가 실제 로그인 폼을 볼 수 있게 한다. */
  private async ensureManualLoginScreen(logout: ReturnType<LoginPage['page']['locator']>, certification: ReturnType<LoginPage['page']['locator']>) {
    if (await logout.isVisible() || await certification.isVisible() || await this.page.locator(PcLocators.login.idInput).isVisible()) return;
    await this.goToUrl(new URL(PcLocators.urls.myPage, CommonLocators.urls.homePage).href);
    await this.closeModal();
    await this.clickLoginButton();
  }

  /** 마이 버튼 클릭 */
  async clickMyButton() {
    await this.click(PcLocators.my.myButton);
  }

  /** 로그인 버튼 클릭 */
  async clickLoginButton() {
    const button = this.page.locator(PcLocators.login.loginButton).filter({ visible: true }).first();
    const idInput = this.page.locator(PcLocators.login.idInput);
    const pwInput = this.page.locator(PcLocators.login.pwInput);
    await expect(async () => {
      if (!await idInput.isVisible()) {
        await this.closeModal();
        await button.click();
      }
      await expect(idInput).toBeVisible({ timeout: 3_000 });
      await expect(pwInput).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 15_000, intervals: [1_000] });
  }

  /** 아이디 입력 */
  async fillId(id: string) {
    await this.clear(PcLocators.login.idInput);
    await this.pressSequentially(PcLocators.login.idInput, id);
  }

  /** 비밀번호 입력 */
  async fillPw(pw: string) {
    await this.clear(PcLocators.login.pwInput);
    await this.pressSequentially(PcLocators.login.pwInput, pw);
  }

  /** 로그인 제출 */
  async submitLogin() {
    const responsePromise = this.page.waitForResponse(response =>
      new URL(response.url()).pathname === '/custord/web/api/customer/integrationLoginCheck' &&
      response.request().method() === 'POST', { timeout: 20_000 });
    const [response] = await Promise.all([responsePromise, this.click(PcLocators.login.loginSubmitButton)]);
    if (response.status() === 428) {
      const body = await response.json().catch(() => null);
      if (body && Object.hasOwn(body, 'sec-cp-challenge')) {
        throw new Error('사이트 보안 챌린지(HTTP 428)로 자동화 로그인이 차단되었습니다. 계정 정보 오류와 다릅니다. 보안 확인을 완료한 로그인 세션 또는 자동화 테스트가 허용된 환경이 필요합니다.');
      }
    }
  }

  /** 인증요청 버튼 클릭 (최대 20초 대기) */
  async clickCertificationRequestButton() {
    await this.click(PcLocators.login.certificationRequestButton, false, 20);
  }

  /** 로그아웃 버튼 노출 여부 반환 */
  async isLogoutButtonVisible(): Promise<boolean> {
    await this.waitForURLContains(PcLocators.urls.myPage);
    return await this.isVisible(PcLocators.login.logoutButton);
  }

  /** 로그아웃 버튼 클릭 */
  async clickLogoutButton() {
    await this.click(PcLocators.login.logoutButton);
  }

  /** MD's Pick 상품 영역으로 스크롤 */
  async scrollToProduct() {
    await this.scrollIntoView(PcLocators.product.mdsPickSection);
  }

  /** 임의 상품 클릭 */
  async clickProduct() {
    await this.scrollToProduct();
    await this.click(PcLocators.product.mdsPickProduct, true);
  }

  /** 상품 상세의 실제 구매 버튼과 옵션 모달을 거쳐 로그인 화면으로 이동 */
  async clickProductBuyForLogin() {
    const modal = this.page.locator(PcLocators.main.purchaseModal);
    const buyButton = this.page.locator('main [class*="ButtonPurchase_wrap"]')
      .getByRole('button', { name: /구매하기$/ }).filter({ visible: true }).first();
    await expect(async () => {
      if (!await modal.isVisible()) await buyButton.click();
      await expect(modal, '구매 옵션 모달이 열려야 한다').toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 15_000, intervals: [1_000] });
    await this.clickFirstEnabled(PcLocators.main.onAirDirectBuyFirstOption);
    const confirm = modal.getByRole('button', { name: /구매하기$/ }).filter({ visible: true }).last();
    await expect(confirm).toBeEnabled();
    await confirm.click();
    await expect(this.page.locator(PcLocators.login.idInput), '구매하기 후 로그인 화면이 열려야 한다')
      .toBeVisible({ timeout: 20_000 });
  }

  /** 구매하기 버튼 클릭 (옵션 선택 전) */
  async clickBuyButtonBeforeOption() {
    await this.click(PcLocators.main.onAirBuyButton);
  }

  /** 구매하기 > 옵션 선택 */
  async clickFirstEnabledOption() {
    await this.clickFirstEnabled(PcLocators.main.onAirDirectBuyFirstOption);
  }

  /** 구매하기 > 옵션 선택 > 구매하기 버튼 클릭 */
  async clickBuyButtonAfterOption() {
    await this.lastClick(PcLocators.main.onAirBuyButton);
  }

  /** 주문서 페이지 URL 확인 */
  async isBuyOrderPage(): Promise<boolean> {
    return this.urlContains(PcLocators.urls.onAirBuyOrder);
  }
}
