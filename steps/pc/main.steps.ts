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
      parameter(`nav[${index}]`, isVisible ? 'visible' : 'not visible');
    }

    return results.every(({ isVisible }) => isVisible);
  }

  /** 홈 > ON AIR(지금 방송중) 상품 노출 확인 */
  async verifyOnAirModal(): Promise<boolean> {
    await this.mainPage.goToHome();
    return await this.mainPage.isOnAirDisplayVisible();
  }

  /** 홈 > ON AIR(지금 방송중) > 바로구매 > 선물하기 주문서 이동 확인 */
  async verifyOnAirGift(): Promise<boolean> {
    await this.mainPage.selectOnAirOption();
    const onAirProductName = await this.mainPage.getOnAirProductName();
    const clicked = await this.mainPage.clickOnAirGiftButton();
    if (!clicked) {
      parameter('메인페이지 > ON AIR > 바로구매 > 선물하기', '선물하기 버튼 없는 케이스');
      return true;
    }

    parameter('ON AIR 상품명', onAirProductName);
    
    return await this.mainPage.isGiftOrderPage();
  }

  /** 홈 > ON AIR(지금 방송중) > 바로구매 > 장바구니 상품 추가 확인 */
  async verifyOnAirCart(): Promise<boolean> {
    await this.mainPage.selectOnAirOption();
    const onAirProductName = await this.mainPage.getOnAirProductName();
    const clicked = await this.mainPage.clickOnAirCartButton();
    if (!clicked) {
      parameter('메인페이지 > ON AIR > 바로구매 > 장바구니', '장바구니 버튼 없는 케이스');
      return true;
    }

    await this.mainPage.clickOnAirCartMoveButton();
    const cartProductName = await this.mainPage.getCartProductName();
    await this.mainPage.clickCartDeleteButton();

    parameter('ON AIR 상품명', onAirProductName);
    parameter('장바구니 상품명', cartProductName);

    return cartProductName.includes(onAirProductName);
  }

  /** 홈 > ON AIR(지금 방송중) > 바로구매 > 구매하기 주문서 이동 확인 */
  async verifyOnAirBuy(): Promise<boolean> {
    await this.mainPage.selectOnAirOption();
    const onAirProductName = await this.mainPage.getOnAirProductName();
    await this.mainPage.clickOnAirBuyButton();

    parameter('ON AIR 상품명', onAirProductName);
    
    return await this.mainPage.isBuyOrderPage();
  }

  /** 카테고리 및 필터 기능 확인 */
  async verifyCategory(): Promise<boolean> {
    await this.mainPage.clickCategoryButton();
    await this.mainPage.clickHomeShoppingOneDepth();
    await this.mainPage.clickCategoryTwoDepth();
    await this.mainPage.clickHomeShoppingThreeDepth();
    const beforeQuantity = await this.mainPage.extractProductQuantity();
    await this.mainPage.clickFirstFilterButton();
    const afterQuantity = await this.mainPage.extractProductQuantity();

    parameter('필터 적용 전 상품 개수', `${beforeQuantity}`);
    parameter('필터 적용 후 상품 개수', `${afterQuantity}`);

    if (beforeQuantity === false || afterQuantity === false) return false;

    return beforeQuantity >= afterQuantity;
  }

  /** 검색 후 상품 상세 페이지 이동 확인 */
  async verifySearch(): Promise<boolean> {
    await this.mainPage.clickSearchButton();
    const popularWord = await this.mainPage.clickPopularWord();
    await this.mainPage.clickSearchProduct();

    parameter('선택한 인기 검색어', popularWord);
    parameter('상품 클릭 후 URL', this.mainPage.getCurrentURL());

    return await this.mainPage.isProductDetailPage();
  }

  /** 최근 본 상품 추천구좌 상품 및 페이지 이동 확인 */
  async verifyRecentlyViewedProductRecommend(): Promise<boolean> {
    await this.mainPage.goToHome();
    await this.mainPage.clickRecentlyViewedProduct();
    return await this.mainPage.isProductDetailPage();
  }

  /** 카테고리 추천구좌 상품 및 페이지 이동 확인 */
  async verifyCategoryRecommend(): Promise<boolean> {
    await this.mainPage.clickCategoryButton();
    await this.mainPage.clickHomeShoppingOneDepth();
    await this.mainPage.clickCategoryTwoDepth();
    await this.mainPage.clickHomeShoppingThreeDepth();
    await this.mainPage.clickCategoryProduct();
    await this.mainPage.clickBackButton();
    await this.mainPage.clickCategoryRecommendProduct();
    return await this.mainPage.isProductDetailPage();
  }

  /** 검색 추천구좌 상품 및 페이지 이동 확인 */
  async verifySearchRecommend(): Promise<boolean> {
    await this.mainPage.clickSearchButton();
    await this.mainPage.clickPopularWord();
    await this.mainPage.clickSearchRecommendProduct();
    return await this.mainPage.isProductDetailPage();
  }

  /** 편성표 > TV/TV+ 탭 변경 시 지금 방송중 상품 확인 */
  async verifyScheduleOnAir(): Promise<boolean> {
    await this.mainPage.goToHome();
    await this.mainPage.clickScheduleTab();
    const tvTab = await this.mainPage.isOnAirTextVisible();
    await this.mainPage.clickTvPlusTab();
    const tvPlusTab = await this.mainPage.isOnAirTextVisible();

    parameter('TV 탭 "지금 방송중" 문구 확인', `${tvTab}`)
    parameter('TV+ 탭 "지금 방송중" 문구 확인', `${tvPlusTab}`)

    return tvTab && tvPlusTab;
  }

  /** 혜택/이벤트 > 신규가입 혜택 페이지 이동 확인 */
  async verifyNewSignBenefit(): Promise<boolean> {
    await this.mainPage.clickBenefitTab();
    await this.mainPage.clickNewSignBenefitTab();
    const txt = await this.mainPage.getHeaderTitle();
    return txt.includes('신규가입')
  }

  /** 혜택/이벤트 > 이달의 선물 페이지 이동 확인 */
  async verifyMonthGift(): Promise<boolean> {
    await this.mainPage.clickBenefitTab();
    await this.mainPage.clickMonthGiftTab();
    const txt = await this.mainPage.getHeaderTitle();
    return txt.includes('이달의 선물')
  }

  /** 혜택/이벤트 > 멤버십 혜택 페이지 이동 확인 */
  async verifyMembershipBenefit(): Promise<boolean> {
    await this.mainPage.clickBenefitTab();
    await this.mainPage.clickMembershipBenefitTab();
    const txt = await this.mainPage.getHeaderTitle();
    return txt.includes('멤버십 혜택')
  }

  /** 혜택/이벤트 > 수신동의 쿠폰팩 페이지 이동 확인 */
  async verifyAgreeReceive(): Promise<boolean> {
    await this.mainPage.clickBenefitTab();
    await this.mainPage.clickAgreeReceiveTab();
    const txt = await this.mainPage.getHeaderTitle();
    return txt.includes('수신동의')
  }
}
