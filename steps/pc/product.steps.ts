import { BasePage } from '../../pages/common/BasePage';
import { ProductPage } from '../../pages/web/pc/product.page';
import { parameter } from '../../utils/step-runner';

export class ProductSteps {
  private productPage: ProductPage;

  constructor(basePage: BasePage) {
    this.productPage = new ProductPage(basePage.getPage());
  }

  /** ON AIR > VOD 영상 재생 확인 */
  async verifyVOD(): Promise<boolean> {
    await this.productPage.goToHome();
    await this.productPage.clickOnAirButton();
    await this.productPage.playVideo();
    return await this.productPage.isVideoPlaying();
  }

  /** 편성표 > 방송알림 신청 팝업 확인 및 등록 완료 확인 */
  async verifyBroadcastNotification(): Promise<boolean> {
    await this.productPage.goToHome();
    await this.productPage.clickBroadcastSchedule();
    await this.productPage.clickAlarmButton();
    await this.productPage.clickSmsConsentCheckbox();
    await this.productPage.clickBroadcastNotificationRegisterButton();
    await this.productPage.clickMyBroadcastNotificationButton();
    const register = await this.productPage.isDisableNotificationButtonVisible();
    await this.productPage.clickDisableNotificationButton();
    await this.productPage.clickConfirmButton();

    parameter('방송알림 등록 완료', `${register}`);

    return register;
  }

  /** 상품 > 좋아요 추가 및 삭제 확인 */
  async verifyProductLike(): Promise<boolean> {
    await this.productPage.clickProduct();
    await this.productPage.clickProductLikeButton();
    await this.productPage.gotoLikePage();
    const likePageLikeButtonBefore = await this.productPage.isLikeButtonVisible();
    await this.productPage.clickLikePageLikeButton();
    const likePageLikeButtonAfter = await this.productPage.isLikeButtonVisible();

    parameter('마이페이지 > 좋아요 > 좋아요 버튼(클릭 전)', `${likePageLikeButtonBefore}`);
    parameter('마이페이지 > 좋아요 > 좋아요 버튼(클릭 후)', `${likePageLikeButtonAfter}`);

    return likePageLikeButtonBefore && !likePageLikeButtonAfter;
  }

  /** 상품 > 상세정보 탭 노출 확인 */
  async verifyProductDetailInfo(): Promise<boolean> {
    await this.productPage.clickProduct();
    await this.productPage.clickProductDetailInfoTab();
    return await this.productPage.isProductDetailInfoVisible();
  }

  /** 상품 > 구매정보 탭 노출 확인 */
  async verifyProductBuyInfo(): Promise<boolean> {
    await this.productPage.clickProduct();
    await this.productPage.clickProductBuyInfoTab();
    return await this.productPage.isProductBuyInfoVisible();
  }

  /** 상품 > 상품평 탭 노출 확인 */
  async verifyProductReview(): Promise<boolean> {
    await this.productPage.clickProduct();
    await this.productPage.clickProductReviewTab();
    return await this.productPage.isProductReviewVisible();
  }

  /** 상품 > 상품문의 탭 노출 확인 */
  async verifyProductQna(): Promise<boolean> {
    await this.productPage.clickProduct();
    await this.productPage.clickProductQnaTab();
    return await this.productPage.isProductQnaVisible();
  }

  /** 상품 > 선물하기 주문서 이동 확인 */
  async verifyProductGift(): Promise<boolean> {
    await this.productPage.clickProduct();
    const productName = await this.productPage.getProductName();
    parameter('상품명', productName);

    const clicked = await this.productPage.clickProductGift();
    if (!clicked) {
      parameter('상품 > 선물하기', '선물하기 버튼 없는 케이스');
      return true;
    }

    return await this.productPage.isGiftOrderPage();
  }

  /** 상품 > 장바구니 상품 추가 확인 */
  async verifyProductCart(): Promise<boolean> {
    await this.productPage.clickProduct();
    const productName = await this.productPage.getProductName();
    parameter('상품명', productName);

    const clicked = await this.productPage.clickProductCart();
    if (!clicked) {
      parameter('메인페이지 > 상품 > 장바구니', '장바구니 버튼 없는 케이스');
      return true;
    }

    await this.productPage.clickProductCartMoveButton();
    const cartProductName = await this.productPage.getCartProductName();
    parameter('장바구니 상품명', cartProductName);

    await this.productPage.clickCartDeleteButton();

    return cartProductName.includes(productName);
  }

  /** 장바구니 추천구좌 상품 및 페이지 이동 확인 */
  async verifyCartRecommendation(): Promise<boolean> {
    await this.productPage.clickCartRecommendProduct();
    return await this.productPage.isProductDetailPage();
  }

  /** 상품 > 구매하기 주문서 이동 확인 */
  async verifyProductBuy(): Promise<boolean> {
    await this.productPage.clickProduct();
    await this.productPage.clickProductBuy();
    return await this.productPage.isBuyOrderPage();
  }

  /** 상품 추천구좌 상품 및 페이지 이동 확인 */
  async verifyRecommendProduct(): Promise<boolean> {
    await this.productPage.clickProduct();
    await this.productPage.clickRecommendProduct();
    return await this.productPage.isProductDetailPage();
  }
}
