import { BasePage } from '../../common/BasePage';
import { PcLocators } from './locators';

export class LoginPage extends BasePage {

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
    await this.pressSequentially(PcLocators.login.idInput, id);
  }

  /** 비밀번호 입력 */
  async fillPw(pw: string) {
    await this.pressSequentially(PcLocators.login.pwInput, pw);
  }

  /** 로그인 제출 */
  async submitLogin() {
    await this.click(PcLocators.login.loginSubmitButton);
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
    await this.click(PcLocators.main.onAirBuyButton, true);
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
