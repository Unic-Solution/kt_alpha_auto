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

  /** 홈의 이전·다음 방송 카드와 실제 로딩된 상품 정보를 읽는다. */
  async getAdjacentBroadcastCards() {
    const section = this.page.locator(MwLocators.main.onAirDisplay);
    const cards = section.locator(MwLocators.main.adjacentCards);
    await expect(cards, '이전·다음 방송 카드가 각각 하나씩 있어야 한다').toHaveCount(2);
    const result = [];
    for (let index = 0; index < 2; index++) {
      const card = cards.nth(index);
      await card.scrollIntoViewIfNeeded();
      await expect(card).toBeInViewport();
      const title = card.locator(MwLocators.main.adjacentName);
      const time = card.locator(MwLocators.main.adjacentTime);
      const price = card.locator(MwLocators.main.adjacentPrice);
      const link = card.locator(MwLocators.main.adjacentLink);
      await expect(title).toBeVisible();
      await expect(title).toHaveText(/\S/);
      await expect(time).toBeVisible();
      await expect(time).toHaveText(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
      await expect(price).toBeVisible();
      await expect(price).toHaveText(/^(?:[\d,]+원|상담(?: 신청)? 상품)$/);
      await expect(link).toHaveAttribute('href', /^\/display\/product\/\d+(?:[?]|$)/);
      const name = (await title.innerText()).replace(/\s+/g, ' ').trim();
      const image = card.locator('img');
      await expect(image).toBeVisible();
      await expect(image).toHaveAttribute('alt', name);
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
        { message: '이전·다음 방송 상품 이미지 로딩', timeout: 10_000 }).toBe(true);
      const href = (await link.getAttribute('href'))!;
      result.push({ direction: index === 0 ? '이전 방송' : '다음 방송', index,
        productId: href.match(/\/product\/(\d+)/)![1], name, time: (await time.innerText()).trim(),
        price: (await price.innerText()).trim() });
    }
    return result;
  }

  /** 홈 편성표 버튼으로 이동하고 현재 방송 앞뒤의 대표 상품·시각을 읽는다. */
  async getAdjacentScheduleProducts() {
    await this.page.locator(MwLocators.main.onAirDisplay).locator(MwLocators.main.onAirSchedule).click();
    await expect(this.page).toHaveURL(url => url.searchParams.get('gnbMenuId') === 'G000000002');
    const broadcasts = this.page.locator(MwLocators.main.broadcasts);
    await expect(this.page.locator(MwLocators.main.liveBroadcast)).toHaveCount(1);
    const liveIndex = await broadcasts.evaluateAll(nodes => nodes.findIndex(n => n.getAttribute('data-broadcast-state') === 'live'));
    expect(liveIndex, '이전 방송이 있어야 한다').toBeGreaterThan(0);
    expect(liveIndex, '다음 방송이 있어야 한다').toBeLessThan(await broadcasts.count() - 1);
    const result = [];
    for (const index of [liveIndex - 1, liveIndex + 1]) {
      const broadcast = broadcasts.nth(index);
      const product = broadcast.locator(MwLocators.main.liveProduct).first();
      await expect(product).toBeVisible();
      const heading = await broadcast.locator(MwLocators.main.broadcastHeading).innerText();
      const time = heading.match(/(\d{2}:\d{2})\s*~/)?.[1];
      expect(time, '편성표 방송 시작 시각').toBeTruthy();
      const productId = await product.locator('[data-product-id]').getAttribute('data-product-id');
      expect(productId).toMatch(/^\d+$/);
      result.push({ productId: productId!, name: (await product.locator(MwLocators.main.liveProductTitle).innerText()).replace(/\s+/g, ' ').trim(), time });
    }
    return result;
  }

  async verifyAdjacentProductPage(card: { index: number; productId: string; name: string; time: string }) {
    await this.goToHome();
    const item = this.page.locator(MwLocators.main.onAirDisplay).locator(MwLocators.main.adjacentCards).nth(card.index);
    await expect(item.locator(MwLocators.main.adjacentName), '방송 전환 여부 확인').toHaveText(card.name);
    await expect(item.locator(MwLocators.main.adjacentTime)).toHaveText(card.time);
    await expect(item.locator(MwLocators.main.adjacentLink)).toHaveAttribute('href', new RegExp(`^/display/product/${card.productId}(?:[?]|$)`));
    await item.locator(MwLocators.main.adjacentLink).click();
    await expect(this.page).toHaveURL(url => url.pathname === `/display/product/${card.productId}`);
    await this.closeModal();
    await expect(this.page.locator(MwLocators.product.productName).first()).toContainText(card.name);
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
      await expect(modal).toBeVisible({ timeout: 10_000 });
    }).toPass({ timeout: 30_000, intervals: [1_000] });
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

  async selectOnAirOption(allowScheduleFallback = false) {
    await this.goToHome();
    const price = this.page.locator(MwLocators.main.onAirDisplay).locator(MwLocators.main.onAirPrice);
    await expect(price).toBeVisible();
    const canBuy = !(await price.innerText()).includes('상담') &&
      await this.page.locator(MwLocators.main.onAirDirectBuyButton).getByText('바로구매', { exact: true }).isVisible();
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
    await this.page.locator(MwLocators.main.onAirDisplay).locator(MwLocators.main.onAirSchedule).click();
    await expect(this.page).toHaveURL(url => url.searchParams.get('gnbMenuId') === 'G000000002');
    const broadcasts = this.page.locator(MwLocators.main.broadcasts);
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
      const info = broadcast.locator(MwLocators.main.liveProduct).first();
      const productId = await info.locator('[data-product-id]').getAttribute('data-product-id');
      expect(productId).toMatch(/^\d+$/);
      const name = (await info.locator(MwLocators.main.liveProductTitle).innerText()).trim();
      const amount = Number((await info.locator(MwLocators.main.liveProductPrice).innerText()).replace(/\D/g, ''));
      expect(amount).toBeGreaterThan(0);
      await buy.scrollIntoViewIfNeeded();
      await buy.click();
      await expect(this.page.locator(MwLocators.main.purchaseModal)).toBeVisible({ timeout: 20_000 });
      await this.selectFirstEnabledOption(name);
      return { productId: productId!, name, amount, source: '편성표' };
    }
    throw new Error('편성표에 바로 구매 가능한 일반 상품이 없습니다.');
  }

  async clickOnAirGiftButton() {
    const button = this.page.locator(MwLocators.main.purchaseModal).locator(MwLocators.main.onAirGiftButton);
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await button.click();
  }

  /** 로그인 화면이 아닌 실제 선물하기 주문서 본문과 상품을 확인한다. */
  async isGiftOrderPage(productName?: string): Promise<boolean> {
    await expect(this.page, '선물하기 주문서 URL로 이동해야 한다').toHaveURL(
      url => url.pathname === '/' + MwLocators.urls.onAirGiftOrder,
      { timeout: 20_000 },
    );
    const main = this.page.locator('main');
    await expect(main).toBeVisible();
    await expect(this.page.getByRole('heading', { name: '선물하기', exact: true, level: 1 })).toBeVisible();
    await expect(main.getByRole('heading', { name: '발송정보', exact: true })).toBeVisible();
    await expect(main.getByRole('heading', { name: '메시지 카드', exact: true })).toBeVisible();
    if (productName) await expect(main.getByText(productName, { exact: true }).first()).toBeVisible();
    return true;
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
    const button = this.page.locator(MwLocators.main.purchaseModal).locator(MwLocators.main.onAirBuyButton);
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await button.click();
    await expect(this.page).toHaveURL(url => ['/custord/loginPage', '/' + MwLocators.urls.onAirBuyOrder].includes(url.pathname));
    await expect(this.page, '로그인이 만료되었습니다. 재로그인 후 테스트를 다시 실행해 주세요.').toHaveURL(
      url => url.pathname === '/' + MwLocators.urls.onAirBuyOrder,
    );
    return '회원 주문';
  }

  /** 주문서 URL뿐 아니라 실제 본문과 주문상품 상세를 검증한다. */
  async isBuyOrderPage(expected?: { name: string; quantity: number; options: string[]; amount: number }): Promise<boolean> {
    await expect(this.page).toHaveURL(url => url.pathname === '/' + MwLocators.urls.onAirBuyOrder, { timeout: 20_000 });
    const main = this.page.locator('main');
    await expect(main).toBeVisible();
    for (const name of [/^주문자$/, /^배송지(?:\s|$)/, /^결제수단$/]) {
      await expect(main.getByRole('heading', { name })).toBeVisible();
    }
    const items = main.locator(MwLocators.main.orderItems);
    if (!await items.first().isVisible()) await main.locator(MwLocators.main.orderSummary).click();
    await expect(items).toHaveCount(1);
    await expect(items).toBeVisible();
    await items.scrollIntoViewIfNeeded();
    const title = items.locator(MwLocators.main.orderProductName);
    const price = items.locator(MwLocators.main.orderProductPrice);
    await expect(title).toBeVisible();
    await expect(price).toBeVisible();
    if (expected) {
      await expect(title).toHaveText(expected.name);
      const details = (await items.locator(MwLocators.main.orderProductOptions).allTextContents()).map(s => s.trim());
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

  /** 홈쇼핑 1·2·3depth와 전체 필터·정렬의 실제 이동·결과를 검증한다. */
  async verifyCategoryAndFilter() {
    const modal = this.page.locator(MwLocators.main.categoryModal);
    await expect(modal).toBeVisible();
    const depth1 = modal.locator(MwLocators.main.homeShoppingOneDepthButton);
    await expect(depth1).toBeVisible();
    await expect(depth1).toHaveClass(/Tab_selected/);
    const depth1Name = (await depth1.innerText()).trim();

    const depth2 = modal.locator(MwLocators.main.categoryTwoDepthButton).first();
    await expect(depth2).toBeVisible();
    const depth2Name = (await depth2.innerText()).trim();
    const depth2Id = new URL((await depth2.getAttribute('href'))!, this.page.url()).searchParams.get('ctgrCdId');
    expect(depth2Id).toMatch(/^\d+$/);
    const interruptions = this.page.locator('[class*="Modal_open"]').filter({
      hasNot: this.page.locator('[role="tab"][data-value="alpha"]'),
    });
    while (await interruptions.first().isVisible()) {
      await interruptions.first().getByRole('button', { name: '닫기', exact: true }).click({ force: true });
    }
    await depth2.click();
    await expect(this.page).toHaveURL(url => url.pathname.endsWith('/displayCategoryTemplate') && url.searchParams.get('ctgrCdId') === depth2Id);

    const depth3 = this.page.locator(MwLocators.main.categoryThreeDepthButton).first();
    await expect(depth3).toBeVisible();
    const depth3Name = (await depth3.innerText()).trim();
    await depth3.click();
    await expect(this.page).toHaveURL(url => url.pathname.endsWith('/categoryDetail') && url.searchParams.get('upperCtgrCdId') === depth2Id);
    await expect(this.page.locator(MwLocators.main.categoryThreeDepthButton).first()).toHaveText('전체');
    await expect(this.page.locator(MwLocators.main.categoryThreeDepthButton).first()).toHaveClass(/SubCategoryMenu_active/);
    await expect.poll(async () => (await this.extractProductQuantity()) || 0, {
      message: '필터 전 상품 목록이 로딩되어야 한다', timeout: 15_000,
    }).toBeGreaterThan(0);
    const beforeQuantity = await this.extractProductQuantity();
    const detailUrl = this.page.url();
    const products = () => this.page.locator(MwLocators.main.categoryProducts).filter({ visible: true });
    const expectProducts = async () => {
      await expect(products().first(), '필터·정렬 결과 상품').toBeVisible();
      return (await products().allTextContents()).slice(0, 10).map(text => text.replace(/\s+/g, ' ').trim());
    };
    const goToDetail = async () => {
      await this.page.goto(detailUrl);
      await this.closeModal();
      await expect(this.page.locator(MwLocators.main.firstFilterButton)).toBeVisible();
    };

    await this.page.locator(MwLocators.main.firstFilterButton).click();
    await expect(this.page).toHaveURL(url => url.searchParams.get('onAirSale') === 'Y');
    const tvProducts = await expectProducts();
    expect(tvProducts.every(text => text.includes('TV상품')), 'TV쇼핑 결과').toBe(true);

    const modalFilter = async (trigger: string, select: (modal: ReturnType<typeof this.page.locator>) => Promise<void>, parameter: string, value: RegExp) => {
      await goToDetail();
      await this.page.getByRole('button', { name: trigger, exact: true }).click();
      const modal = this.page.locator(MwLocators.main.filterModal);
      await expect(modal).toBeVisible();
      await select(modal);
      await modal.getByRole('button', { name: /개의 상품보기$/ }).click();
      await expect(this.page).toHaveURL(url => value.test(url.searchParams.get(parameter) ?? ''));
      return expectProducts();
    };
    await modalFilter('혜택', async modal => {
      await modal.getByRole('button', { name: '무료배송', exact: true }).click();
    }, 'benefits', /is_free_shipping/);
    await modalFilter('가격', async modal => {
      await modal.getByRole('button', { name: /4백원 ~ 7만원/, exact: true }).click();
    }, 'filters', /btw%24400%2470000/);
    await modalFilter('결과 내 재검색', async modal => {
      await modal.locator('input').fill('원피스');
      await modal.getByRole('button', { name: '추가', exact: true }).click();
    }, 'oquery', /^원피스$/);

    const sorts = [
      ['인기순', null],
      ['신상품순', 'created_at_desc'],
      ['낮은 가격순', 'sale_price_asc'],
      ['높은 가격순', 'sale_price_desc'],
      ['할인율 높은순', 'user_group_price_discount_rate_desc'],
      ['상품평순', 'review_score_desc'],
    ] as const;
    for (const [name, value] of sorts) {
      await goToDetail();
      await this.page.getByRole('button', { name: '인기순', exact: true }).click();
      const options = this.page.locator(MwLocators.main.sortOptions);
      for (const [optionName] of sorts) {
        await expect(options.filter({ hasText: new RegExp(`^${optionName}$`) })).toHaveCount(1);
      }
      await options.filter({ hasText: new RegExp(`^${name}$`) }).click();
      if (value) await expect(this.page).toHaveURL(url => url.searchParams.get('sort') === value);
      else await expect(this.page.getByRole('button', { name, exact: true }).first()).toBeVisible();
      await expectProducts();
    }
    return { depth1Name, depth2Name, depth3Name, depth2Id, beforeQuantity, filters: ['TV쇼핑', '혜택-무료배송', '가격-400~70,000원', '결과 내 재검색-원피스'], sorts: sorts.map(([name]) => name), url: this.page.url() };
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
