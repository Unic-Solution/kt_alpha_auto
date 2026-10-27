import { expect, test } from '@playwright/test';
import { BasePage } from '../../pages/common/BasePage';
import { MainPage } from '../../pages/web/pc/main.page';
import { parameter } from '../../utils/step-runner';

export class MainSteps {
  private mainPage: MainPage;

  constructor(basePage: BasePage) {
    this.mainPage = new MainPage(basePage.getPage());
  }

  /** GNB 메뉴별 화면 노출 확인 */
  async verifyAllNavItems(): Promise<boolean> {
    await this.mainPage.goToHome();
    const results = await this.mainPage.isAllNavItemsVisible();

    for (const { index, isVisible } of results) {
      await parameter(`nav[${index}]`, isVisible ? 'visible' : 'not visible');
    }

    return results.length > 0 && results.every(({ isVisible }) => isVisible);
  }

  /** 홈 > ON AIR(지금 방송중) 상품 노출 확인 */
  async verifyOnAirModal(): Promise<boolean> {
    await this.mainPage.goToHome();
    await this.mainPage.isOnAirDisplayVisible();
    const home = await this.mainPage.getOnAirProductInfo();
    parameter('홈 ON AIR 상품', JSON.stringify(home));
    console.log('[ON AIR] 홈 상품명·이미지 로딩·가격·방송 표시 확인:', home);
    const live = await this.mainPage.getLiveScheduleProductInfo(home.productId);
    parameter('편성표 현재 방송 상품', JSON.stringify(live));
    console.log('[ON AIR] 편성표 현재 방송 상품:', live);
    expect(live.productId, '현재 방송 상품 코드').toBe(home.productId);
    expect(live.name, '현재 방송 상품명').toBe(home.name);
    expect(live.amount, '현재 방송 상품 가격').toBe(home.amount);
    await this.mainPage.goToHome();
    await this.mainPage.isOnAirDisplayVisible();
    return true;
  }

  /** 홈 > ON AIR(지금 방송중) > 바로구매 > 선물하기 주문서 이동 확인 */
  async verifyOnAirGift(): Promise<boolean> {
    const product = await this.mainPage.selectOnAirOption();
    parameter('홈 ON AIR 상품', JSON.stringify(product));
    console.log('[선물하기] ON AIR 상품 및 옵션 선택 확인:', product);
    await this.mainPage.clickOnAirGiftButton();
    const passed = await this.mainPage.isGiftOrderPage(product.name);
    parameter('선물하기 주문서 URL', this.mainPage.getCurrentURL());
    console.log('[선물하기] 주문서 본문·상품 확인 완료');
    return passed;
  }

  /** 홈 > ON AIR(지금 방송중) > 바로구매 > 장바구니 상품 추가 확인 */
  async verifyOnAirCart(): Promise<boolean> {
    const product = await this.mainPage.selectOnAirOption();
    const selected = await this.mainPage.getSelectedCartOptions();
    const before = await this.mainPage.getCartSnapshot();
    // 같은 상품이 합산되는 경우 기존 항목을 변경하지 않고 먼저 중단한다.
    expect(before.some(item => item.name === product.name), '현재 방송 상품이 기존 장바구니에 없어야 한다').toBe(false);
    parameter('선택 상품·옵션·수량', JSON.stringify({ ...product, ...selected }));
    parameter('담기 전 장바구니', JSON.stringify(before));
    await this.mainPage.clickOnAirCartButton();
    await this.mainPage.clickOnAirCartMoveButton();
    const page = this.mainPage.getPage();
    await expect(page).toHaveURL(url => url.pathname === '/custord/basket');
    const after = await this.mainPage.readCartItems();
    const added = after.filter(item => !before.some(existing => existing.id === item.id));
    expect(added, '이번 실행으로 추가된 행은 정확히 1개여야 한다').toHaveLength(1);
    const item = added[0];
    try {
      expect(after.filter(row => row.id !== item.id), '기존 장바구니 항목 유지').toEqual(before);
      expect(item.name, '담긴 상품명').toBe(product.name);
      expect(item.quantity, '담긴 수량').toBe(selected.quantity);
      expect(item.options, '담긴 상품 옵션').toEqual(selected.options);
      expect(item.amount, '담긴 상품 금액').toBe(product.amount * selected.quantity);
      parameter('추가된 장바구니 항목', JSON.stringify(item));
      console.log('[장바구니] 상품·옵션·수량·금액 확인:', item);
      const screenshot = test.info().outputPath('cart-added.png');
      await page.screenshot({ path: screenshot });
      await test.info().attach('장바구니 추가 검증', { path: screenshot, contentType: 'image/png' });
      await this.mainPage.verifyCartProductId(item.id, product.productId);
    } finally {
      if (new URL(page.url()).pathname !== '/custord/basket') await page.goto(new URL('/custord/basket', page.url()).href);
      await this.mainPage.deleteAddedCartItem(item.id);
      expect(await this.mainPage.readCartItems(), '테스트 상품 삭제 후 기존 상태 복원').toEqual(before);
      console.log('[장바구니] 추가한 항목만 삭제하고 기존 상태 복원 완료');
    }
    return true;
  }

