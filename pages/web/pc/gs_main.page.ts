import { BasePage } from '../../common/BasePage';
import { PcLocators } from './locators';

export class GsMainPage extends BasePage {

  /** GNB 전체 순회 - 각 항목 클릭 후 main 영역 노출 여부 반환 */
  async isAllNavItemsVisible(): Promise<{ index: number; isVisible: boolean }[]> {
    const count = await this.count(PcLocators.main.navItems);
    const results: { index: number; isVisible: boolean }[] = [];

    for (let i = 0; i < count; i++) {
      await this.nthClick(PcLocators.main.navItems, i);
      if (i === 2) await this.closeModal();
      const isVisible = await this.isVisible(PcLocators.main.mainArea);
      results.push({ index: i, isVisible });
    }

    return results;
  }

  /** 카테고리 버튼 클릭 */
  async clickCategoryButton() {
    await this.click(PcLocators.main.categoryButton);
  }

  /** 카테고리 1depth(기프티쇼) 클릭 */
  async clickGiftShowOneDepth() {
    await this.click(PcLocators.giftShowMain.giftShowOneDepthButton);
  }

  /** 카테고리 2depth 랜덤 클릭 */
  async clickCategoryTwoDepth() {
    const count = await this.count(PcLocators.main.categoryTwoDepthButton);
    const randomNum = this.getRandomIndex(count);
    await this.nthClick(PcLocators.main.categoryTwoDepthButton, randomNum);
  }

  /** 기프트쇼 3depth 랜덤 클릭 */
  async clickGiftShowThreeDepth() {
    const count = await this.count(PcLocators.giftShowMain.giftShowThreeDepthButton);
    const randomNum = this.getRandomIndex(count - 1);
    await this.nthClick(PcLocators.giftShowMain.giftShowThreeDepthButton, randomNum);
    await this.wait(3);
  }

  /** 첫번째 필터 클릭 */
  async clickFirstFilterButton() {
    await this.click(PcLocators.main.firstFilterButton);
  }

  /** 필터 내 첫번째 버튼 클릭 */
  async clickFirstButtonInFilter() {
    await this.click(PcLocators.giftShowMain.firstButtonInFilter);
  }

  /** 상품보기 버튼 클릭 */
  async clickFilterSearchButton() {
    await this.click(PcLocators.giftShowMain.filterSearchButton);
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
