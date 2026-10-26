import { expect } from '@playwright/test';
import { BasePage } from '../../common/BasePage';
import { PcLocators } from './locators';

export class MainPage extends BasePage {

  /** GNB 전체 순회 - 각 항목 클릭 후 main 영역 노출 여부 반환 */
  async isAllNavItemsVisible(): Promise<{ index: number; isVisible: boolean }[]> {
    const nav = this.page.locator(PcLocators.main.gnb);
    const buttons = this.page.locator(PcLocators.main.gnbButtons);
    const results: { index: number; isVisible: boolean }[] = [];
    await expect(buttons).toHaveCount(PcLocators.main.gnbMenuIds.length);

    // 최상단의 숨김 상태와 스크롤 후 실제 화면 내 노출을 구분한다.
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await expect(nav).toBeHidden();
    for (let index = 0; index < PcLocators.main.gnbMenuIds.length; index++) {
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
      await expect(this.page).toHaveURL(url => url.searchParams.get('gnbMenuId') === PcLocators.main.gnbMenuIds[index]);
      await expect(button).toHaveClass(/Header_active/);
      const slide = this.page.locator(PcLocators.main.gnbSlides).nth(index);
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

  /** 홈 > ON AIR(지금 방송중) 정상 노출 확인 */
  async isOnAirDisplayVisible(): Promise<boolean> {
    await expect(this.page.locator(PcLocators.main.onAirDisplay)).toBeVisible();
    return true;
  }

  /** 홈 확장 구좌에서 실제 표시되는 상품 정보와 이미지 로딩을 검증한다. */
  async getOnAirProductInfo() {
    const section = this.page.locator(PcLocators.main.onAirDisplay);
    await expect(section).toHaveCount(1);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeInViewport();
    await expect(section.locator(PcLocators.main.onAirHeading)).toHaveText('지금 방송중');
    const title = section.locator(PcLocators.main.onAirTitle);
    await expect(title).toBeVisible();
    await expect(title).toHaveText(/\S/);
    await expect(title).toHaveAttribute('href', /\/display\/product\/\d+(?:[?]|$)/);
    const name = (await title.innerText()).trim();
    const productId = (await title.getAttribute('href'))!.match(/\/product\/(\d+)/)![1];
    const image = section.locator(PcLocators.main.onAirImage);
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('alt', name);
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), {
      message: 'ON AIR 상품 이미지가 정상 로딩되어야 한다', timeout: 10_000,
    }).toBe(true);
    const price = section.locator(PcLocators.main.onAirPrice);
    await expect(price).toBeVisible();
    await expect(price).toHaveText(/[\d,]+원/);
    const amount = Number((await price.innerText()).replace(/\D/g, ''));
    expect(amount, 'ON AIR 상품 가격').toBeGreaterThan(0);
    await expect(section.locator(PcLocators.main.onAirTimer)).toHaveText(/\d{2}\s*:\s*\d{2}/);
    return { productId, name, amount };
  }

  /** 편성표의 live 방송 안에서 해당 상품 정보를 읽는다. */
  async getLiveScheduleProductInfo(productId: string) {
    expect(productId).toMatch(/^\d+$/);
    await this.page.locator(PcLocators.main.onAirDisplay).locator(PcLocators.main.onAirSchedule).click();
    await expect(this.page).toHaveURL(url => url.searchParams.get('gnbMenuId') === 'G000000002');
    const live = this.page.locator(PcLocators.main.liveBroadcast);
    await expect(live.first(), '편성표에 현재 방송이 있어야 한다').toBeVisible();
    const product = live.locator(PcLocators.main.liveProduct).filter({
      has: this.page.locator(`[data-product-id="${productId}"]`),
    });
    await expect(product, '홈 ON AIR 상품이 현재 방송 상품이어야 한다').toHaveCount(1);
    await product.scrollIntoViewIfNeeded();
    await expect(product).toBeInViewport();
    const title = product.locator(PcLocators.main.liveProductTitle);
    const price = product.locator(PcLocators.main.liveProductPrice);
    await expect(title).toBeVisible();
    await expect(price).toBeVisible();
    return {
      productId: await product.locator('[data-product-id]').getAttribute('data-product-id'),
      name: (await title.innerText()).trim(),
      amount: Number((await price.innerText()).replace(/\D/g, '')),
    };
  }

