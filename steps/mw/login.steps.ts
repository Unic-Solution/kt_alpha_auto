import { BasePage } from '../../pages/common/BasePage';
import { LoginPage } from '../../pages/web/mw/login.page';

export class LoginSteps {
  private loginPage: LoginPage;

  constructor(basePage: BasePage) {
    this.loginPage = new LoginPage(basePage.getPage());
  }

  async verifyLocalLogin(): Promise<boolean> {
    await this.loginPage.ensureLoggedIn();
    return await this.loginPage.isLogoutButtonVisible();
  }
}
