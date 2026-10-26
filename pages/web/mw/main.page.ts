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
    // 초기 라우팅 완료 후 클릭해야 hydration 중 클릭이 유실되지 않는다.
    await expect(this.page).toHaveURL(url => url.searchParams.get('gnbMenuId') === 'G000000004');
    const button = this.page.locator(MwLocators.main.onAirDirectBuyButton);
    await button.scrollIntoViewIfNeeded();
    const modal = this.page.locator(MwLocators.main.purchaseModal);
    // 초기 화면의 이벤트 연결이 늦는 경우 패널이 열리지 않았을 때만 재시도한다.
    await expect(async () => {
      if (!await modal.isVisible()) await button.click();
      await expect(modal).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 15_000, intervals: [500, 1_000] });
  }

  /** 현재 방송 대표 상품을 선택하고 필요한 옵션을 순서대로 선택한다. */
  async selectFirstEnabledOption(productName?: string) {
    const modal = this.page.locator(MwLocators.main.purchaseModal);
    const selected = modal.locator(MwLocators.main.selectedProduct);
    for (let depth = 0; depth < 10; depth++) {
      if (await selected.count() > 0) {
        await expect(selected).toHaveCount(1);
        await expect(selected).toBeVisible();
        if (productName) await expect(selected).toHaveText(productName);
        return;
      }
      const products = modal.locator(MwLocators.main.purchaseProduct).filter({ visible: true });
      if (await products.count() > 0) {
        const product = productName ? products.filter({ hasText: productName }) : products.first();
        await expect(product).toHaveCount(1);
        await product.click();
      } else {
        const option = modal.locator(MwLocators.main.purchaseOption).filter({ visible: true }).first();
        await expect(option, '선택 가능한 상품 옵션이 있어야 한다').toBeVisible();
        await option.click();
      }
      await expect.poll(async () => await selected.count() +
        await modal.locator(MwLocators.main.purchaseOption).filter({ visible: true }).count()).toBeGreaterThan(0);
    }
    throw new Error('상품 옵션 선택이 10단계 안에 완료되지 않았습니다.');
  }

  async selectOnAirOption() {
    await this.goToHome();
    const product = await this.getOnAirProductInfo();
    await this.clickDirectBuyButton();
    await this.selectFirstEnabledOption(product.name);
    return product;
  }

  async clickOnAirGiftButton() {
    await this.click(MwLocators.main.onAirGiftButton);
  }

  /** 로그인 화면이 아닌 실제 선물하기 주문서 본문과 상품을 확인한다. */
  async isGiftOrderPage(): Promise<boolean> {
    return this.urlContains(MwLocators.urls.onAirGiftOrder);
  }

  async getOnAirProductName(): Promise<string> {
    return (await this.getText(MwLocators.main.onAirProductName)).replace(/\s/g, '');
  }

  async clickOnAirCartButton(): Promise<boolean> {
    const button = this.page.locator(MwLocators.main.purchaseModal).locator(MwLocators.main.onAirCartButton);
    await expect(button, '장바구니 버튼이 없으면 실패해야 한다').toBeVisible();
    await expect(button).toBeEnabled();
    await button.click();
    await expect(this.page.getByText('장바구니에 상품이 담겼습니다.', { exact: true })).toBeVisible();
    return true;
  }

  async clickOnAirCartMoveButton() {
    await this.click(MwLocators.main.onAirCartMoveButton);
  }

  async getSelectedCartOptions() {
    const modal = this.page.locator(MwLocators.main.purchaseModal);
    const quantity = modal.locator(MwLocators.main.selectedQuantity);
    await expect(quantity).toHaveCount(1);
    const count = Number(await quantity.inputValue());
    expect(count, '선택 수량').toBeGreaterThan(0);
    return { quantity: count, options: (await modal.locator(MwLocators.main.selectedOptions).allTextContents()).map(s => s.trim()).filter(Boolean) };
  }

  /** 화면이 빈 상태인지 목록 로딩이 끝난 상태인지 확인한 뒤 행을 읽는다. */
  async readCartItems() {
    const rows = this.page.locator(MwLocators.main.cartItems);
    await expect.poll(async () => await rows.count() > 0 ||
      await this.page.getByText(MwLocators.main.cartEmptyText, { exact: true }).isVisible(),
    { message: '장바구니 목록 또는 빈 장바구니 안내가 표시되어야 한다' }).toBe(true);
    const result = [];
    for (const row of await rows.all()) {
      const id = await row.locator('input[type="checkbox"]').getAttribute('value');
      expect(id, '장바구니 행 식별자').toMatch(/^\d+$/);
      const name = (await row.locator(MwLocators.main.cartItemName).innerText()).replace('[TV상품]', '').trim();
      const options = (await row.locator(MwLocators.main.cartItemOptions).allTextContents()).map(s => s.trim());
      const quantityText = options.find(s => /수량\s*:/.test(s));
      expect(quantityText, '장바구니 수량 표시').toMatch(/수량\s*:\s*\d+개/);
      result.push({ id: id!, name, quantity: Number(quantityText!.match(/:\s*(\d+)/)![1]),
        options: options.filter(s => !/수량\s*:/.test(s)),
        amount: Number((await row.locator(MwLocators.main.cartItemPrice).innerText()).replace(/\D/g, '')) });
    }
    return result;
  }

  async getCartSnapshot() {
    const cart = await this.page.context().newPage();
    try {
      await cart.goto(new URL('/custord/basket', this.page.url()).href);
      return await new MainPage(cart).readCartItems();
    } finally { await cart.close(); }
  }

  /** 상품명 링크의 실제 목적지 상품 코드도 확인한다. */
  async verifyCartProductId(id: string, productId: string) {
    const row = this.page.locator(MwLocators.main.cartItems).filter({ has: this.page.locator(`input[value="${id}"]`) });
    await row.locator(MwLocators.main.cartItemName).click();
    await expect(this.page).toHaveURL(url => url.pathname === `/display/product/${productId}`);
    await this.page.goBack();
    await expect(this.page).toHaveURL(url => url.pathname === '/custord/basket');
    await expect(row).toBeVisible();
  }

  /** 담기 전에는 없었던 행만 삭제한다. 전체 선택 삭제를 사용하지 않는다. */
  async deleteAddedCartItem(id: string) {
    expect(id).toMatch(/^\d+$/);
    const row = this.page.locator(MwLocators.main.cartItems).filter({ has: this.page.locator(`input[value="${id}"]`) });
    await expect(row).toHaveCount(1);
    const dialog = this.page.waitForEvent('dialog').then(async confirmation => {
      const message = confirmation.message();
      if (message === '선택한 상품을 삭제하시겠습니까?') await confirmation.accept();
      else await confirmation.dismiss();
      expect(message).toBe('선택한 상품을 삭제하시겠습니까?');
    });
    await Promise.all([dialog, row.locator(MwLocators.main.cartItemDelete).click()]);
    await expect(row).toHaveCount(0);
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
