import { expect } from '@playwright/test';
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
    await this.mainPage.selectOnAirOption();
    await this.mainPage.clickOnAirGiftButton();
    return await this.mainPage.isGiftOrderPage();
  }

  /** 홈 > ON AIR(지금 방송중) > 바로구매 > 장바구니 상품 추가 확인 */
  async verifyOnAirCart(): Promise<boolean> {
    await this.mainPage.selectOnAirOption();
    const onAirProductName = await this.mainPage.getOnAirProductName();
    const clicked = await this.mainPage.clickOnAirCartButton();
    if (!clicked) {
      await parameter('메인페이지 > ON AIR > 바로구매 > 장바구니', '장바구니 버튼 없는 케이스');
      return true;
    }

    await this.mainPage.clickOnAirCartMoveButton();
    const cartProductName = await this.mainPage.getCartProductName();
    await this.mainPage.clickCartDeleteButton();

    await parameter('ON AIR 상품명', onAirProductName);
    await parameter('장바구니 상품명', cartProductName);

    return cartProductName.includes(onAirProductName);
  }

  /** 홈 > ON AIR(지금 방송중) > 바로구매 > 구매하기 주문서 이동 확인 */
  async verifyOnAirBuy(): Promise<boolean> {
    await this.mainPage.selectOnAirOption();
    await this.mainPage.clickOnAirBuyButton();
    return await this.mainPage.isBuyOrderPage();
  }

  /** 카테고리 및 필터 기능 확인 */
  async verifyCategory(): Promise<boolean> {
    await this.mainPage.goToHome();
    await this.mainPage.clickCategoryButton();
    await this.mainPage.clickHomeShoppingOneDepth();
    await this.mainPage.clickCategoryTwoDepth();
    await this.mainPage.clickHomeShoppingThreeDepth();
    const beforeQuantity = await this.mainPage.extractProductQuantity();
    await this.mainPage.clickFirstFilterButton();
    const afterQuantity = await this.mainPage.extractProductQuantity();

    await parameter('필터 적용 전 상품 개수', `${beforeQuantity}`);
    await parameter('필터 적용 후 상품 개수', `${afterQuantity}`);

    if (beforeQuantity === false || afterQuantity === false) return false;

    return beforeQuantity >= afterQuantity;
  }

  /** 검색 후 상품 상세 페이지 이동 확인 */
  async verifySearch(): Promise<boolean> {
    await this.mainPage.goToHome();
    await this.mainPage.clickSearchButton();
    const popularWord = await this.mainPage.clickPopularWord();
    await this.mainPage.clickSearchProduct();

    await parameter('선택한 인기 검색어', popularWord);
    await parameter('상품 클릭 후 URL', this.mainPage.getCurrentURL());

    return await this.mainPage.isProductDetailPage();
  }
}
