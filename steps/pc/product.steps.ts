import { BasePage } from '../../pages/common/BasePage';
import { ProductPage } from '../../pages/web/pc/product.page';
import { parameter } from '../../utils/step-runner';

export class ProductSteps {
  private productPage: ProductPage;
  private currentProduct?: { name: string; url: string };

  constructor(basePage: BasePage) {
    this.productPage = new ProductPage(basePage.getPage());
  }

  /** 개별 실행은 현재 방송 상품을 찾고, 통합 실행은 14번에서 선택한 상품을 재사용한다. */
  private async enterCurrentProduct(): Promise<string> {
    if (this.currentProduct) {
      await this.productPage.reopenProductDetail(this.currentProduct.url, this.currentProduct.name);
      return this.currentProduct.name;
    }
    const name = await this.productPage.openCurrentOnAirProduct();
    this.currentProduct = { name, url: this.productPage.getCurrentURL() };
    return name;
  }

  /** ON AIR > VOD 영상 재생 확인 */
  async verifyVOD(): Promise<boolean> {
    await this.enterCurrentProduct();
    await this.productPage.playVideo();
    return await this.productPage.isVideoPlaying();
  }

  /** 편성표 > 방송알림 신청 팝업 확인 및 등록 완료 확인 */
  async verifyBroadcastNotification(): Promise<boolean> {
    const currentProductName = await this.enterCurrentProduct();
    await this.productPage.goToHome();
    await this.productPage.clickBroadcastSchedule();
    const productName = await this.productPage.clickAlarmButton(currentProductName);
    const registrationRequired = await this.productPage.isBroadcastNotificationModalVisible();
    if (registrationRequired) {
      await this.productPage.disableTogetherNotification();
      await this.productPage.clickSmsConsentCheckbox();
      await this.productPage.clickBroadcastNotificationRegisterButton();
      await this.productPage.confirmBroadcastNotificationIfVisible();
    }
    await this.productPage.clickMyBroadcastNotificationButton();
    const registeredName = await this.productPage.getRegisteredBroadcastNotification(productName);

    await parameter('등록 상태', registrationRequired ? '신규 등록' : '기존 등록 확인');
    await parameter('등록 대상 방송명', productName);
    await parameter('등록 목록 방송명', registeredName ?? '없음');

    return registeredName !== null;
  }

  /** 상품 > 좋아요 추가 및 삭제 확인 */
  async verifyProductLike(): Promise<boolean> {
    await this.enterCurrentProduct();
    await this.productPage.clickProductLikeButton();
    await this.productPage.gotoLikePage();
    const likePageLikeButtonBefore = await this.productPage.isLikeButtonVisible();
    await this.productPage.clickLikePageLikeButton();
    const likePageLikeButtonAfter = await this.productPage.isLikeButtonVisible();

    await parameter('마이페이지 > 좋아요 > 좋아요 버튼(클릭 전)', `${likePageLikeButtonBefore}`);
    await parameter('마이페이지 > 좋아요 > 좋아요 버튼(클릭 후)', `${likePageLikeButtonAfter}`);

    return likePageLikeButtonBefore && !likePageLikeButtonAfter;
  }

  /** 상품 > 상세정보 탭 노출 확인 */
  async verifyProductDetailInfo(): Promise<boolean> {
    await this.enterCurrentProduct();
    await this.productPage.clickProductDetailInfoTab();
    return await this.productPage.isProductDetailInfoVisible();
  }

  /** 상품 > 구매정보 탭 노출 확인 */
  async verifyProductBuyInfo(): Promise<boolean> {
    await this.enterCurrentProduct();
    await this.productPage.clickProductBuyInfoTab();
    return await this.productPage.isProductBuyInfoVisible();
  }

  /** 상품 > 상품평 탭 노출 확인 */
  async verifyProductReview(): Promise<boolean> {
    await this.enterCurrentProduct();
    await this.productPage.clickProductReviewTab();
    return await this.productPage.isProductReviewVisible();
  }

  /** 상품 > 상품문의 탭 노출 확인 */
  async verifyProductQna(): Promise<boolean> {
    await this.enterCurrentProduct();
    await this.productPage.clickProductQnaTab();
    return await this.productPage.isProductQnaVisible();
  }

  /** 상품 > 선물하기 주문서 이동 확인 */
  async verifyProductGift(): Promise<boolean> {
    await this.enterCurrentProduct();
    await this.productPage.clickProductGift();
    return await this.productPage.isGiftOrderPage();
  }

  /** 상품 > 장바구니 상품 추가 확인 */
  async verifyProductCart(): Promise<boolean> {
    await this.enterCurrentProduct();
    const productName = await this.productPage.getProductName();
    const clicked = await this.productPage.clickProductCart();
    if (!clicked) {
      await parameter('메인페이지 > 상품 > 장바구니', '장바구니 버튼 없는 케이스');
      return true;
    }

    await this.productPage.clickProductCartMoveButton();
    const cartProductName = await this.productPage.getCartProductName();
    await this.productPage.clickCartDeleteButton();

    await parameter('상품명', productName);
    await parameter('장바구니 상품명', cartProductName);

    return cartProductName.includes(productName);
  }

  /** 상품 > 구매하기 주문서 이동 확인 */
  async verifyProductBuy(): Promise<boolean> {
    await this.enterCurrentProduct();
    await this.productPage.clickProductBuy();
    return await this.productPage.isBuyOrderPage();
  }
}
