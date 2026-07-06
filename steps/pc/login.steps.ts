import { BasePage } from '../../pages/common/BasePage';
import { LoginPage } from '../../pages/web/pc/login.page';

export class LoginSteps {
  private loginPage: LoginPage;

  constructor(basePage: BasePage) {
    this.loginPage = new LoginPage(basePage.getPage());
  }

  /** 일반 계정 로그인 확인 */
  async verifyLocalLogin(id: string, pw: string): Promise<boolean> {
    await this.loginPage.goToHome();
    await this.loginPage.clickMyButton();
    await this.loginPage.clickLoginButton();
    await this.loginPage.fillId(id);
    await this.loginPage.fillPw(pw);
    await this.loginPage.submitLogin();
    try {
      await this.loginPage.clickCertificationRequestButton();
      await this.loginPage.wait(20);
    } catch {
      // OTP 불필요
    }
    await this.loginPage.saveStorageState('auth.json');

    const logoutButton = await this.loginPage.isLogoutButtonVisible();
    await this.loginPage.clickLogoutButton();

    return logoutButton;
  }

  /** 임의 상품 상세 > 구매하기 > 일반 계정 로그인 확인 */
  async verifyBuyAndLogin(id: string, pw: string): Promise<boolean> {
    await this.loginPage.goToHome();
    await this.loginPage.clickProduct();
    await this.loginPage.clickBuyButtonBeforeOption();
    await this.loginPage.selectFirstEnabledOption();
    await this.loginPage.clickBuyButtonAfterOption();
    await this.loginPage.fillId(id);
    await this.loginPage.fillPw(pw);
    await this.loginPage.submitLogin();
    try {
      await this.loginPage.clickCertificationRequestButton();
      await this.loginPage.wait(20);
    } catch {
      // OTP 불필요
    }
    await this.loginPage.saveStorageState('auth.json');

    return await this.loginPage.isBuyOrderPage();
  }
}
