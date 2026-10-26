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

  /** ON AIR > 선물하기 버튼 클릭 */
  async clickOnAirGiftButton() {
    await this.click(PcLocators.main.onAirGiftButton);
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
