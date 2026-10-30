import { BasePage } from '../../pages/common/BasePage';
import { GsMainPage } from '../../pages/web/pc/gs_main.page';
import { parameter } from '../../utils/step-runner';

export class GsMainSteps {
  private gsMainPage: GsMainPage;

  constructor(basePage: BasePage) {
    this.gsMainPage = new GsMainPage(basePage.getPage());
  }

  /** 기프티쇼 GNB 메뉴별 화면 노출 확인 */
  async gsVerifyAllNavItems(): Promise<boolean> {
    await this.gsMainPage.clickGiftShowButton();
    const results = await this.gsMainPage.isAllNavItemsVisible();
  
    for (const { index, isVisible } of results) {
      await parameter(`nav[${index}]`, isVisible ? 'visible' : 'not visible');
    }

    return results.length > 0 && results.every(({ isVisible }) => isVisible);
  }

  /** 기프티쇼 카테고리 및 필터 기능 확인 */
  async gsVerifyCategory(): Promise<boolean> {
    await this.gsMainPage.clickGiftShowButton();
    await this.gsMainPage.clickCategoryButton();
    await this.gsMainPage.clickGiftShowOneDepth();
    await this.gsMainPage.clickCategoryTwoDepth();
    await this.gsMainPage.clickGiftShowThreeDepth();
    const beforeQuantity = await this.gsMainPage.extractProductQuantity();
    await this.gsMainPage.clickFirstFilterButton();
    await this.gsMainPage.clickFirstButtonInFilter();
    await this.gsMainPage.clickFilterSearchButton();
    const afterQuantity = await this.gsMainPage.extractProductQuantity();

    await parameter('필터 적용 전 상품 개수', `${beforeQuantity}`);
    await parameter('필터 적용 후 상품 개수', `${afterQuantity}`);

    if (beforeQuantity === false || afterQuantity === false) return false;

    return beforeQuantity >= afterQuantity;
  }

  /** 기프티쇼 검색 후 상품 상세 페이지 이동 확인 */
  async gsVerifySearch(): Promise<boolean> {
    await this.gsMainPage.clickGiftShowButton();
    await this.gsMainPage.clickSearchButton();
    const popularWord = await this.gsMainPage.clickPopularWord();
    await this.gsMainPage.clickSearchProduct();

    await parameter('선택한 인기 검색어', popularWord);
    await parameter('상품 클릭 후 URL', this.gsMainPage.getCurrentURL());

    return await this.gsMainPage.isProductDetailPage();
  }
}
