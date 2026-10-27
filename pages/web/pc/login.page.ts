import { waitForManualAuthentication } from '../../../utils/manual-auth';
import { CommonLocators } from '../../common/common.locators';
import { expect } from '@playwright/test';
import { BasePage } from '../../common/BasePage';
import { PcLocators } from './locators';

export class LoginPage extends BasePage {

  /** 세션을 재사용하고, 자동 로그인 실패 시 사용자 입력을 기다린다. */
  async ensureLoggedIn() {
    await this.goToUrl(new URL(PcLocators.urls.myPage, CommonLocators.urls.homePage).href);
    const login = this.page.locator(PcLocators.login.loginButton);
    const logout = this.page.locator(PcLocators.login.logoutButton);
    const certification = this.page.locator(PcLocators.login.certificationRequestButton);
    await expect(login.or(logout).first(), '로그인 상태 확인').toBeVisible({ timeout: 20_000 });
    if (await logout.isVisible()) return;
    await this.clickLoginButton();
    let manualLoginRequired = true;
    const id = process.env.LOGIN_ID;
    const pw = process.env.LOGIN_PW;
    if (id && pw) {
      try {
        await this.fillId(id);
        await this.fillPw(pw);
        await this.submitLogin();
        await expect.poll(async () => await logout.isVisible() || await certification.isVisible() ||
          await this.page.getByText(/아이디 또는 비밀번호가 일치하지 않습니다/).isVisible(),
        { timeout: 20_000, message: '자동 로그인 결과 확인' }).toBe(true);
        manualLoginRequired = !await logout.isVisible() && !await certification.isVisible();
      } catch (error) {
        if (this.page.isClosed()) throw error;
        console.log('[PC] 자동 로그인이 완료되지 않아 사용자 직접 입력으로 전환합니다.');
      }
    }
    await waitForManualAuthentication(this.page, logout, certification, 'PC', manualLoginRequired);
    await this.saveStorageState('auth.json');
  }

  /** 마이 버튼 클릭 */
  async clickMyButton() {
    await this.click(PcLocators.my.myButton);
  }

  /** 로그인 버튼 클릭 */
  async clickLoginButton() {
    await this.click(PcLocators.login.loginButton);
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