  /** 홈 > ON AIR(지금 방송중) > 바로구매 버튼 클릭 */
  async clickDirectBuyButton() {
    // 초기 라우팅 완료 후 클릭해야 hydration 중 클릭이 유실되지 않는다.
    await expect(this.page).toHaveURL(url => url.searchParams.get('gnbMenuId') === 'G000000004');
    const button = this.page.locator(PcLocators.main.onAirDirectBuyButton);
    await button.scrollIntoViewIfNeeded();
    const modal = this.page.locator(PcLocators.main.purchaseModal);
    // 초기 화면의 이벤트 연결이 늦는 경우 패널이 열리지 않았을 때만 재시도한다.
    await expect(async () => {
      if (!await modal.isVisible()) await button.click();
      await expect(modal).toBeVisible({ timeout: 10_000 });
    }).toPass({ timeout: 30_000, intervals: [1_000] });
  }

  /** 현재 방송 대표 상품을 선택하고 필요한 옵션을 순서대로 선택한다. */
  async selectFirstEnabledOption(productName?: string) {
    const modal = this.page.locator(PcLocators.main.purchaseModal);
    const selected = modal.locator(PcLocators.main.selectedProduct);
    for (let depth = 0; depth < 10; depth++) {
      if (await selected.count() > 0) {
        await expect(selected).toHaveCount(1);
        await expect(selected).toBeVisible();
        if (productName) await expect(selected).toHaveText(productName);
        return;
      }
      const products = modal.locator(PcLocators.main.purchaseProduct).filter({ visible: true });
      if (await products.count() > 0) {
        const product = productName ? products.filter({ hasText: productName }) : products.first();
        await expect(product).toHaveCount(1);
        await product.click();
      } else {
        const option = modal.locator(PcLocators.main.purchaseOption).filter({ visible: true }).first();
        await expect(option, '선택 가능한 상품 옵션이 있어야 한다').toBeVisible();
        await option.click();
      }
      await expect.poll(async () => await selected.count() +
        await modal.locator(PcLocators.main.purchaseOption).filter({ visible: true }).count()).toBeGreaterThan(0);
    }
    throw new Error('상품 옵션 선택이 10단계 안에 완료되지 않았습니다.');
  }

  async selectOnAirOption(allowScheduleFallback = false) {
    await this.goToHome();
    const price = this.page.locator(PcLocators.main.onAirDisplay).locator(PcLocators.main.onAirPrice);
    await expect(price).toBeVisible();
    const canBuy = !(await price.innerText()).includes('상담') &&
      await this.page.locator(PcLocators.main.onAirDirectBuyButton).getByText('바로구매', { exact: true }).isVisible();
    if (allowScheduleFallback && !canBuy) return this.selectSchedulePurchaseOption();
    expect(canBuy, '현재 ON AIR가 바로 구매 가능한 일반 상품이어야 한다').toBe(true);
    const product = await this.getOnAirProductInfo();
    await this.clickDirectBuyButton();
    await this.selectFirstEnabledOption(product.name);
    return { ...product, source: '홈 ON AIR' };
  }