  /** 홈 > ON AIR(지금 방송중) > 바로구매 > 구매하기 주문서 이동 확인 */
  async verifyOnAirBuy(): Promise<boolean> {
    const product = await this.mainPage.selectOnAirOption(true);
    const selected = await this.mainPage.getSelectedCartOptions();
    parameter('상품 선택 경로', product.source);
    parameter('선택 상품·옵션·수량', JSON.stringify({ ...product, ...selected }));
    const route = await this.mainPage.clickOnAirBuyButton();
    parameter('주문서 진입 경로', route);
    const passed = await this.mainPage.isBuyOrderPage({ ...product, ...selected });
    parameter('주문서 경로', new URL(this.mainPage.getCurrentURL()).pathname);
    console.log('[구매하기] 주문서 본문·상품·옵션·수량·금액 확인:', route, { ...product, ...selected });
    return passed;
  }

  /** 체크리스트 6: 이전·다음 방송 노출, 편성표 대조 및 각 상품 상세 이동 */
  async verifyAdjacentBroadcasts(): Promise<boolean> {
    await this.mainPage.goToHome();
    const home = await this.mainPage.getAdjacentBroadcastCards();
    parameter('홈 이전·다음 방송', JSON.stringify(home));
    const page = this.mainPage.getPage();
    const screenshot = test.info().outputPath('adjacent-broadcasts.png');
    await page.screenshot({ path: screenshot });
    await test.info().attach('이전·다음 방송 구좌', { path: screenshot, contentType: 'image/png' });
    const schedule = await this.mainPage.getAdjacentScheduleProducts();
    expect(schedule, '홈 카드가 편성표의 실제 이전·다음 방송과 일치해야 한다')
      .toEqual(home.map(({ productId, name, time }) => ({ productId, name, time })));
    console.log('[이전·다음 방송] 편성표 이동 및 상품 코드·상품명·시각 일치 확인:', schedule);
    for (const card of home) {
      await this.mainPage.verifyAdjacentProductPage(card);
      parameter(card.direction + ' 상품 상세 경로', new URL(page.url()).pathname);
      console.log(`[${card.direction}] 상품 상세 이동 및 본문 확인: ${card.productId} ${card.name}`);
      const image = test.info().outputPath(`adjacent-product-${card.index}.png`);
      await page.screenshot({ path: image });
      await test.info().attach(card.direction + ' 상품 상세', { path: image, contentType: 'image/png' });
    }
    return true;
  }

  /** 카테고리 및 필터 기능 확인 */
  async verifyCategory(): Promise<boolean> {
    await this.mainPage.goToHome();
    await this.mainPage.clickCategoryButton();
    const result = await this.mainPage.verifyCategoryAndFilter();
    parameter('카테고리 경로', `${result.depth1Name} > ${result.depth2Name} > ${result.depth3Name}`);
    parameter('2depth 카테고리 ID', result.depth2Id!);
    parameter('필터 적용 전 상품 개수', `${result.beforeQuantity}`);
    parameter('검증한 필터', result.filters.join(', '));
    parameter('검증한 정렬', result.sorts.join(', '));
    parameter('최종 정렬 URL', result.url);
    console.log('[카테고리/필터]', result);
    return true;
  }

  /** 검색 후 상품 상세 페이지 이동 확인 */
  async verifySearch(): Promise<boolean> {
    await this.mainPage.goToHome();
    await this.mainPage.clickSearchButton();
    const popularWord = await this.mainPage.clickPopularWord();
    const product = await this.mainPage.clickSearchProduct();

    parameter('선택한 인기 검색어', popularWord);
    parameter('선택한 상품', `${product.productId} ${product.name}`);
    parameter('상품 클릭 후 URL', product.url);
    console.log('[인기 검색어/상품 상세]', { popularWord, ...product });
    return true;
  }
}
