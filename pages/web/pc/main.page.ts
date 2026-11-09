import { expect } from '@playwright/test';
import { BasePage } from '../../common/BasePage';
import { PcLocators } from './locators';

export class MainPage extends BasePage {
  private selectedOptionTexts: string[] = [];

  /** 옵션을 구성요소로 나누고 화면에만 붙는 판매 단위 토큰을 제외한다. */
  private normalizeOptions(options: string[]): string[] {
    return options
      .flatMap(option => option.split('/'))
      .map(option => option.replace(/\s+/g, ' ').trim())
      .filter(option => option.length > 0 && option !== '세트');
  }

  private async goToBenefitsPage() {
    await this.goToHome();
    await this.page.evaluate(() => window.scrollTo(0, 1600));
    await expect.poll(() => this.page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await this.page.waitForTimeout(400);
    await this.page.evaluate(() => window.scrollBy(0, -300));

    const nav = this.page.locator(PcLocators.main.gnb);
    await expect(nav, '스크롤 후 GNB가 노출되어야 한다').toBeVisible({ timeout: 10_000 });
    await expect(nav).toBeInViewport();
    const benefitMenu = nav.getByRole('button', { name: /혜택\/이벤트$/ });
    await expect(benefitMenu, '혜택/이벤트 GNB 메뉴는 하나여야 한다').toHaveCount(1);
    await expect(benefitMenu, '혜택/이벤트 GNB 메뉴가 노출되어야 한다').toBeVisible();
    const content = this.page.getByRole('heading', { name: '지금 주목할 혜택&기획전', exact: true });
    await expect(async () => {
      if (!await content.isVisible()) await benefitMenu.click();
      await expect(content, '혜택/이벤트 페이지 본문이 노출되어야 한다').toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 15_000, intervals: [500] });
  }

  /** GNB 전체 순회 - 각 항목 클릭 후 main 영역 노출 여부 반환 */
  async isAllNavItemsVisible(): Promise<{ index: number; isVisible: boolean }[]> {
    const nav = this.page.locator(PcLocators.main.gnb);
    const buttons = this.page.locator(PcLocators.main.gnbButtons);
    const results: { index: number; isVisible: boolean }[] = [];
    await expect.poll(() => buttons.count(), { message: 'GNB 메뉴 로딩' })
      .toBeGreaterThanOrEqual(PcLocators.main.gnbMenuIds.length);
    const menuCount = await buttons.count();

    // 최상단의 숨김 상태와 스크롤 후 실제 화면 내 노출을 구분한다.
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await expect(nav).toBeHidden();
    for (let index = 0; index < menuCount; index++) {
      await this.page.evaluate(() => window.scrollTo(0, 1600));
      await expect.poll(() => this.page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
      await this.page.waitForTimeout(400);
      await this.page.evaluate(() => window.scrollBy(0, -300));
      await expect(nav).toBeVisible();
      await expect(nav).toBeInViewport();
      await this.closeModal(500);
      const button = buttons.nth(index);
      const name = (await button.innerText()).replace(/\s+/g, ' ');
      console.log(`[GNB ${index + 1}] ${name} 클릭`);
      await expect(async () => {
        await this.closeModal(500);
        await expect(this.page.locator('[class*="Dimmed_open"]')).toBeHidden({ timeout: 1_000 });
        await button.click({ timeout: 3_000 });
      }).toPass({ timeout: 10_000, intervals: [500] });
      await expect(this.page).toHaveURL(url => /^G\d+$/.test(url.searchParams.get('gnbMenuId') ?? ''));
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
    const name = (await title.innerText()).replace(/\s+/g, ' ').trim();
    const productId = (await title.getAttribute('href'))!.match(/\/product\/(\d+)/)![1];
    const image = section.locator(PcLocators.main.onAirImage);
    await expect(image).toBeVisible();
    await expect.poll(async () => (await image.getAttribute('alt'))?.replace(/\s+/g, ' ').trim(), {
      message: 'ON AIR 상품명과 이미지 대체 텍스트가 일치해야 한다',
    }).toBe(name);
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

  /** 홈의 이전·다음 방송 카드와 실제 로딩된 상품 정보를 읽는다. */
  async getAdjacentBroadcastCards() {
    const section = this.page.locator(PcLocators.main.onAirDisplay);
    const cards = section.locator(PcLocators.main.adjacentCards);
    await expect(cards, '이전·다음 방송 카드가 각각 하나씩 있어야 한다').toHaveCount(2);
    const result = [];
    for (let index = 0; index < 2; index++) {
      const card = cards.nth(index);
      await card.scrollIntoViewIfNeeded();
      await expect(card).toBeInViewport();
      const title = card.locator(PcLocators.main.adjacentName);
      const time = card.locator(PcLocators.main.adjacentTime)
        .or(card.getByText(/^(?:[01]\d|2[0-3]):[0-5]\d$/, { exact: true })).first();
      const price = card.locator(PcLocators.main.adjacentPrice);
      const link = card.locator(PcLocators.main.adjacentLink);
      await expect(title).toBeVisible();
      await expect(title).toHaveText(/\S/);
      await expect(price).toBeVisible();
      await expect(price).toHaveText(/^(?:[\d,]+원|상담(?: 신청)? 상품)$/);
      await expect(link).toHaveAttribute('href', /^\/display\/product\/\d+(?:[?]|$)/);
      const name = (await title.innerText()).replace(/\s+/g, ' ').trim();
      const image = card.locator('img');
      await expect(image).toBeVisible();
      await expect.poll(async () => (await image.getAttribute('alt'))?.replace(/\s+/g, ' ').trim(), {
        message: '이전·다음 방송 상품명과 이미지 대체 텍스트가 일치해야 한다',
      }).toBe(name);
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
        { message: '이전·다음 방송 상품 이미지 로딩', timeout: 10_000 }).toBe(true);
      const href = (await link.getAttribute('href'))!;
      const timeText = await time.isVisible() ? (await time.innerText()).trim() : undefined;
      result.push({ direction: index === 0 ? '이전 방송' : '다음 방송', index,
        productId: href.match(/\/product\/(\d+)/)![1], name, time: timeText,
        price: (await price.innerText()).trim() });
    }
    return result;
  }

  /** 홈 편성표 버튼으로 이동하고 현재 방송 앞뒤의 대표 상품·시각을 읽는다. */
  async getAdjacentScheduleProducts() {
    await this.page.locator(PcLocators.main.onAirDisplay).locator(PcLocators.main.onAirSchedule).click();
    await expect(this.page).toHaveURL(url => url.searchParams.get('gnbMenuId') === 'G000000002');
    const broadcasts = this.page.locator(PcLocators.main.broadcasts);
    await expect(this.page.locator(PcLocators.main.liveBroadcast)).toHaveCount(1);
    const liveIndex = await broadcasts.evaluateAll(nodes => nodes.findIndex(n => n.getAttribute('data-broadcast-state') === 'live'));
    expect(liveIndex, '이전 방송이 있어야 한다').toBeGreaterThan(0);
    expect(liveIndex, '다음 방송이 있어야 한다').toBeLessThan(await broadcasts.count() - 1);
    const result = [];
    for (const index of [liveIndex - 1, liveIndex + 1]) {
      const broadcast = broadcasts.nth(index);
      const product = broadcast.locator(PcLocators.main.liveProduct).first();
      await expect(product).toBeVisible();
      const heading = await broadcast.locator(PcLocators.main.broadcastHeading).innerText();
      const time = heading.match(/(\d{2}:\d{2})\s*~/)?.[1];
      expect(time, '편성표 방송 시작 시각').toBeTruthy();
      const productId = await product.locator('[data-product-id]').getAttribute('data-product-id');
      expect(productId).toMatch(/^\d+$/);
      result.push({ productId: productId!, name: (await product.locator(PcLocators.main.liveProductTitle).innerText()).replace(/\s+/g, ' ').trim(), time });
    }
    return result;
  }

  async verifyAdjacentProductPage(card: { index: number; productId: string; name: string; time?: string }) {
    await this.goToHome();
    const item = this.page.locator(PcLocators.main.onAirDisplay).locator(PcLocators.main.adjacentCards).nth(card.index);
    await expect(item.locator(PcLocators.main.adjacentName), '방송 전환 여부 확인').toHaveText(card.name);
    if (card.time) await expect(item.locator(PcLocators.main.adjacentTime)).toHaveText(card.time);
    await expect(item.locator(PcLocators.main.adjacentLink)).toHaveAttribute('href', new RegExp(`^/display/product/${card.productId}(?:[?]|$)`));
    await item.locator(PcLocators.main.adjacentLink).click();
    await expect(this.page).toHaveURL(url => url.pathname === `/display/product/${card.productId}`);
    await this.closeModal();
    await expect(this.page.locator(PcLocators.product.productName).first()).toContainText(card.name);
  }

  /** 홈 > ON AIR(지금 방송중) > 바로구매 버튼 클릭 */
  async clickDirectBuyButton() {
    // 초기 라우팅 완료 후 클릭해야 hydration 중 클릭이 유실되지 않는다.
    await expect(this.page).toHaveURL(url => url.searchParams.get('gnbMenuId') === 'G000000004');
    const button = this.page.locator(PcLocators.main.onAirDirectBuyButton);
    await button.scrollIntoViewIfNeeded();
    const modal = this.page.locator(PcLocators.main.purchaseModal);
    // 지연 홈 팝업이나 초기 hydration이 클릭을 막으면 팝업 정리부터 다시 수행한다.
    await expect(async () => {
      if (!await modal.isVisible()) {
        await this.closeModal(500);
        await button.click({ timeout: 3_000 });
      }
      await expect(modal).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 30_000, intervals: [1_000] });
  }

  /** 현재 방송 대표 상품을 선택하고 필요한 옵션을 순서대로 선택한다. */
  async selectFirstEnabledOption(productName?: string) {
    const modal = this.page.locator(PcLocators.main.purchaseModal);
    const giftButton = modal.getByRole('button', { name: '선물', exact: true });
    this.selectedOptionTexts = [];
    for (let depth = 0; depth < 10; depth++) {
      if (await giftButton.isVisible()) {
        await this.selectFreeGiftIfNeeded();
        await expect(giftButton).toBeEnabled();
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
        this.selectedOptionTexts.push((await option.innerText()).replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ').trim());
        await option.click();
      }
      await expect.poll(async () => Number(await giftButton.isVisible()) +
        await modal.locator(PcLocators.main.purchaseProduct).filter({ visible: true }).count() +
        await modal.locator(PcLocators.main.purchaseOption).filter({ visible: true }).count(),
      { message: '다음 상품 옵션 또는 선물 버튼이 노출되어야 한다' }).toBeGreaterThan(0);
    }
    throw new Error('상품 옵션 선택이 10단계 안에 완료되지 않았습니다.');
  }

  /** 선택 상품에 필수 사은품이 있으면 첫 번째 활성 사은품을 적용한다. */
  async selectFreeGiftIfNeeded() {
    const trigger = this.page.locator(PcLocators.main.purchaseModal)
      .locator(PcLocators.main.freeGiftTrigger).filter({ visible: true }).first();
    await trigger.waitFor({ state: 'visible', timeout: 1_000 }).catch(() => {});
    if (!await trigger.isVisible()) return;

    await trigger.click();
    const modal = this.page.locator(PcLocators.main.freeGiftModal).last();
    await expect(modal, '사은품 선택 팝업이 노출되어야 한다').toBeVisible();
    await modal.locator(PcLocators.main.freeGiftSelect).click();
    const option = modal.locator(PcLocators.main.freeGiftOption).filter({ visible: true }).first();
    await expect(option, '선택 가능한 사은품이 있어야 한다').toBeVisible();
    await option.click();
    await modal.getByRole('button', { name: '사은품 선택하기', exact: true }).click();
    await expect(modal, '사은품 선택 후 팝업이 닫혀야 한다').toBeHidden();
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
    const modal = this.page.locator(PcLocators.main.purchaseModal);
    const button = modal.getByRole('button', { name: '선물', exact: true });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await button.scrollIntoViewIfNeeded();
    await expect(async () => {
      if (new URL(this.page.url()).pathname !== '/' + PcLocators.urls.onAirGiftOrder) {
        await button.click();
      }
      await expect(this.page).toHaveURL(
        url => url.pathname === '/' + PcLocators.urls.onAirGiftOrder,
        { timeout: 5_000 },
      );
    }).toPass({ timeout: 20_000, intervals: [1_000] });
  }

  /** 로그인 화면이 아닌 실제 선물하기 주문서 본문과 상품을 확인한다. */
  async isGiftOrderPage(productName?: string): Promise<boolean> {
    await expect(this.page, '선물하기 주문서 URL로 이동해야 한다').toHaveURL(
      url => url.pathname === '/' + PcLocators.urls.onAirGiftOrder,
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

  /** ON AIR 상품 이름 추출 */
  async getOnAirProductName(): Promise<string> {
    return (await this.getText(PcLocators.main.onAirProductName)).replace(/\s/g, '');
  }

  /** ON AIR 구매 모달의 장바구니 버튼 노출 여부 */
  async isOnAirCartButtonVisible(): Promise<boolean> {
    return this.page.locator(PcLocators.main.purchaseModal).locator(PcLocators.main.onAirCartButton).isVisible();
  }

  /** ON AIR > 장바구니 버튼 클릭 및 담기 완료 확인 */
  async clickOnAirCartButton() {
    const button = this.page.locator(PcLocators.main.purchaseModal).locator(PcLocators.main.onAirCartButton);
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await button.click();
    await expect(this.page.getByText('장바구니에 상품이 담겼습니다.', { exact: true })).toBeVisible();
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
    const visibleOptions = (await modal.locator(PcLocators.main.selectedOptions).allTextContents())
      .map(s => s.replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ').trim()).filter(Boolean);
    const options = visibleOptions.length ? visibleOptions : this.selectedOptionTexts;
    return { quantity: count, options: this.normalizeOptions(options) };
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
        options: this.normalizeOptions(options.filter(s => !/수량\s*:/.test(s))),
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
    await expect(this.page, '로그인이 만료되었습니다. 재로그인 후 테스트를 다시 실행해 주세요.').toHaveURL(
      url => url.pathname === '/' + PcLocators.urls.onAirBuyOrder,
    );
    return '회원 주문';
  }

  /** 주문서 URL뿐 아니라 실제 본문과 주문상품 상세를 검증한다. */
  async isBuyOrderPage(expected?: { name: string; quantity: number; options: string[]; amount: number }): Promise<boolean> {
    await expect(this.page).toHaveURL(url => url.pathname === '/' + PcLocators.urls.onAirBuyOrder, { timeout: 20_000 });
    const main = this.page.locator('main');
    await expect(main).toBeVisible();
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
      const options = this.normalizeOptions(details.map(s => s.replace(/\s*\d+개$/, '').trim()).filter(Boolean));
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

  /** 홈쇼핑 1·2·3depth와 전체 필터·정렬의 실제 이동·결과를 검증한다. */
  async verifyCategoryAndFilter() {
    const modal = this.page.locator(PcLocators.main.categoryModal);
    await expect(modal).toBeVisible();
    const depth1 = modal.locator(PcLocators.main.homeShoppingOneDepthButton);
    await expect(depth1).toBeVisible();
    await expect(depth1).toHaveClass(/Tab_selected/);
    const depth1Name = (await depth1.innerText()).trim();

    const depth2 = modal.locator(PcLocators.main.categoryTwoDepthButton).first();
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

    const depth3 = this.page.locator(PcLocators.main.homeShoppingThreeDepthButton).first();
    await expect(depth3).toBeVisible();
    const depth3Name = (await depth3.innerText()).trim();
    await depth3.click();
    await expect(this.page).toHaveURL(url => url.pathname.endsWith('/categoryDetail') && url.searchParams.get('upperCtgrCdId') === depth2Id);
    await expect(this.page.locator(PcLocators.main.homeShoppingThreeDepthButton).first()).toHaveText('전체');
    await expect(this.page.locator(PcLocators.main.homeShoppingThreeDepthButton).first()).toHaveClass(/SubCategoryMenu_active/);
    await expect.poll(async () => (await this.extractProductQuantity()) || 0, {
      message: '필터 전 상품 목록이 로딩되어야 한다', timeout: 15_000,
    }).toBeGreaterThan(0);
    const beforeQuantity = await this.extractProductQuantity();
    const products = () => this.page.locator(PcLocators.main.categoryProducts).filter({ visible: true });
    const expectProducts = async () => {
      await expect(products().first(), '필터·정렬 결과 상품').toBeVisible();
      return (await products().allTextContents()).slice(0, 10).map(text => text.replace(/\s+/g, ' ').trim());
    };

    await this.page.locator(PcLocators.main.firstFilterButton).click();
    await expect(this.page).toHaveURL(url => url.searchParams.get('onAirSale') === 'Y');
    await expectProducts();

    const modalFilter = async (trigger: string, select: (modal: ReturnType<typeof this.page.locator>) => Promise<void>, parameter: string, value: RegExp) => {
      await this.page.getByRole('button', { name: trigger, exact: true }).click();
      const modal = this.page.locator(PcLocators.main.filterModal);
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
      const sortTrigger = this.page.getByRole('button', {
        name: /^(?:인기순|신상품순|낮은 가격순|높은 가격순|할인율 높은순|상품평순)$/,
      }).filter({ visible: true }).first();
      await expect(sortTrigger, '현재 선택된 정렬 버튼이 노출되어야 한다').toBeVisible();
      await sortTrigger.click();
      const options = this.page.locator(PcLocators.main.sortOptions);
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

  /** 검색 버튼 클릭 */
  async clickSearchButton() {
    await this.click(PcLocators.main.searchButton);
  }

  /** 첫 번째 인기 검색어를 선택하고 검색 결과 이동을 확인한다. */
  async clickPopularWord(): Promise<string> {
    const words = this.page.locator(PcLocators.main.popularWords);
    await expect(words.first(), '인기 검색어가 노출되어야 한다').toBeVisible();
    expect(await words.count(), '인기 검색어 개수').toBeGreaterThan(0);
    const word = (await words.first().innerText()).trim();
    expect(word, '인기 검색어').not.toBe('');
    await words.first().click();
    await expect(this.page).toHaveURL(url => url.pathname.endsWith('/display/search/result') && url.searchParams.get('query') === word);
    return word;
  }

  /** 검색 결과 상품을 클릭하고 상품 상세 페이지 이동을 확인한다. */
  async clickSearchProduct() {
    const product = this.page.locator(PcLocators.main.searchResults).filter({ visible: true }).first();
    await expect(product, '검색 결과 상품이 노출되어야 한다').toBeVisible({ timeout: 15_000 });
    const productId = await product.getAttribute('data-product-id');
    expect(productId).toMatch(/^\d+$/);
    await product.locator(PcLocators.main.searchProduct).click();
    await expect(this.page).toHaveURL(url => url.pathname === `/display/product/${productId}`);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page.locator(PcLocators.product.productName), '상품 상세 화면이 로딩되어야 한다').toBeVisible({ timeout: 15_000 });
    const images = this.page.locator(PcLocators.product.productImage).filter({ visible: true });
    await expect(images.first(), '상품 상세 이미지가 노출되어야 한다').toBeVisible({ timeout: 15_000 });
    await expect.poll(async () => images.evaluateAll(elements =>
      elements.length > 0 && elements.every(element => {
        const image = element as HTMLImageElement;
        return image.complete && image.naturalWidth > 0;
      })), { message: '상품 상세 이미지가 모두 로딩되어야 한다', timeout: 15_000 }).toBe(true);
    return { productId, url: this.page.url() };
  }

  /** 인기 검색어 결과의 방송 상품 구좌를 확인한다. */
  async verifyPopularSearchBroadcastProducts() {
    await this.goToHome();
    await this.clickSearchButton();
    const popularWord = await this.clickPopularWord();
    const section = this.page.locator('[class*="SearchResult_topLineBox"]');
    const heading = section.getByRole('heading', { name: /방송 상품$/ });
    await expect(heading, '검색 결과에 방송 상품 구좌가 노출되어야 한다').toBeVisible({ timeout: 15_000 });
    await expect(heading, '방송 상품 구좌 제목에 선택한 인기 검색어가 표시되어야 한다').toContainText(popularWord);
    await heading.scrollIntoViewIfNeeded();
    const products = section.locator(PcLocators.main.searchResults);
    await expect(products.first(), '방송 상품 구좌에 상품이 한 개 이상 노출되어야 한다')
      .toBeVisible({ timeout: 15_000 });
    return { popularWord, productCount: await products.count() };
  }

  /** 장바구니를 비운 뒤 빈 장바구니의 인기 상품 추천 구좌를 확인한다. */
  async verifyEmptyCartPopularProducts() {
    await this.goToHome();
    await this.closeModal();
    const cartButton = this.page.getByRole('button', { name: '장바구니', exact: true }).filter({ visible: true }).first();
    await expect(cartButton, '메인 페이지 장바구니 버튼이 노출되어야 한다').toBeVisible();
    await cartButton.click();
    await expect(this.page).toHaveURL(url => url.pathname === '/custord/basket');

    const rows = this.page.locator(PcLocators.main.cartItems);
    while (await rows.count()) {
      const id = await rows.first().locator('input[type="checkbox"]').getAttribute('value');
      expect(id, '삭제할 장바구니 행 식별자').toMatch(/^\d+$/);
      await this.deleteAddedCartItem(id!);
    }
    await expect(this.page.getByText(PcLocators.main.cartEmptyText, { exact: true }), '장바구니가 비어 있어야 한다')
      .toBeVisible({ timeout: 15_000 });

    const heading = this.page.getByRole('heading', { name: '지금 많은 고객님이 구매하는 상품', exact: true });
    await expect(heading, '빈 장바구니에 인기 상품 추천 구좌가 노출되어야 한다').toBeVisible({ timeout: 15_000 });
    await heading.scrollIntoViewIfNeeded();
    const section = heading.locator('xpath=ancestor::*[.//*[contains(@class,"ProductItem_box")]][1]');
    const products = section.locator(PcLocators.main.searchResults);
    await expect(products.first(), '인기 상품 추천 구좌에 상품이 한 개 이상 노출되어야 한다')
      .toBeVisible({ timeout: 15_000 });
    return { productCount: await products.count() };
  }

  /** 특가 추천 상품 방문 후 해당 상품 아래에 생성되는 유사 상품 구좌를 확인한다. */
  async verifySpecialPriceRecentlyViewedRecommendation() {
    await this.goToHome();
    await this.closeModal();
    const specialHeading = this.page.getByRole('heading', { name: '고객님, 특가상품 추천드려요', exact: true });
    await expect(async () => {
      if (!await specialHeading.isVisible()) {
        await this.page.evaluate(() => window.scrollBy(0, Math.max(window.innerHeight * 0.8, 600)));
        await this.page.waitForTimeout(300);
      }
      await expect(specialHeading).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 30_000, intervals: [300] });
    await specialHeading.scrollIntoViewIfNeeded();

    const specialSection = specialHeading.locator('xpath=ancestor::div[contains(@class,"displayWrap")][1]');
    const product = specialSection.locator(PcLocators.main.searchResults).first();
    await expect(product, '특가상품 추천 구좌에 상품이 한 개 이상 있어야 한다').toBeVisible({ timeout: 15_000 });
    const productId = await product.getAttribute('data-product-id');
    expect(productId, '선택한 특가상품 ID').toMatch(/^\d+$/);
    const productName = (await product.locator(PcLocators.main.searchProductTitle).innerText()).trim();
    await product.locator(PcLocators.main.searchProduct).click();

    await expect(this.page).toHaveURL(url => url.pathname === `/display/product/${productId}`);
    await expect(this.page.locator(PcLocators.product.productName), '특가상품 상세 화면이 로딩되어야 한다')
      .toBeVisible({ timeout: 15_000 });
    const detailImages = this.page.locator('main img').filter({ visible: true });
    await expect(detailImages.first(), '특가상품 상세 이미지가 노출되어야 한다').toBeVisible({ timeout: 15_000 });
    await expect.poll(async () => detailImages.evaluateAll(images => images.length > 0 && images.every(element => {
      const image = element as HTMLImageElement;
      return image.complete && image.naturalWidth > 0;
    })), { message: '특가상품 상세 이미지가 모두 로딩되어야 한다', timeout: 15_000 }).toBe(true);
    await this.page.waitForTimeout(2_000);

    await this.goToHome();
    await expect(this.page).toHaveURL(url => url.pathname === '/');
    await expect(async () => {
      if (!await specialHeading.isVisible()) {
        await this.page.evaluate(() => window.scrollBy(0, Math.max(window.innerHeight * 0.8, 600)));
        await this.page.waitForTimeout(300);
      }
      await expect(specialHeading, '메인 페이지에 특가상품 추천 구좌가 노출되어야 한다').toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 30_000, intervals: [300] });
    const selectedProduct = specialSection.locator(`${PcLocators.main.searchResults}[data-product-id="${productId}"]`);
    await expect(selectedProduct, '방문했던 특가상품이 복귀 후에도 노출되어야 한다').toBeVisible();
    const recommendation = selectedProduct.locator(
      'xpath=following-sibling::div[contains(@class,"RecommendDisplay_wrap")][1]',
    );
    const similarHeading = recommendation.getByRole('heading', { name: '방금 본 상품과 비슷한 상품', exact: true });
    await expect(async () => {
      if (!await similarHeading.isVisible()) {
        await this.page.evaluate(() => window.scrollBy(0, Math.max(window.innerHeight * 0.8, 600)));
        await this.page.waitForTimeout(300);
      }
      await expect(similarHeading, '방문한 상품 아래에 유사 상품 추천 구좌가 노출되어야 한다')
        .toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 20_000, intervals: [300] });
    await similarHeading.scrollIntoViewIfNeeded();
    const similarProducts = recommendation.locator(PcLocators.main.searchResults);
    await expect(similarProducts.first(), '유사 상품 추천 구좌에 상품이 한 개 이상 있어야 한다')
      .toBeVisible({ timeout: 15_000 });
    await this.page.waitForTimeout(2_000);
    return { productId: productId!, productName, similarProductCount: await similarProducts.count() };
  }

  /** 상품 상세 페이지 이동 확인 */
  async isProductDetailPage(): Promise<boolean> {
    return this.urlContains(PcLocators.urls.productDetail);
  }

  /** 랭킹 1위 방문 후 오른쪽 최근 상품과 추천 구좌의 최근 본 상품 태그를 대조한다. */
  async verifyRecentlyViewedRecommendation() {
    const alphaHome = new URL('/', this.page.url());
    alphaHome.searchParams.set('currentChannel', 'alpha');
    await this.goToUrl(alphaHome.href);
    await this.closeModal();

    const category = this.page.getByRole('button', { name: '카테고리', exact: true }).filter({ visible: true }).first();
    await expect(category).toBeVisible();
    await category.click();
    const ranking = this.page.locator(PcLocators.main.categoryRanking)
      .filter({ has: this.page.getByRole('heading', { name: '랭킹', exact: true, level: 2 }) });
    await expect(ranking, '카테고리의 랭킹 구좌가 노출되어야 한다').toBeVisible();
    const rankOne = ranking.locator(PcLocators.main.recentlyViewedProduct).filter({
      has: this.page.locator(PcLocators.main.productRank).filter({ hasText: /^1$/ }),
    });
    await expect(rankOne, '랭킹 1위 상품이 하나 있어야 한다').toHaveCount(1);
    const viewedProductId = await rankOne.getAttribute('data-product-id');
    expect(viewedProductId, '랭킹 1위 상품 ID').toMatch(/^\d+$/);
    const viewedProductName = (await rankOne.locator(PcLocators.main.searchProductTitle).innerText()).trim();
    await rankOne.locator(PcLocators.main.searchProduct).click();
    await expect(this.page).toHaveURL(url => url.pathname === `/display/product/${viewedProductId}`);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page.locator(PcLocators.product.productName), '랭킹 1위 상품 상세가 로딩되어야 한다')
      .toContainText(viewedProductName, { timeout: 15_000 });
    const detailImages = this.page.locator('main img').filter({ visible: true });
    await expect(detailImages.first(), '랭킹 1위 상품 상세 이미지가 노출되어야 한다').toBeVisible({ timeout: 15_000 });
    await expect.poll(async () => detailImages.evaluateAll(images => images.length > 0 && images.every(element => {
      const image = element as HTMLImageElement;
      return image.complete && image.naturalWidth > 0;
    })), { message: '랭킹 1위 상품 상세 이미지가 모두 로딩되어야 한다', timeout: 15_000 }).toBe(true);
    await this.page.waitForTimeout(2_000);

    await this.goToUrl(alphaHome.href);
    await this.closeModal();
    const quickRecentImage = this.page.locator(PcLocators.main.recentQuickList).locator('li img').first();
    await expect(quickRecentImage, '오른쪽 최근 본 상품의 첫 번째 상품이 노출되어야 한다').toBeVisible();
    await expect(quickRecentImage, '방문한 랭킹 1위 상품이 최근 본 상품 첫 번째에 표시되어야 한다')
      .toHaveAttribute('alt', viewedProductName, { timeout: 15_000 });

    const heading = this.page.getByRole('heading', { name: '최근 본 상품과 비슷한 상품이에요', exact: true });
    await expect(async () => {
      if (!await heading.isVisible()) {
        await this.page.evaluate(() => window.scrollBy(0, Math.max(window.innerHeight * 0.8, 600)));
        await this.page.waitForTimeout(300);
      }
      await expect(heading).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 20_000, intervals: [300] });
    const section = heading.locator('xpath=ancestor::div[contains(@class,"displayWrap")][1]');
    await expect(section, '최근 본 상품 추천 구좌가 노출되어야 한다').toBeVisible();
    const card = section.locator(PcLocators.main.recentlyViewedProduct).filter({
      has: this.page.locator(PcLocators.main.recentlyViewedBadge).filter({ hasText: /^최근 본 상품$/ }),
    });
    await expect(card, '최근 본 상품 태그가 붙은 상품이 하나 있어야 한다').toHaveCount(1);
    await expect(card).toHaveAttribute('data-product-id', viewedProductId!);
    await expect(card.locator(PcLocators.main.searchProductTitle)).toContainText(viewedProductName);
    return { viewedProductId: viewedProductId!, viewedProductName };
  }

  /** 83번에서 확인한 최근 본 상품 태그 카드를 클릭해 상세 화면을 확인한다. */
  async openRecentlyViewedRecommendation(product: { viewedProductId: string; viewedProductName: string }) {
    const heading = this.page.getByRole('heading', { name: '최근 본 상품과 비슷한 상품이에요', exact: true });
    await expect(heading).toBeVisible();
    const section = heading.locator('xpath=ancestor::div[contains(@class,"displayWrap")][1]');
    const card = section.locator(`${PcLocators.main.recentlyViewedProduct}[data-product-id="${product.viewedProductId}"]`).filter({
      has: this.page.locator(PcLocators.main.recentlyViewedBadge).filter({ hasText: /^최근 본 상품$/ }),
    });
    const target = card.locator(PcLocators.main.searchProduct);
    await expect(target, '최근 본 상품 상세 이동 버튼이 있어야 한다').toBeVisible();
    await target.click();
    await expect(this.page).toHaveURL(url => url.pathname === `/display/product/${product.viewedProductId}`);
    await expect(this.page.locator(PcLocators.product.productName), '추천 상품 상세 화면이 로딩되어야 한다')
      .toContainText(product.viewedProductName, { timeout: 15_000 });
    await this.page.waitForTimeout(2_000);
    return { productId: product.viewedProductId, productName: product.viewedProductName, url: this.page.url() };
  }

  /** 상품 상세의 묶음 배송 상품 화면을 확인하고 복귀 후 비슷한 상품 추천 구좌를 검증한다. */
  async verifyBundleShippingAndSimilarProducts(product: { viewedProductId: string; viewedProductName: string }) {
    await expect(this.page).toHaveURL(url => url.pathname === `/display/product/${product.viewedProductId}`);
    const bundleButton = this.page.getByRole('button', { name: '묶음 배송 상품보기', exact: true });
    await bundleButton.scrollIntoViewIfNeeded();
    await expect(bundleButton).toBeVisible();
    await bundleButton.click();

    const bundleHeading = this.page.getByRole('heading', { name: '묶음 배송 BEST 상품', exact: true, level: 3 });
    await expect(bundleHeading, '묶음 배송 상품 화면이 노출되어야 한다').toBeVisible({ timeout: 15_000 });
    const bundleSection = bundleHeading.locator('xpath=ancestor::div[contains(@class,"BundleProduct_topLineBox")][1]');
    const bundleProducts = bundleSection.locator(PcLocators.main.recentlyViewedProduct);
    const bundleProductCount = await bundleProducts.count();
    expect(bundleProductCount, '묶음 배송 상품이 한 개 이상 있어야 한다').toBeGreaterThan(0);
    await expect(bundleProducts.first()).toBeVisible();
    await this.page.waitForTimeout(2_000);

    await this.page.goBack();
    await expect(this.page).toHaveURL(url => url.pathname === `/display/product/${product.viewedProductId}`);
    await expect(this.page.locator(PcLocators.product.productName), '기존 상품 상세로 돌아와야 한다')
      .toContainText(product.viewedProductName, { timeout: 15_000 });
    await bundleButton.scrollIntoViewIfNeeded();
    await expect(bundleButton).toBeVisible();

    const similarHeading = this.page.getByRole('heading', { name: '비슷한 상품을 추천해요!', exact: true, level: 3 });
    await expect(async () => {
      if (!await similarHeading.isVisible()) {
        await this.page.evaluate(() => window.scrollBy(0, Math.max(window.innerHeight * 0.8, 600)));
        await this.page.waitForTimeout(300);
      }
      await expect(similarHeading).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 20_000, intervals: [300] });
    await similarHeading.scrollIntoViewIfNeeded();
    const similarSection = similarHeading.locator('xpath=ancestor::div[contains(@class,"ProductSwiperList_wrap")][1]');
    const similarProducts = similarSection.locator(PcLocators.main.recentlyViewedProduct);
    const similarProductCount = await similarProducts.count();
    expect(similarProductCount, '비슷한 추천 상품이 한 개 이상 있어야 한다').toBeGreaterThan(0);
    await expect(similarProducts.first()).toBeVisible();
    await this.page.waitForTimeout(2_000);
    return { bundleProductCount, similarProductCount };
  }

  /** 카테고리 상품 상세 방문 후 카테고리 메인의 개인화 추천 구좌를 확인한다. */
  async verifyCategoryRecommendationAfterProductVisit() {
    const alphaHome = new URL('/', this.page.url());
    alphaHome.searchParams.set('currentChannel', 'alpha');
    await this.goToUrl(alphaHome.href);
    await this.closeModal();

    const openCategory = async () => {
      const button = this.page.getByRole('button', { name: '카테고리', exact: true }).filter({ visible: true }).first();
      await expect(button).toBeVisible();
      await button.click();
      await expect(this.page.locator('[class*="Category_categoryList"] a').first(), '상세 카테고리가 노출되어야 한다')
        .toBeVisible();
    };

    await openCategory();
    const category = this.page.locator('[class*="Category_categoryList"] a').first();
    const categoryName = (await category.locator('[class*="Category_title"]').innerText()).trim();
    await category.click();
    const categoryHeading = this.page.getByRole('heading', { name: new RegExp(`${categoryName} BEST 100`), level: 2 });
    await expect(categoryHeading, '선택한 상세 카테고리 상품 목록이 노출되어야 한다').toBeVisible({ timeout: 15_000 });
    const categoryPage = this.page.locator('[class*="CategoryPage_wrap"]');
    const product = categoryPage.locator(PcLocators.main.recentlyViewedProduct).first();
    await expect(product, '상세 카테고리에 상품이 있어야 한다').toBeVisible();
    const productId = await product.getAttribute('data-product-id');
    expect(productId, '카테고리 상품 ID').toMatch(/^\d+$/);
    const productName = (await product.locator(PcLocators.main.searchProductTitle).innerText()).trim();
    await product.locator(PcLocators.main.searchProduct).click();
    await expect(this.page).toHaveURL(url => url.pathname === `/display/product/${productId}`);
    const detailImages = this.page.locator('main img').filter({ visible: true });
    await expect(detailImages.first(), '카테고리 상품 상세 이미지가 노출되어야 한다').toBeVisible({ timeout: 15_000 });
    await expect.poll(async () => detailImages.evaluateAll(images => images.length > 0 && images.every(element => {
      const image = element as HTMLImageElement;
      return image.complete && image.naturalWidth > 0;
    })), { message: '카테고리 상품 상세 이미지가 모두 로딩되어야 한다', timeout: 15_000 }).toBe(true);
    await this.page.waitForTimeout(2_000);

    await this.page.goBack();
    await expect(categoryHeading, '선택했던 상세 카테고리 화면으로 돌아와야 한다').toBeVisible({ timeout: 15_000 });
    await openCategory();
    const recommendationHeading = this.page.getByRole('heading', { name: '당신을 위한 추천 상품', exact: true, level: 2 });
    await expect(async () => {
      if (!await recommendationHeading.isVisible()) {
        await this.page.evaluate(() => window.scrollBy(0, Math.max(window.innerHeight * 0.8, 600)));
        await this.page.waitForTimeout(300);
      }
      await expect(recommendationHeading).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 20_000, intervals: [300] });
    await recommendationHeading.scrollIntoViewIfNeeded();
    const recommendation = recommendationHeading.locator('xpath=ancestor::div[contains(@class,"Category_recommend")][1]');
    const recommendedProducts = recommendation.locator(PcLocators.main.recentlyViewedProduct);
    await expect(recommendedProducts.first(), '당신을 위한 추천 상품이 한 개 이상 노출되어야 한다')
      .toBeVisible({ timeout: 20_000 });
    const recommendationCount = await recommendedProducts.count();
    expect(recommendationCount, '당신을 위한 추천 상품이 한 개 이상 있어야 한다').toBeGreaterThan(0);
    const images = recommendedProducts.locator('img').filter({ visible: true });
    await expect(images.first(), '추천 상품 이미지가 노출되어야 한다').toBeVisible();
    await expect.poll(async () => images.evaluateAll(items => items.length > 0 && items.every(element => {
      const image = element as HTMLImageElement;
      return image.complete && image.naturalWidth > 0;
    })), { message: '추천 상품 이미지가 로딩되어야 한다', timeout: 15_000 }).toBe(true);
    await this.page.waitForTimeout(2_000);
    return { categoryName, productId: productId!, productName, recommendationCount };
  }

  /** 편성표 TV·TV+ 탭별 현재 방송 상품 상단 노출을 확인한다. */
  async verifyScheduleChannelTabs() {
    await this.goToHome();
    await this.page.locator(PcLocators.main.onAirDisplay).locator(PcLocators.main.onAirSchedule).click();
    await expect(this.page).toHaveURL(url => url.searchParams.get('gnbMenuId') === 'G000000002');
    const tabs = this.page.locator(PcLocators.main.scheduleChannelTabs);
    await expect(tabs, '편성표에 TV와 TV+ 탭이 있어야 한다').toHaveCount(2);
    const results = [];
    for (const name of ['TV', 'TV+']) {
      const tab = tabs.filter({ hasText: new RegExp(`^${name.replace('+', '\\+')}$`) });
      await expect(tab, `${name} 탭이 노출되어야 한다`).toBeVisible();
      await tab.click();
      const live = this.page.locator(PcLocators.main.liveBroadcast).first();
      await expect(live, `${name} 탭의 지금 방송 중 영역이 노출되어야 한다`).toBeVisible({ timeout: 15_000 });
      await live.scrollIntoViewIfNeeded();
      await expect(live).toBeInViewport();
      const title = live.locator(PcLocators.main.liveProduct).first().locator(PcLocators.main.liveProductTitle);
      await expect(title, `${name} 탭의 현재 방송 상품이 노출되어야 한다`).toBeVisible();
      await expect(title).toHaveText(/\S/);
      results.push({ tab: name, productName: (await title.innerText()).trim() });
    }
    await this.page.waitForTimeout(2_000);
    return results;
  }

  /** 혜택/이벤트의 혜택&기획전으로 이동한다. */
  async verifyBenefitSpecialPlan() {
    await this.goToBenefitsPage();
    const benefitUrl = this.page.url();

    const heading = this.page.getByRole('heading', { name: '지금 주목할 혜택&기획전', exact: true });
    await expect(heading, '지금 주목할 혜택&기획전 구좌가 노출되어야 한다').toBeVisible({ timeout: 15_000 });
    await heading.scrollIntoViewIfNeeded();
    const section = heading.locator('xpath=ancestor::div[contains(@class,"displayWrap")][1]');
    const target = section.locator('.swiper-slide-active a[class*="ImageBanner_item"]').filter({ visible: true }).first();
    await expect(target, '현재 활성화된 혜택&기획전 배너가 노출되어야 한다').toBeVisible();
    const bannerName = await target.locator('img').getAttribute('alt');
    expect(bannerName, '기획전 배너명').toBeTruthy();
    await target.click();
    await expect(heading, '기획전 배너 클릭 후 기존 혜택 페이지를 벗어나야 한다').toBeHidden({ timeout: 15_000 });
    const main = this.page.locator('main');
    await expect(main, '기획 페이지 본문이 노출되어야 한다').toBeVisible({ timeout: 15_000 });
    await expect(main).not.toBeEmpty();
    await this.page.waitForTimeout(2_000);
    return { benefitUrl, specialPlanUrl: this.page.url(), bannerName: bannerName! };
  }

  /** 혜택/이벤트의 오늘의 혜택 배너를 통해 기획전으로 이동한다. */
  async verifyTodayBenefit() {
    await this.goToBenefitsPage();
    const benefitUrl = this.page.url();
    const section = this.page.locator('main .today-benefit-wrap');
    await expect(async () => {
      if (!await section.isVisible()) {
        await this.page.evaluate(() => window.scrollBy(0, Math.max(window.innerHeight * 0.8, 600)));
        await this.page.waitForTimeout(300);
      }
      await expect(section.getByText('오늘의 혜택', { exact: true })).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 30_000, intervals: [300] });
    await section.scrollIntoViewIfNeeded();

    const target = section.locator('a.today-benefit-banner').first();
    await expect(target, '오늘의 혜택 배너가 노출되어야 한다').toBeVisible();
    await target.scrollIntoViewIfNeeded();
    await expect(target).toBeInViewport();
    const title = target.locator('.today-benefit-title');
    const benefitText = await title.isVisible() ? await title.innerText() : await target.innerText();
    const benefitName = benefitText.replace(/\s+/g, ' ').trim();
    const image = target.locator('img');
    await expect.poll(() => image.evaluate(img => (img as HTMLImageElement).naturalWidth),
      { message: '오늘의 혜택 배너 이미지가 로딩되어야 한다' }).toBeGreaterThan(0);
    await target.click();

    await expect(this.page, '오늘의 혜택 기획전으로 이동해야 한다').not.toHaveURL(benefitUrl);
    await expect(this.page).toHaveURL(url => url.pathname.includes('/display/specialplan/detail'));
    const main = this.page.locator('main');
    await expect(main, '기획전 본문이 노출되어야 한다').toBeVisible({ timeout: 15_000 });
    await expect(main).not.toBeEmpty();
    await this.page.waitForTimeout(2_000);
    return { benefitUrl, specialPlanUrl: this.page.url(), benefitName };
  }

  /** 혜택/이벤트의 이달의 카드 혜택 페이지로 이동한다. */
  async verifyMonthlyCardBenefits() {
    await this.goToBenefitsPage();
    const benefitUrl = this.page.url();
    const heading = this.page.getByRole('heading', { name: '이달의 카드 혜택', exact: true });
    await expect(async () => {
      if (!await heading.isVisible()) {
        await this.page.evaluate(() => window.scrollBy(0, Math.max(window.innerHeight * 0.8, 600)));
        await this.page.waitForTimeout(300);
      }
      await expect(heading).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 30_000, intervals: [300] });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeInViewport();

    const section = heading.locator('xpath=ancestor::div[@data-dp-crn-no="0011"][1]');
    const cards = section.locator('button[class*="BenefitIconSwiper_item"]');
    const cardCount = await cards.count();
    expect(cardCount, '카드 혜택이 한 개 이상 노출되어야 한다').toBeGreaterThan(0);
    await expect(cards.first()).toBeVisible();
    const images = cards.locator('img');
    await expect(images, '노출된 카드마다 이미지가 있어야 한다').toHaveCount(cardCount);
    await expect.poll(() => images.evaluateAll(items => items.every(item => {
      const image = item as HTMLImageElement;
      return image.complete && image.naturalWidth > 0;
    })), { message: '카드 혜택 이미지가 모두 로딩되어야 한다' }).toBe(true);

    const target = cards.filter({ visible: true }).first();
    await target.scrollIntoViewIfNeeded();
    await expect(target).toBeInViewport();
    await target.click();
    await expect(this.page, '카드 혜택 페이지로 이동해야 한다').not.toHaveURL(benefitUrl);
    await expect(this.page).toHaveURL(url => url.pathname.includes('/display/specialplan/'));
    const main = this.page.locator('main');
    await expect(main, '카드 혜택 페이지 본문이 노출되어야 한다').toBeVisible({ timeout: 15_000 });
    await expect(main).not.toBeEmpty();
    await this.page.waitForTimeout(2_000);
    return { cardCount, cardBenefitUrl: this.page.url() };
  }

  /** 혜택/이벤트의 쇼핑 TIP 프로모션 페이지로 이동한다. */
  async verifyShoppingTipPromotion() {
    await this.goToBenefitsPage();
    const benefitUrl = this.page.url();
    const heading = this.page.getByRole('heading', { name: '알아두면 좋은 쇼핑 TIP', exact: true });
    await expect(async () => {
      if (!await heading.isVisible()) {
        await this.page.evaluate(() => window.scrollBy(0, Math.max(window.innerHeight * 0.8, 600)));
        await this.page.waitForTimeout(300);
      }
      await expect(heading).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 30_000, intervals: [300] });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeInViewport();

    const section = heading.locator('xpath=ancestor::div[@data-dp-crn-no="0022"][1]');
    const cards = section.locator('button[class*="StackedCardBanner_card"]');
    await expect(cards, '쇼핑 TIP 3개가 노출되어야 한다').toHaveCount(3);
    const tipCount = await cards.count();
    const images = cards.locator('img');
    await expect(images).toHaveCount(3);
    await expect.poll(() => images.evaluateAll(items => items.every(item => {
      const image = item as HTMLImageElement;
      return image.complete && image.naturalWidth > 0;
    })), { message: '쇼핑 TIP 이미지가 모두 로딩되어야 한다' }).toBe(true);

    const target = cards.filter({ visible: true }).first();
    const tipName = (await target.locator('[class*="StackedCardBanner_title"]').innerText()).trim();
    await target.scrollIntoViewIfNeeded();
    await expect(target).toBeInViewport();
    await target.click();
    await expect(this.page, '쇼핑 TIP 프로모션 페이지로 이동해야 한다').not.toHaveURL(benefitUrl);
    await expect(this.page).toHaveURL(url => url.pathname.includes('/display/specialplan/'));
    const main = this.page.locator('main');
    await expect(main, '쇼핑 TIP 프로모션 본문이 노출되어야 한다').toBeVisible({ timeout: 15_000 });
    await expect(main).not.toBeEmpty();
    await this.page.waitForTimeout(2_000);
    return { tipCount, tipName, promotionUrl: this.page.url() };
  }
}