  /** 상담 방송 등 홈에서 구매할 수 없으면 가장 가까운 이전 일반 방송을 선택한다. */
  async selectSchedulePurchaseOption() {
    console.log('[구매하기] 홈 ON AIR에서 바로 구매할 수 없어 편성표로 전환합니다.');
    await this.page.locator(PcLocators.main.onAirDisplay).locator(PcLocators.main.onAirSchedule).click();
    await expect(this.page).toHaveURL(url => url.searchParams.get('gnbMenuId') === 'G000000002');
    const broadcasts = this.page.locator(PcLocators.main.broadcasts);
    await expect(broadcasts.first()).toBeAttached();
    const states = await broadcasts.evaluateAll(nodes => nodes.map(n => n.getAttribute('data-broadcast-state')));
    const liveIndex = states.indexOf('live');
    expect(liveIndex, '편성표 현재 방송 위치').toBeGreaterThanOrEqual(0);
    const indices = [...Array(liveIndex).keys()].reverse().concat(
      Array.from({ length: states.length - liveIndex - 1 }, (_, i) => liveIndex + i + 1));
    for (const index of indices) {
      const broadcast = broadcasts.nth(index);
      const buy = broadcast.getByRole('button', { name: '바로구매', exact: true }).first();
      if (!await buy.isVisible() || !await buy.isEnabled()) continue;
      const info = broadcast.locator(PcLocators.main.liveProduct).first();
      const productId = await info.locator('[data-product-id]').getAttribute('data-product-id');
      expect(productId).toMatch(/^\d+$/);
      const name = (await info.locator(PcLocators.main.liveProductTitle).innerText()).trim();
      const amount = Number((await info.locator(PcLocators.main.liveProductPrice).innerText()).replace(/\D/g, ''));
      expect(amount).toBeGreaterThan(0);
      await buy.scrollIntoViewIfNeeded();
      await buy.click();
      await expect(this.page.locator(PcLocators.main.purchaseModal)).toBeVisible({ timeout: 20_000 });
      await this.selectFirstEnabledOption(name);
      return { productId: productId!, name, amount, source: '편성표' };
    }
    throw new Error('편성표에 바로 구매 가능한 일반 상품이 없습니다.');
  }

  async clickOnAirGiftButton() {
    await this.click(PcLocators.main.onAirGiftButton);
  }

  /** 로그인 화면이 아닌 실제 선물하기 주문서 본문과 상품을 확인한다. */
  async isGiftOrderPage(): Promise<boolean> {
    return this.urlContains(PcLocators.urls.onAirGiftOrder);
  }

  /** ON AIR 상품 이름 추출 */
  async getOnAirProductName(): Promise<string> {
    return (await this.getText(PcLocators.main.onAirProductName)).replace(/\s/g, '');
  }

  /** ON AIR > 장바구니 버튼 클릭 (버튼 없으면 false 반환) */
  async clickOnAirCartButton(): Promise<boolean> {
    const button = this.page.locator(PcLocators.main.purchaseModal).locator(PcLocators.main.onAirCartButton);
    await expect(button, '장바구니 버튼이 없으면 실패해야 한다').toBeVisible();
    await expect(button).toBeEnabled();
    await button.click();
    await expect(this.page.getByText('장바구니에 상품이 담겼습니다.', { exact: true })).toBeVisible();
    return true;
  }

  /** ON AIR > 장바구니 > 바로가기 버튼 클릭 */
  async clickOnAirCartMoveButton() {
    await this.click(PcLocators.main.onAirCartMoveButton);
  }

  /** 장바구니 상품 이름 추출 */
  async getSelectedCartOptions() {
    const modal = this.page.locator(PcLocators.main.purchaseModal);
    const quantity = modal.locator(PcLocators.main.selectedQuantity);
    await expect(quantity).toHaveCount(1);
    const count = Number(await quantity.inputValue());
    expect(count, '선택 수량').toBeGreaterThan(0);
    return { quantity: count, options: (await modal.locator(PcLocators.main.selectedOptions).allTextContents()).map(s => s.trim()).filter(Boolean) };
  }

