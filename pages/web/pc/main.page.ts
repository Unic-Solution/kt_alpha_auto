import { BasePage } from '../../common/BasePage';
import { PcLocators } from './locators';

export class MainPage extends BasePage {

  /** GNB 전체 순회 - 각 항목 클릭 후 main 영역 노출 여부 반환 */
  async isAllNavItemsVisible(): Promise<{ index: number; isVisible: boolean }[]> {
    const count = await this.count(PcLocators.main.navItems);
    const results: { index: number; isVisible: boolean }[] = [];

    for (let i = 0; i < count; i++) {
      await this.nthClick(PcLocators.main.navItems, i);
      if (i === 3) await this.closeModal();
      const isVisible = await this.isVisible(PcLocators.main.mainArea);
      results.push({ index: i, isVisible });
    }

    return results;
  }

  /** 홈 > ON AIR(지금 방송중) 정상 노출 확인 */
  async isOnAirDisplayVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.main.onAirDisplay);
  }

  /** 홈 > ON AIR(지금 방송중) > 바로구매 버튼 클릭 */
  async clickDirectBuyButton() {
    await this.scrollIntoView(PcLocators.main.onAirDirectBuyButton);
    await this.clickFirstInViewport(PcLocators.main.onAirDirectBuyButton);
  }

  /** 홈 > ON AIR(지금 방송중) > 바로구매 > 옵션 선택 (중첩 옵션박스 대응) */
  async selectFirstEnabledOption() {
    let prevCount = 0;

    while (true) {
      await this.waitForElement(PcLocators.product.optionBox, 5).catch(() => {});
      const count = await this.count(PcLocators.product.optionBox);
      if (count === 0 || count === prevCount) return;
      prevCount = count;
      await this.clickFirstEnabled(PcLocators.main.onAirDirectBuyFirstOption);
      await this.clickFirstEnabled(PcLocators.main.onAirDirectBuySecondOption);
    }
  }

  /** 홈 > ON AIR(지금 방송중) > 바로구매 > 옵션 선택까지 수행 */
  async selectOnAirOption() {
    await this.goToHome();
    await this.clickDirectBuyButton();
    await this.selectFirstEnabledOption();
  }

  /** ON AIR > 선물하기 버튼 클릭 (버튼 없으면 false 반환) */
  async clickOnAirGiftButton(): Promise<boolean> {
    const exists = await this.isVisible(PcLocators.main.onAirGiftButton);
    if (!exists) return false;
    await this.click(PcLocators.main.onAirGiftButton);
    return true;
  }

  /** 선물하기 주문서 페이지 URL 확인 */
  async isGiftOrderPage(): Promise<boolean> {
    return this.urlContains(PcLocators.urls.onAirGiftOrder);
  }

  /** ON AIR 상품 이름 추출 */
  async getOnAirProductName(): Promise<string> {
    return (await this.getText(PcLocators.main.onAirProductName)).replace(/\s/g, '');
  }

  /** ON AIR > 장바구니 버튼 클릭 (버튼 없으면 false 반환) */
  async clickOnAirCartButton(): Promise<boolean> {
    const exists = await this.isVisible(PcLocators.main.onAirCartButton);

    if (!exists) return false;

    await this.click(PcLocators.main.onAirCartButton);
    return true;
  }

  /** ON AIR > 장바구니 > 바로가기 버튼 클릭 */
  async clickOnAirCartMoveButton() {
    await this.click(PcLocators.main.onAirCartMoveButton);
  }

  /** 장바구니 상품 이름 추출 */
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
    await this.click(PcLocators.main.onAirBuyButton);
  }

  /** 구매하기 주문서 페이지 URL 확인 */
  async isBuyOrderPage(): Promise<boolean> {
    return this.urlContains(PcLocators.urls.onAirBuyOrder);
  }

  /** 카테고리 버튼 클릭 */
  async clickCategoryButton() {
    await this.goToHome();
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
    await this.goToHome();
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

  /** 최근 본 상품 클릭 */
  async clickRecentlyViewedProduct() {
    await this.click(PcLocators.main.recentlyViewedProduct);
  }

  /** 검색어 입력 */
  async fillSearchInput(word: string) {
    await this.pressSequentially(PcLocators.main.searchInput, word)
    await this.click(PcLocators.main.searchSubmitButton);
  }

  /** 카테고리 상품 클릭 */
  async clickCategoryProduct() {
    await this.click(PcLocators.main.categoryProduct);
  }

  /** 뒤로가기 클릭 */
  async clickBackButton() {
    await this.click(PcLocators.main.backButton);
  }

  /** 추천 상품 클릭 */
  async clickRecommendProduct() {
    await this.click(PcLocators.main.recommendProduct);
  }

  /** 검색 추천 상품 클릭 */
  async clickSearchRecommendProduct() {
    await this.click(PcLocators.main.searchRecommendProduct);
  }

  /** 상품 영역으로 스크롤 */
  async scrollToProduct() {
    await this.scrollIntoView(PcLocators.main.productSection);
  }

  /** 상품 클릭 */
  async clickProduct() {
    await this.click(PcLocators.main.product);
  }

  /** 편성표 탭 클릭 */
  async clickScheduleTab() {
    await this.click(PcLocators.main.navItems);
  }

  /** '지금 방송 중' 문구 노출 확인 */
  async isOnAirTextVisible(): Promise<boolean> {
    return await this.isVisible('text=지금 방송 중');
  }

  /** 편성표 > TV+ 탭 클릭 */
  async clickTvPlusTab() {
    await this.click(PcLocators.main.tvPlusTab);
  }

  /** 혜택/이벤트 탭 클릭 */
  async clickBenefitTab() {
    await this.goToHome();
    await this.click(PcLocators.main.benefitTab);
  }

  /** 헤더 텍스트 추출 */
  async getHeaderTitle(): Promise<string> {
    return await this.getText(PcLocators.main.benefitTitle);
  }

  /** 혜택/이벤트 > 신규가입 혜택 클릭 */
  async clickNewSignBenefitTab() {
    await this.clickUntilURLChanges(PcLocators.main.newSignBenefitTab);
  }

  /** 혜택/이벤트 > 이달의 선물 클릭 */
  async clickMonthGiftTab() {
    await this.clickUntilURLChanges(PcLocators.main.monthGiftTab);
  }

  /** 혜택/이벤트 > 멤버십 혜택 클릭 */
  async clickMembershipBenefitTab() {
    await this.clickUntilURLChanges(PcLocators.main.membershipBenefitTab);
  }

  /** 혜택/이벤트 > 수신동의 쿠폰팩 클릭 */
  async clickAgreeReceiveTab() {
    await this.clickUntilURLChanges(PcLocators.main.agreeReceiveTab);
  }
}
