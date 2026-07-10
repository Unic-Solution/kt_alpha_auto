import { BasePage } from '../../common/BasePage';
import { MwLocators } from './locators';

export class MainPage extends BasePage {

  async isAllNavItemsVisible(): Promise<{ index: number; isVisible: boolean }[]> {
    const count = await this.count(MwLocators.main.navItems);
    const results: { index: number; isVisible: boolean }[] = [];

    for (let i = 0; i < count; i++) {
      await this.nthClick(MwLocators.main.navItems, i);
      if (i === 3) await this.closeModal();
      const isVisible = await this.isVisible(MwLocators.main.mainArea);
      results.push({ index: i, isVisible });
    }

    return results;
  }

  async isOnAirDisplayVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.main.onAirDisplay);
  }

  async clickDirectBuyButton(): Promise<string> {
    await this.scrollIntoView(MwLocators.main.onAirDirectBuyButton);
    const productName = await this.getTextFirstInViewport(MwLocators.main.onAirProductName);
    await this.clickFirstInViewport(MwLocators.main.onAirDirectBuyButton);
    return productName;
  }

  async selectFirstEnabledOption() {
    let prevCount = 0;

    while (true) {
      await this.waitForElement(MwLocators.product.optionBox, 5).catch(() => {});
      const count = await this.count(MwLocators.product.optionBox);
      if (count === 0 || count === prevCount) return;
      prevCount = count;
      await this.clickFirstEnabled(MwLocators.main.onAirDirectBuyFirstOption);
      await this.clickFirstEnabled(MwLocators.main.onAirDirectBuySecondOption);
    }
  }

  async selectOnAirOption(): Promise<string> {
    await this.goToHome();
    const productName = await this.clickDirectBuyButton();
    await this.selectFirstEnabledOption();
    return productName;
  }

  async clickOnAirGiftButton(): Promise<boolean> {
    const exists = await this.isVisible(MwLocators.main.onAirGiftButton);
    if (!exists) return false;
    await this.click(MwLocators.main.onAirGiftButton);
    return true;
  }

  async isGiftOrderPage(): Promise<boolean> {
    return this.urlContains(MwLocators.urls.onAirGiftOrder);
  }

  async getOnAirProductName(): Promise<string> {
    return (await this.getTextFirstInViewport(MwLocators.main.onAirProductName)).replace(/\s/g, '');
  }

  async clickOnAirCartButton(): Promise<boolean> {
    const exists = await this.isVisible(MwLocators.main.onAirCartButton);
    if (!exists) return false;
    await this.click(MwLocators.main.onAirCartButton);
    return true;
  }

  async clickOnAirCartMoveButton() {
    await this.click(MwLocators.main.onAirCartMoveButton);
  }

  async getCartProductName(): Promise<string> {
    return (await this.getText(MwLocators.main.cartProductName)).replace(/\s/g, '');
  }

  async clickCartDeleteButton() {
    this.page.once('dialog', dialog => dialog.accept());
    await this.click(MwLocators.main.cartDeleteButton);
  }

  async clickOnAirBuyButton() {
    await this.click(MwLocators.main.onAirBuyButton);
  }

  async isBuyOrderPage(): Promise<boolean> {
    return this.urlContains(MwLocators.urls.onAirBuyOrder);
  }

  async clickCategoryButton() {
    await this.click(MwLocators.main.categoryButton);
  }

  async clickCategoryTwoDepth() {
    const count = await this.count(MwLocators.main.categoryTwoDepthButton);
    const randomNum = this.getRandomIndex(count);
    await this.nthClick(MwLocators.main.categoryTwoDepthButton, randomNum);
  }

  async clickCategoryThreeDepth() {
    const count = await this.count(MwLocators.main.categoryThreeDepthButton);
    const randomNum = this.getRandomIndex(count);
    await this.nthClick(MwLocators.main.categoryThreeDepthButton, randomNum);
    await this.wait(3);
  }

  async clickFirstFilterButton() {
    await this.click(MwLocators.main.firstFilterButton);
    await this.wait(2);
  }

  async extractProductQuantity(): Promise<number | false> {
    const text = await this.getText(MwLocators.main.productQuantity);
    return this.extractNumber(text);
  }

  async clickSearchButton() {
    await this.click(MwLocators.main.searchButton);
  }

  async clickPopularWord(): Promise<string> {
    const count = await this.count(MwLocators.main.popularWords);
    const randomNum = this.getRandomIndex(count);
    const word = await this.getIndexText(MwLocators.main.popularWords, randomNum);
    await this.nthClick(MwLocators.main.popularWords, randomNum);
    return word;
  }

  async clickSearchProduct() {
    await this.click(MwLocators.main.searchProduct);
  }

  async isProductDetailPage(): Promise<boolean> {
    return this.urlContains(MwLocators.urls.productDetail);
  }
}
