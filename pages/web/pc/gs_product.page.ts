import { BasePage } from '../../common/BasePage';
import { PcLocators } from './locators';

export class GsProductPage extends BasePage {

  /** 홈으로 이동 후 임의 상품 클릭 */
  async clickProduct() {
    await this.clickGiftShowButton();
    await this.click(PcLocators.giftShowProduct.giftProduct);
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

  /** 상품 > 선물하기 버튼 클릭 */
  async clickProductGift() {
    await this.click(PcLocators.main.onAirGiftButton);
  }

  /** 선물하기 주문서 페이지 URL 확인 */
  async isGiftOrderPage(): Promise<boolean> {
    return this.urlContains(PcLocators.urls.giftShowGiftOrder);
  }

  /** 선물하기 > 기프티쇼 대표 번호 버튼 클릭 */
  async clickGiftShowMainPhoneNumberButton() {
    await this.click(PcLocators.giftShowProduct.giftShowMainPhoneNumberButton);
  }

  /** 선물하기 > 보내는 사람 input 비어있는지 확인 */
  async isSenderInputEmpty(): Promise<boolean> {
    return await this.isEmpty(PcLocators.giftShowProduct.senderInput);
  }

  /** 선물하기 > 보내는 사람 input 입력 및 정상 입력 여부 확인 */
  async fillAndGetText(name: string): Promise<string> {
    await this.pressSequentially(PcLocators.giftShowProduct.senderInput, name);
    return await this.getValue(PcLocators.giftShowProduct.senderInput);
  }

  /** 선물하기 > 내 번호 버튼 클릭 */
  async clickMyPhoneNumberButton() {
    await this.click(PcLocators.giftShowProduct.myPhoneNumberButton);
  }

  /** 선물하기 > 보내는 사람 input값 추출 */
  async getSenderInputValue(): Promise<string> {
    return await this.getValue(PcLocators.giftShowProduct.senderInput);
  }

  /** 선물하기 > 받는 사람 수 추출 */
  async extractTotalRecipients(): Promise<number | false> {
    const text = await this.getText(PcLocators.giftShowProduct.totalRecipients);
    return this.extractNumber(text);
  }

  /** 선물하기 > 결제 진행 버튼 클릭 */
  async clickPaymentButton() {
    await this.click(PcLocators.giftShowProduct.paymentButton);
  }

  /** 선물하기 > 받는 사람 휴대폰 번호 입력 */
  async fillRecipientPhoneNumber(phoneNumber: string) {
    await this.pressSequentially(PcLocators.giftShowProduct.recipientPhoneNumberInput, phoneNumber)
  }

  /** 선물하기 > 받는 사람 이름 입력 */
  async fillRecipientName(name: string) {
    await this.pressSequentially(PcLocators.giftShowProduct.recipientNameInput, name)
  }

  /** 상품 > 나에게 보내기 버튼 클릭 */
  async clickSendToMeButton() {
    await this.click(PcLocators.giftShowProduct.sendToMeButton);
  }

  /** 상품 > 나에게 보내기 버튼 클릭 */
  async reClickSendToMeButton() {
    await this.lastClick(PcLocators.giftShowProduct.sendToMeButton);
  }

  /** 상품 결제 주문서 페이지 URL 확인 */
  async isPaymentPage(): Promise<boolean> {
    return this.urlContains(PcLocators.urls.giftShowPaymentOrder);
  }
}
