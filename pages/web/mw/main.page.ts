import { CommonLocators } from '../../common/common.locators';
import { expect } from '@playwright/test';
import { BasePage } from '../../common/BasePage';
import { MwLocators } from './locators';

export class MainPage extends BasePage {
  async goToHome() {
    await this.goToUrl(CommonLocators.urls.mwHomePage);
    await this.closeModal();
  }

  async isAllNavItemsVisible(): Promise<{ index: number; isVisible: boolean }[]> {
    const nav = this.page.locator(MwLocators.main.gnb);
    const buttons = this.page.locator(MwLocators.main.gnbButtons);
    const results: { index: number; isVisible: boolean }[] = [];
    await expect(buttons).toHaveCount(MwLocators.main.gnbMenuIds.length);

    // 최상단의 숨김 상태와 스크롤 후 실제 화면 내 노출을 구분한다.
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await expect(nav).toBeHidden();
    for (let index = 0; index < MwLocators.main.gnbMenuIds.length; index++) {
      await this.page.evaluate(() => window.scrollTo(0, 1600));
      await expect.poll(() => this.page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
      await this.page.waitForTimeout(400);
      await this.page.evaluate(() => window.scrollBy(0, -300));
      await expect(nav).toBeVisible();
      await expect(nav).toBeInViewport();
      const button = buttons.nth(index);
      const name = (await button.innerText()).replace(/\s+/g, ' ');
      console.log(`[GNB ${index + 1}] ${name} 클릭`);
      await button.click();
      await expect(this.page).toHaveURL(url => url.searchParams.get('gnbMenuId') === MwLocators.main.gnbMenuIds[index]);
      await expect(button).toHaveClass(/Header_active/);
      const slide = this.page.locator(MwLocators.main.gnbSlides).nth(index);
      await expect(slide).toHaveClass(/swiper-slide-active/);
      await expect(slide).toBeInViewport();
      await expect(slide).not.toHaveText('');
      await this.closeModal();
      console.log(`[GNB ${index + 1}] 목적지·선택 상태·본문 노출 확인: ${this.page.url()}`);
      results.push({ index, isVisible: true });
    }
    // 최상단 GNB 숨김 요구사항은 홈 화면에 적용한다.
    await this.goToHome();
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => this.page.evaluate(() => window.scrollY)).toBe(0);
    await expect(nav).toBeHidden();
    return results;
  }

  async isOnAirDisplayVisible(): Promise<boolean> {
    await expect(this.page.locator(MwLocators.main.onAirDisplay)).toBeVisible();
    return true;
  }

  /** 홈 확장 구좌에서 실제 표시되는 상품 정보와 이미지 로딩을 검증한다. */
  async getOnAirProductInfo() {
    const section = this.page.locator(MwLocators.main.onAirDisplay);
    await expect(section).toHaveCount(1);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeInViewport();
    await expect(section.locator(MwLocators.main.onAirHeading)).toHaveText('지금 방송중');
    const title = section.locator(MwLocators.main.onAirTitle);
    await expect(title).toBeVisible();
    await expect(title).toHaveText(/\S/);
    await expect(title).toHaveAttribute('href', /\/display\/product\/\d+(?:[?]|$)/);
    const name = (await title.innerText()).trim();
    const productId = (await title.getAttribute('href'))!.match(/\/product\/(\d+)/)![1];
    const image = section.locator(MwLocators.main.onAirImage);
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('alt', name);
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), {
      message: 'ON AIR 상품 이미지가 정상 로딩되어야 한다', timeout: 10_000,
    }).toBe(true);
    const price = section.locator(MwLocators.main.onAirPrice);
    await expect(price).toBeVisible();
    await expect(price).toHaveText(/[\d,]+원/);
    const amount = Number((await price.innerText()).replace(/\D/g, ''));
    expect(amount, 'ON AIR 상품 가격').toBeGreaterThan(0);
    await expect(section.locator(MwLocators.main.onAirTimer)).toHaveText(/\d{2}\s*:\s*\d{2}/);
    return { productId, name, amount };
  }

  /** 편성표의 live 방송 안에서 해당 상품 정보를 읽는다. */
  async getLiveScheduleProductInfo(productId: string) {
    expect(productId).toMatch(/^\d+$/);
    await this.page.locator(MwLocators.main.onAirDisplay).locator(MwLocators.main.onAirSchedule).click();
    await expect(this.page).toHaveURL(url => url.searchParams.get('gnbMenuId') === 'G000000002');
    const live = this.page.locator(MwLocators.main.liveBroadcast);
    await expect(live.first(), '편성표에 현재 방송이 있어야 한다').toBeVisible();
    const product = live.locator(MwLocators.main.liveProduct).filter({
      has: this.page.locator(`[data-product-id="${productId}"]`),
    });
    await expect(product, '홈 ON AIR 상품이 현재 방송 상품이어야 한다').toHaveCount(1);
    await product.scrollIntoViewIfNeeded();
    await expect(product).toBeInViewport();
    const title = product.locator(MwLocators.main.liveProductTitle);
    const price = product.locator(MwLocators.main.liveProductPrice);
    await expect(title).toBeVisible();
    await expect(price).toBeVisible();
    return {
      productId: await product.locator('[data-product-id]').getAttribute('data-product-id'),
      name: (await title.innerText()).trim(),
      amount: Number((await price.innerText()).replace(/\D/g, '')),
    };
  }

  async clickDirectBuyButton() {
    await this.scrollIntoView(MwLocators.main.onAirDirectBuyButton);
    await this.clickFirstInViewport(MwLocators.main.onAirDirectBuyButton);
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

  async selectOnAirOption() {
    await this.goToHome();
    await this.clickDirectBuyButton();
    await this.selectFirstEnabledOption();
  }

  async clickOnAirGiftButton() {
    await this.click(MwLocators.main.onAirGiftButton);
  }

  async isGiftOrderPage(): Promise<boolean> {
    return this.urlContains(MwLocators.urls.onAirGiftOrder);
  }

  async getOnAirProductName(): Promise<string> {
    return (await this.getText(MwLocators.main.onAirProductName)).replace(/\s/g, '');
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
