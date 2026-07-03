import { BasePage } from '../../common/BasePage';
import { PcLocators } from './locators';

export class ProductPage extends BasePage {

  /** ON AIR 버튼 클릭 */
  async clickOnAirButton() {
    await this.click(PcLocators.main.onAirButton);
  }

  /** ON AIR > 비디오 재생 */
  async playVideo() {
    await this.click(PcLocators.product.onAirVideoPoster);
    await this.waitForAttribute(PcLocators.product.onAirVideo, 'autoplay');
  }

  /** 비디오 재생 여부 반환 (autoplay 속성 존재 여부) */
  async isVideoPlaying(): Promise<boolean> {
    return await this.getAttribute(PcLocators.product.onAirVideo, 'autoplay') !== null;
  }

  /** 편성표 탭 클릭 */
  async clickBroadcastSchedule() {
    await this.click(PcLocators.main.navItems);
  }

  /** 방송알림 버튼 클릭 */
  async clickAlarmButton() {
    await this.lastClick(PcLocators.product.alarmButton);
  }

  /** 광고성 SMS 수신 동의 체크박스 클릭 (없으면 스킵) */
  async clickSmsConsentCheckbox() {
    try {
      await this.click(PcLocators.product.smsConsentCheckbox);
    } catch {
      // 체크박스 없으면 스킵
    }
  }

  /** 방송 알림 등록하기 버튼 클릭 */
  async clickBroadcastNotificationRegisterButton() {
    await this.click(PcLocators.product.broadcastNotificationRegisterButton);
  }

  /** 방송 알림 등록 후 내 방송알림보기 버튼 클릭 */
  async clickMyBroadcastNotificationButton() {
    await this.click(PcLocators.product.myBroadcastNotificationButton);
  }

  /** 알림 해제 버튼 노출 여부 반환 */
  async isDisableNotificationButtonVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.product.disableNotificationButton);
  }

  /** 알림 해제 버튼 클릭 */
  async clickDisableNotificationButton() {
    await this.click(PcLocators.product.disableNotificationButton);
  }

  /** MD's Pick 상품 영역으로 스크롤 */
  async scrollToProduct() {
    await this.scrollIntoView(PcLocators.product.mdsPickSection);
  }

  /** 홈으로 이동 후 임의 상품 클릭 */
  async clickProduct() {
    await this.goToHome();
    await this.scrollToProduct();
    await this.click(PcLocators.product.mdsPickProduct, true);
  }

  /** 상품 > 좋아요(하트) 버튼 클릭 */
  async clickProductLikeButton() {
    await this.click(PcLocators.product.productLikeButton);
  }

  /** 마이페이지 > 좋아요 탭으로 이동 */
  async gotoLikePage() {
    await this.goToUrl(PcLocators.urls.myLikePage);
  }

  /** 마이페이지 > 좋아요 탭 > 좋아요 버튼 노출 여부 반환 */
  async isLikeButtonVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.product.likePageLikeButton);
  }

  /** 마이페이지 > 좋아요 탭 > 좋아요(하트) 버튼 클릭 */
  async clickLikePageLikeButton() {
    await this.click(PcLocators.product.likePageLikeButton);
    await this.waitForHidden(PcLocators.product.likePageLikeButton, 5).catch(() => {});
  }

  /** 상품 > 상세정보 탭 클릭 */
  async clickProductDetailInfoTab() {
    await this.click(PcLocators.product.productDetailInfoTab);
  }

  /** 상품 > 상세정보 노출 여부 반환 */
  async isProductDetailInfoVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.product.productDetailInfo);
  }

  /** 상품 > 구매정보 탭 클릭 */
  async clickProductBuyInfoTab() {
    await this.click(PcLocators.product.productBuyInfoTab);
  }

  /** 상품 > 구매정보 노출 여부 반환 */
  async isProductBuyInfoVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.product.productBuyInfo);
  }

  /** 상품 > 상품평 탭 클릭 */
  async clickProductReviewTab() {
    await this.click(PcLocators.product.productReviewTab);
  }

  /** 상품 > 상품평 노출 여부 반환 */
  async isProductReviewVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.product.productReview);
  }

  /** 상품 > 상품문의 탭 클릭 */
  async clickProductQnaTab() {
    await this.click(PcLocators.product.productQnaTab);
  }

  /** 상품 > 상품문의 노출 여부 반환 */
  async isProductQnaVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.product.productQna);
  }

  /** 옵션 선택 (중첩 옵션박스 대응) */
  async selectFirstEnabledOption() {
    let prevCount = 0;

    while (true) {
      const count = await this.count(PcLocators.product.optionBox);
      if (count === 0 || count === prevCount) return;
      prevCount = count;
      await this.clickFirstEnabled(PcLocators.main.onAirDirectBuyFirstOption);
    }
  }

  /** 상품 > 선물하기 버튼 클릭 (옵션 선택 포함) */
  async clickProductGift() {
    await this.click(PcLocators.main.onAirGiftButton, true);
    await this.selectFirstEnabledOption();
    await this.lastClick(PcLocators.main.onAirGiftButton);
  }

  /** 선물하기 주문서 페이지 URL 확인 */
  async isGiftOrderPage(): Promise<boolean> {
    return this.urlContains(PcLocators.urls.onAirGiftOrder);
  }

  /** 상품 이름 추출 */
  async getProductName(): Promise<string> {
    return (await this.getText(PcLocators.product.productName)).replace(/\s/g, '');
  }

  /** 상품 > 장바구니 버튼 클릭 (버튼 없으면 false 반환, 옵션 선택 포함) */
  async clickProductCart(): Promise<boolean> {
    const exists = await this.isVisible(PcLocators.main.onAirCartButton);

    if (!exists) return false;

    await this.click(PcLocators.main.onAirCartButton, true);
    await this.selectFirstEnabledOption();
    await this.lastClick(PcLocators.main.onAirCartButton);
    return true;
  }

  /** 상품 > 장바구니 > 바로가기 버튼 클릭 */
  async clickProductCartMoveButton() {
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

  /** 상품 > 구매하기 버튼 클릭 (옵션 선택 포함) */
  async clickProductBuy() {
    await this.click(PcLocators.main.onAirBuyButton, true);
    await this.selectFirstEnabledOption();
    await this.lastClick(PcLocators.main.onAirBuyButton);
  }

  /** 구매하기 주문서 페이지 URL 확인 */
  async isBuyOrderPage(): Promise<boolean> {
    return this.urlContains(PcLocators.urls.onAirBuyOrder);
  }
}
