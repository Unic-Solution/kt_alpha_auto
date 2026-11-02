import { BasePage } from '../../pages/common/BasePage';
import { LoginPage } from '../../pages/web/pc/login.page';

export class LoginSteps {
  private loginPage: LoginPage;

  constructor(basePage: BasePage) {
    this.loginPage = new LoginPage(basePage.getPage());
  }

  async verifyLocalLogin(): Promise<boolean> {
    const didLogout = await this.loginPage.ensureLoggedOut();
    await this.loginPage.ensureLoggedIn(didLogout);
    return await this.loginPage.isLogoutButtonVisible();
  }

  /** 비로그인 상태에서 상품 상세 > 구매하기 > 로그인 > 주문서 이동 확인 */
  async verifyBuyAndLogin(): Promise<boolean> {
    await this.loginPage.ensureLoggedOut();
    await this.loginPage.goToHome();
    await this.loginPage.clickProduct();
    await this.loginPage.clickProductBuyForLogin();
    await this.loginPage.completeProductPurchaseLogin();
    return await this.loginPage.isBuyOrderPage();
  }
}