  /** 화면이 빈 상태인지 목록 로딩이 끝난 상태인지 확인한 뒤 행을 읽는다. */
  async readCartItems() {
    const rows = this.page.locator(PcLocators.main.cartItems);
    await expect.poll(async () => await rows.count() > 0 ||
      await this.page.getByText(PcLocators.main.cartEmptyText, { exact: true }).isVisible(),
    { message: '장바구니 목록 또는 빈 장바구니 안내가 표시되어야 한다' }).toBe(true);
    const result = [];
    for (const row of await rows.all()) {
      const id = await row.locator('input[type="checkbox"]').getAttribute('value');
      expect(id, '장바구니 행 식별자').toMatch(/^\d+$/);
      const name = (await row.locator(PcLocators.main.cartItemName).innerText()).replace('[TV상품]', '').trim();
      const options = (await row.locator(PcLocators.main.cartItemOptions).allTextContents()).map(s => s.trim());
      const quantityText = options.find(s => /수량\s*:/.test(s));
      expect(quantityText, '장바구니 수량 표시').toMatch(/수량\s*:\s*\d+개/);
      result.push({ id: id!, name, quantity: Number(quantityText!.match(/:\s*(\d+)/)![1]),
        options: options.filter(s => !/수량\s*:/.test(s)),
        amount: Number((await row.locator(PcLocators.main.cartItemPrice).innerText()).replace(/\D/g, '')) });
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
    const row = this.page.locator(PcLocators.main.cartItems).filter({ has: this.page.locator(`input[value="${id}"]`) });
    await row.locator(PcLocators.main.cartItemName).click();
    await expect(this.page).toHaveURL(url => url.pathname === `/display/product/${productId}`);
    await this.page.goBack();
    await expect(this.page).toHaveURL(url => url.pathname === '/custord/basket');
    await expect(row).toBeVisible();
  }

  /** 담기 전에는 없었던 행만 삭제한다. 전체 선택 삭제를 사용하지 않는다. */
  async deleteAddedCartItem(id: string) {
    expect(id).toMatch(/^\d+$/);
    const row = this.page.locator(PcLocators.main.cartItems).filter({ has: this.page.locator(`input[value="${id}"]`) });
    await expect(row).toHaveCount(1);
    const dialog = this.page.waitForEvent('dialog').then(async confirmation => {
      const message = confirmation.message();
      if (message === '선택한 상품을 삭제하시겠습니까?') await confirmation.accept();
      else await confirmation.dismiss();
      expect(message).toBe('선택한 상품을 삭제하시겠습니까?');
    });
    await Promise.all([dialog, row.locator(PcLocators.main.cartItemDelete).click()]);
    await expect(row).toHaveCount(0);
  }

  async getCartProductName(): Promise<string> {
    return (await this.getText(PcLocators.main.cartProductName)).replace(/\s/g, '');
  }

  /** 장바구니 선택 삭제 버튼 클릭 (dialog 자동 수락) */
  async clickCartDeleteButton() {
    this.page.once('dialog', dialog => dialog.accept());
    await this.click(PcLocators.main.cartDeleteButton);
  }

  /** ON AIR > 구매하기 버튼 클릭 */
  async clickOnAirBuyButton() {
    const button = this.page.locator(PcLocators.main.purchaseModal).locator(PcLocators.main.onAirBuyButton);
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await button.click();
    await expect(this.page).toHaveURL(url => ['/custord/loginPage', '/' + PcLocators.urls.onAirBuyOrder].includes(url.pathname));
    if (new URL(this.page.url()).pathname === '/custord/loginPage') {
      const guest = this.page.getByText('비회원 주문하기', { exact: true });
      await expect(guest).toBeVisible();
      await guest.click();
      return '비회원 주문';
    }
    return '회원 주문';
  }

  /** 주문서 URL뿐 아니라 실제 본문과 주문상품 상세를 검증한다. */
  async isBuyOrderPage(expected?: { name: string; quantity: number; options: string[]; amount: number }): Promise<boolean> {
    await expect(this.page).toHaveURL(url => url.pathname === '/' + PcLocators.urls.onAirBuyOrder, { timeout: 20_000 });
    const main = this.page.locator('main');
    await expect(main).toBeVisible();
    for (const name of [/^주문자$/, /^배송지(?:\s|$)/, /^결제수단$/]) {
      await expect(main.getByRole('heading', { name })).toBeVisible();
    }
    const items = main.locator(PcLocators.main.orderItems);
    if (!await items.first().isVisible()) await main.locator(PcLocators.main.orderSummary).click();
    await expect(items).toHaveCount(1);
    await expect(items).toBeVisible();
    await items.scrollIntoViewIfNeeded();
    const title = items.locator(PcLocators.main.orderProductName);
    const price = items.locator(PcLocators.main.orderProductPrice);
    await expect(title).toBeVisible();
    await expect(price).toBeVisible();
    if (expected) {
      await expect(title).toHaveText(expected.name);
      const details = (await items.locator(PcLocators.main.orderProductOptions).allTextContents()).map(s => s.trim());
      const quantityText = details.find(s => /\d+개$/.test(s));
      expect(quantityText, '주문상품 수량').toBeTruthy();
      expect(Number(quantityText!.match(/(\d+)개$/)![1]), '주문상품 수량 일치').toBe(expected.quantity);
      const options = details.map(s => s.replace(/\s*\d+개$/, '').trim()).filter(Boolean);
      expect(options, '주문상품 옵션 일치').toEqual(expected.options);
      expect(Number((await price.innerText()).replace(/\D/g, '')), '주문상품 금액 일치').toBe(expected.amount * expected.quantity);
    }
    await expect(main.getByRole('button', { name: /결제하기$/ })).toBeVisible();
    return true;
  }

  /** 카테고리 버튼 클릭 */
  async clickCategoryButton() {
    await this.click(PcLocators.main.categoryButton);
  }

  /** 카테고리 1depth(홈쇼핑) 클릭 */
  async clickHomeShoppingOneDepth() {
    await this.click(PcLocators.main.homeShoppingOneDepthButton);
  }

  /** 카테고리 2depth 랜덤 클릭 */
  async clickCategoryTwoDepth() {
    const count = await this.count(PcLocators.main.categoryTwoDepthButton);
    const randomNum = this.getRandomIndex(count);
    await this.nthClick(PcLocators.main.categoryTwoDepthButton, randomNum);
  }

  /** 홈쇼핑 3depth 랜덤 클릭 */
  async clickHomeShoppingThreeDepth() {
    const count = await this.count(PcLocators.main.homeShoppingThreeDepthButton);
    const randomNum = this.getRandomIndex(count);
    await this.nthClick(PcLocators.main.homeShoppingThreeDepthButton, randomNum);
    await this.wait(3);
  }

  /** 첫번째 필터 클릭 */
  async clickFirstFilterButton() {
    await this.click(PcLocators.main.firstFilterButton);
    await this.wait(2);
  }

  /** 상품 개수 추출 */
  async extractProductQuantity(): Promise<number | false> {
    const text = await this.getText(PcLocators.main.productQuantity);
    return this.extractNumber(text);
  }

  /** 검색 버튼 클릭 */
  async clickSearchButton() {
    await this.click(PcLocators.main.searchButton);
  }

  /** 검색 > 인기 검색어 랜덤 클릭 후 검색어 반환 */
  async clickPopularWord(): Promise<string> {
    const count = await this.count(PcLocators.main.popularWords);
    const randomNum = this.getRandomIndex(count);
    const word = await this.getIndexText(PcLocators.main.popularWords, randomNum);
    await this.nthClick(PcLocators.main.popularWords, randomNum);

    return word;
  }

  /** 검색 결과 첫 번째 상품 클릭 */
  async clickSearchProduct() {
    await this.click(PcLocators.main.searchProduct);
  }

  /** 상품 상세 페이지 이동 확인 */
  async isProductDetailPage(): Promise<boolean> {
    return this.urlContains(PcLocators.urls.productDetail);
  }
}
